import { ApostlePersona, ChatMessage } from '../types';
import { buildCompanionSystemPrompt, detectConversationMode, UserProfileMemory } from './companionEngine';

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

    // 2. Build Multi-Layered Companion System Prompt
    const fullSystemPrompt = buildCompanionSystemPrompt(persona, userProfile, mode);

    const messages: MessagePayload[] = [
      { role: 'system', content: fullSystemPrompt }
    ];

    // 3. Include recent conversation history for context continuity (last 8 turns)
    const recentTurns = conversationHistory.slice(-8);
    for (const msg of recentTurns) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // 4. Append current user message
    messages.push({ role: 'user', content: userPrompt });

    // Ensure generous token count so thoughts and deep exegesis are never cut off mid-sentence
    const maxTokens = mode === 'greeting' ? 120 : mode === 'casual' ? 220 : mode === 'sermon_preparation' ? 750 : 580;

    // 5. Direct Low-Latency Groq Engine Call
    if (GROQ_API_KEY) {
      const directRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'User-Agent': 'BibleChatApp/1.0'
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
          const text = data.choices[0].message.content.trim();
          if (text.length > 0) {
            return text;
          }
        }
      } else {
        console.warn('Groq API non-ok status:', directRes.status);
      }
    }

    return getPersonaSpecificFallback(persona, userPrompt);
  } catch (error) {
    console.error('Groq AI generation error:', error);
    return getPersonaSpecificFallback(persona, userPrompt);
  }
};

const getPersonaSpecificFallback = (persona: ApostlePersona, prompt: string): string => {
  const fallbacks: Record<string, string[]> = {
    peter: [
      "Peace be with you, my friend. Simon Peter here. The Lord knows your path and will keep your feet firm even when the waves rise. What is on your heart?",
      "Cast all your anxiety on Him, for He cares for you. Even when I failed and sank into the water, His hand reached down and pulled me up.",
      "The grace of our Master Jesus Christ be with your spirit. Walk boldly in truth today."
    ],
    john: [
      "Beloved, let us love one another, for love is of God. Whatever you are carrying today, know that His light drives out every shadow of fear.",
      "See what great love the Father has lavished on us, that we should be called children of God! Rest in His presence today.",
      "Grace, mercy, and peace will be with us from God the Father and from Jesus Christ, the Son of the Father, in truth and love."
    ],
    paul: [
      "Grace to you and peace from God our Father and the Lord Jesus Christ. In all these things we are more than conquerors through Him who loved us.",
      "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
      "The peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus."
    ],
    thomas: [
      "Peace be with you. I understand what it means to question and search for truth. Jesus met me right where I was with open hands, and He meets you here today as well.",
      "Blessed are those who have not seen and yet have believed. Stand firm, and keep seeking with an open heart."
    ]
  };

  const pool = fallbacks[persona.id] || fallbacks.peter;
  const index = Math.abs(prompt.length) % pool.length;
  return pool[index];
};
