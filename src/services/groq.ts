import { ApostlePersona, ChatMessage } from '../types';
import { buildCompanionSystemPrompt, detectConversationMode, UserProfileMemory } from './companionEngine';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

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

    // 2. Build Multi-Layered Companion System Prompt
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

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 350,
        top_p: 0.95,
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
          temperature: 0.7,
          max_tokens: 280,
          top_p: 0.95,
          stream: false
        })
      });

      if (!fallbackResponse.ok) {
        throw new Error(`Groq API returned status ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return fallbackData.choices?.[0]?.message?.content || 'Peace be with you. I am reflecting on your words.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Peace be with you. I am reflecting on your words.';
  } catch (error) {
    console.error('Groq AI generation error:', error);
    return `Peace and grace be with you. In my walk with the Lord, I learned that even in quiet moments, He hears our heart. Tell me more about what is on your mind.`;
  }
};
