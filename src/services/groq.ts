import { ApostlePersona, ChatMessage } from '../types';
import { buildCompanionSystemPrompt, detectConversationMode, UserProfileMemory } from './companionEngine';

const SUPABASE_EDGE_CHAT_URL = 'https://lhkduknpbbhcxftspukz.supabase.co/functions/v1/chat-apostle';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'qwen/qwen3.8-27b';

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

    // Dynamic max_tokens depending on mode (short for greetings, expansive for sermon writing)
    const maxTokens = mode === 'greeting' ? 60 : mode === 'casual' ? 140 : mode === 'sermon_preparation' ? 650 : 350;

    // 5. Secure Backend Gateway: Call Supabase Edge Function (Zero API Keys on Device)
    try {
      const edgeRes = await fetch(SUPABASE_EDGE_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          maxTokens,
          temperature: 0.72
        })
      });

      if (edgeRes.ok) {
        const edgeData = await edgeRes.json();
        if (edgeData?.reply) {
          return edgeData.reply.trim();
        }
      }
    } catch (edgeErr) {
      console.warn('Supabase Edge Function fallback to direct Groq:', edgeErr);
    }

    // 6. Direct Client Fallback (if Edge Function is offline)
    if (GROQ_API_KEY) {
      const directRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: PRIMARY_MODEL,
          messages,
          max_tokens: maxTokens,
          temperature: 0.72
        })
      });

      if (directRes.ok) {
        const data = await directRes.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content.trim();
        }
      }
    }

    return getPersonaSpecificFallback(persona, userPrompt);
  } catch (error) {
    console.error('Groq AI generation error:', error);
    return getPersonaSpecificFallback(persona, userPrompt);
  }
};

/**
 * 100% Unique, Persona-Specific Offline Fallbacks
 */
function getPersonaSpecificFallback(persona: ApostlePersona, prompt: string): string {
  const lower = prompt.toLowerCase();
  const name = persona.name;

  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    switch (persona.id) {
      case 'peter':
        return `Peace be with you, my friend. Simon Peter here. What is weighing on your heart today?`;
      case 'john':
        return `Grace and peace to you, beloved. It warms my heart to speak with you today.`;
      case 'paul':
        return `Grace to you and peace from God our Father. How can I encourage your walk today?`;
      case 'thomas':
        return `Hello there, my friend. I'm glad you reached out. What questions are on your mind?`;
      case 'matthew':
        return `Peace be with you. What can we look into together today?`;
      default:
        return `Peace be with you, my brother. I am ${name}. How is your spirit today?`;
    }
  }

  switch (persona.id) {
    case 'peter':
      return `Hold fast, my friend. I learned on stormy waters that when you keep your eyes on the Master, the waves cannot swallow you. Cast all your anxiety on Him, for He cares for you deeply.`;
    case 'john':
      return `Beloved, remember that perfect love casts out all fear. You are deeply cherished by the Father, and His light shines in whatever darkness you are facing.`;
    case 'paul':
      return `Let not your heart be troubled. I have learned in whatever state I am to be content, for I can do all things through Christ who gives me strength. Press on!`;
    case 'thomas':
      return `Take heart. I know what it feels like to seek certainty in uncertain times. Bring your questions to the Lord with an open heart; He is faithful to meet you where you are.`;
    default:
      return `The Lord is near to all who call upon Him in truth. Take courage, and let His peace guard your heart and mind today.`;
  }
}
