import { ApostlePersona, ChatMessage } from '../types';
import {
  buildCompanionSystemPrompt,
  detectTurnCadence,
  UserProfileMemory
} from './companionEngine';
import {
  getCompanionProfile,
  buildCuratedMemoryContext,
  runAsyncMemoryExtraction
} from './companionMemoryService';
import { getCurrentUserId } from './database';

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
    const userId = await getCurrentUserId();

    // 1. Thread-Aware Turn & Cadence Analysis (solves the over-explanation & follow-up trap)
    const turnAnalysis = detectTurnCadence(
      userPrompt,
      conversationHistory.map(m => ({ sender: m.sender, content: m.content }))
    );

    // 2. Fetch Structured Memory and Build Lean Curated Summary
    let memorySummary = '';
    try {
      const profile = await getCompanionProfile(userId);
      memorySummary = buildCuratedMemoryContext(profile);
    } catch (e) {
      console.warn('Memory summary retrieval note:', e);
    }

    // 3. Build Standardized Character System Prompt
    const fullSystemPrompt = buildCompanionSystemPrompt(
      persona,
      userProfile,
      turnAnalysis.mode,
      turnAnalysis.cadence,
      memorySummary
    );

    const messages: MessagePayload[] = [
      { role: 'system', content: fullSystemPrompt }
    ];

    // 4. Include recent conversation history for context continuity (last 8 turns)
    const recentTurns = conversationHistory.slice(-8);
    for (const msg of recentTurns) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // 5. Append current user message
    messages.push({ role: 'user', content: userPrompt });

    // 6. Direct Low-Latency Groq Engine Call with Cadence-Proportional Token Limit
    if (GROQ_API_KEY) {
      const directRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'User-Agent': 'BibleChatApp/1.0'
        },
        body: JSON.stringify({
          model: PRIMARY_MODEL,
          messages,
          max_tokens: turnAnalysis.maxTokens,
          temperature: 0.7
        })
      });

      if (directRes.ok) {
        const data = await directRes.json();
        if (data.choices?.[0]?.message?.content) {
          const text = data.choices[0].message.content.trim();
          if (text.length > 0) {
            // 7. Fire-and-forget asynchronous background memory extraction (0ms UI latency)
            runAsyncMemoryExtraction(userId, userPrompt, text).catch(() => {});
            return text;
          }
        }
      } else {
        console.warn('Groq API non-ok status:', directRes.status);
      }
    }

    const fallback = getPersonaSpecificFallback(persona, userPrompt);
    runAsyncMemoryExtraction(userId, userPrompt, fallback).catch(() => {});
    return fallback;
  } catch (error) {
    console.error('Groq AI generation error:', error);
    return getPersonaSpecificFallback(persona, userPrompt);
  }
};

const getPersonaSpecificFallback = (persona: ApostlePersona, prompt: string): string => {
  const fallbacks: Record<string, string[]> = {
    peter: [
      "I hear you. The Lord knows your path and will keep your feet firm even when the waves rise. What is on your heart?",
      "Cast all your anxiety on Him, for He cares for you. Even when I failed and sank into the water, His hand reached down and pulled me up.",
      "Stand firm in the grace of our Master Jesus Christ. Walk boldly in truth today."
    ],
    john: [
      "Beloved, let us love one another, for love is of God. Whatever you are carrying today, know that His light drives out every shadow of fear.",
      "See what great love the Father has lavished on us, that we should be called children of God! Rest in His presence today.",
      "His truth abides in us forever. Speak freely—what is your heart reflecting on?"
    ],
    paul: [
      "I am with you in spirit. In all these things we are more than conquerors through Him who loved us.",
      "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
      "The peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus."
    ],
    thomas: [
      "I understand what it means to question and search for truth. Jesus met me right where I was with open hands, and He meets you here today as well.",
      "Blessed are those who have not seen and yet have believed. Stand firm, and keep seeking with an open heart."
    ],
    the_bible: [
      "Your word is a lamp to my feet and a light to my path (Psalm 119:105). What scripture shall we examine together?",
      "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness."
    ]
  };

  const pool = fallbacks[persona.id] || fallbacks.peter;
  const index = Math.abs(prompt.length) % pool.length;
  return pool[index];
};
