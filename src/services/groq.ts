import { ApostlePersona, ChatMessage } from '../types';
import { buildCompanionSystemPrompt, detectConversationMode, UserProfileMemory } from './companionEngine';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

export type UserProfileContext = UserProfileMemory;

interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateApostleReply = async (
  persona: ApostlePersona,
  conversationHistory: ChatMessage[],
  userPrompt: string,
  userProfile?: UserProfileContext
): Promise<string> => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is not set');
    }

    // 1. Detect Conversation Intent & Mode
    const mode = detectConversationMode(userPrompt);

    // 2. Build Multi-Layered Companion System Prompt with strict character boundaries
    const fullSystemPrompt = buildCompanionSystemPrompt(persona, userProfile, mode);

    const messages: MessagePayload[] = [
      { role: 'system', content: fullSystemPrompt }
    ];

    // 3. Include recent conversation history for continuity (last 8 turns)
    const recentTurns = conversationHistory.slice(-8);
    for (const msg of recentTurns) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // 4. Append current user message
    messages.push({ role: 'user', content: userPrompt });

    // Dynamic max_tokens depending on mode (short for greetings, natural for discussion)
    const maxTokens = mode === 'greeting' ? 60 : mode === 'casual' ? 120 : 280;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: messages,
        temperature: 0.72,
        max_tokens: maxTokens,
        top_p: 0.92,
        stream: false
      })
    });

    if (!response.ok) {
      // Fallback model retry
      const fallbackResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL,
          messages: messages,
          temperature: 0.72,
          max_tokens: maxTokens,
          top_p: 0.92,
          stream: false
        })
      });

      if (!fallbackResponse.ok) {
        throw new Error(`Groq API returned status ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return cleanReply(fallbackData.choices?.[0]?.message?.content || '');
    }

    const data = await response.json();
    return cleanReply(data.choices?.[0]?.message?.content || '');
  } catch (error) {
    console.error('Groq AI generation error:', error);
    if (userPrompt.trim().toLowerCase() === 'hi' || userPrompt.trim().toLowerCase() === 'hello') {
      return `Peace be with you, ${userProfile?.fullName || 'my friend'}! How are you feeling today?`;
    }
    return `Peace and grace be with you. I am reflecting on your words. What is on your heart today?`;
  }
};

/**
 * Remove artificial formatting, unnecessary leading/trailing quotes or hyphens
 */
const cleanReply = (text: string): string => {
  let cleaned = text.trim();
  // Remove wrapping quotes if the model wrapped the whole response
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1).trim();
  }
  return cleaned;
};
