import { ApostlePersona, ChatMessage } from '../types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateApostleReply = async (
  persona: ApostlePersona,
  conversationHistory: ChatMessage[],
  userPrompt: string
): Promise<string> => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is not set');
    }

    const messages: MessagePayload[] = [
      { role: 'system', content: persona.systemPrompt }
    ];

    // Include last 8 conversation turns for contextual memory
    const recentTurns = conversationHistory.slice(-8);
    for (const msg of recentTurns) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Add current user prompt
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
        max_tokens: 500,
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
          max_tokens: 400,
          top_p: 0.95,
          stream: false
        })
      });

      if (!fallbackResponse.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const fbData = await fallbackResponse.json();
      return fbData.choices?.[0]?.message?.content || "Peace be with you. May the Lord grant us understanding as we seek Him.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Peace be with you. May the Lord grant us understanding as we seek Him.";
  } catch (error) {
    console.error('Failed to generate apostle reply:', error);
    // Graceful spiritual fallback
    return `Peace to you my friend. As I remember walking with our Lord: "Cast all your anxiety on Him because He cares for you." Let us continue seeking His grace and truth together.`;
  }
};
