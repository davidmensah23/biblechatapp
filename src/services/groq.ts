import { ApostlePersona, ChatMessage } from '../types';
import { buildCompanionSystemPrompt, detectConversationMode, UserProfileMemory } from './companionEngine';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'qwen/qwen3.8-27b';
const FALLBACK_MODEL_1 = 'qwen/qwen3.6-27b';
const FALLBACK_MODEL_2 = 'openai/gpt-oss-120b';

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

    // Dynamic max_tokens depending on mode (short for greetings, expressive for discussions)
    const maxTokens = mode === 'greeting' ? 60 : mode === 'casual' ? 140 : 350;

    // Try Primary Model: Qwen 3.8 27B
    let response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: messages,
        temperature: 0.75,
        max_tokens: maxTokens,
        top_p: 0.92,
        stream: false
      })
    });

    // Try Fallback Model 1: Qwen 3.6 27B
    if (!response.ok) {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL_1,
          messages: messages,
          temperature: 0.75,
          max_tokens: maxTokens,
          top_p: 0.92,
          stream: false
        })
      });
    }

    // Try Fallback Model 2: GPT-OSS 120B
    if (!response.ok) {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL_2,
          messages: messages,
          temperature: 0.75,
          max_tokens: maxTokens,
          top_p: 0.92,
          stream: false
        })
      });
    }

    if (!response.ok) {
      throw new Error(`Groq API error status: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    if (!rawContent.trim()) {
      return getPersonaSpecificFallback(persona, userPrompt, userProfile);
    }

    return cleanReply(rawContent);
  } catch (error) {
    console.error('Groq AI generation error:', error);
    return getPersonaSpecificFallback(persona, userPrompt, userProfile);
  }
};

/**
 * Character-specific, personalized fallback responses (Never generic!)
 */
const getPersonaSpecificFallback = (
  persona: ApostlePersona,
  userPrompt: string,
  userProfile?: UserProfileContext
): string => {
  const name = userProfile?.fullName ? `, ${userProfile.fullName}` : '';
  const lower = userPrompt.trim().toLowerCase();

  if (lower === 'hi' || lower === 'hello' || lower === 'hey') {
    switch (persona.id) {
      case 'peter':
        return `Peace to you${name}! Simon Peter here. How are you holding up today?`;
      case 'john':
        return `Peace and grace be with you${name}. I am John. How is your heart resting today?`;
      case 'paul':
        return `Grace and peace to you in Christ${name}! What is on your mind today?`;
      case 'thomas':
        return `Peace be with you${name}. I am Thomas. What questions or thoughts are with you today?`;
      case 'matthew':
        return `Peace to you${name}! Levi Matthew here. What is on your mind today?`;
      default:
        return `Peace and grace be with you${name}! I am ${persona.name}. What is on your heart today?`;
    }
  }

  switch (persona.id) {
    case 'peter':
      return `I know what it feels like to stumble and think all is lost. But the Lord pulled me from the deep waters and met me by the shore with forgiveness. Tell me what is weighing on you right now.`;
    case 'john':
      return `Beloved, remember that perfect love casts out fear. You do not walk alone; His light shines brightest in our quietest moments. What are you facing today?`;
    case 'paul':
      return `I was once the foremost of sinners, yet Christ showed me that His grace is made perfect in our weakness. Whatever struggle you face, His mercy is greater. Tell me more.`;
    case 'thomas':
      return `Do not be afraid to bring your deepest questions or doubts. The Master reached out to me with patience when I needed to see His wounds. What is on your spirit?`;
    case 'matthew':
      return `I was sitting at the tax booth when Jesus called me, seeing past what the world saw. He meets us right in the middle of our ordinary days. What is going on?`;
    default:
      return `Peace be with you. In every season, Christ invites us to cast our burdens on Him. Tell me what is on your heart.`;
  }
};

/**
 * Remove artificial formatting, unnecessary leading/trailing quotes
 */
const cleanReply = (text: string): string => {
  let cleaned = text.trim();
  // Strip <think> tags if model produced reasoning
  if (cleaned.includes('</think>')) {
    cleaned = cleaned.split('</think>')[1].trim();
  }
  // Remove wrapping quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1).trim();
  }
  return cleaned;
};
