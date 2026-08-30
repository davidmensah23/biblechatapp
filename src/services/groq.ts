import { ApostlePersona, ChatMessage } from '../types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

export interface UserProfileContext {
  name?: string;
  age?: string;
  location?: string;
  bio?: string;
}

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

    let enrichedSystemPrompt = persona.systemPrompt;

    if (userProfile && userProfile.name) {
      enrichedSystemPrompt += `\n\nUser Profile Context:
You are speaking with ${userProfile.name}${userProfile.age ? `, age ${userProfile.age}` : ''}${userProfile.location ? `, located in ${userProfile.location}` : ''}.
${userProfile.bio ? `Their faith background/note: "${userProfile.bio}"` : ''}
Address them warmly by name when natural and appropriate.`;
    }

    enrichedSystemPrompt += `\n\nConversational Style & Vibe Guidelines:
- Keep your responses conversational, empathetic, and concise (typically 35-75 words).
- Do NOT produce massive walls of text, multi-point bulleted outlines, or long essays unless the user explicitly asks for an in-depth study or detailed list.
- Match the user's conversational energy: if they give a friendly greeting ("Hi", "Good morning"), reply warmly in 1-2 sentences and ask how their walk with God is going today.
- Quote Scripture reverently and sparingly where it adds divine light to the conversation.`;

    const messages: MessagePayload = [
      { role: 'system', content: enrichedSystemPrompt }
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
        max_tokens: 300,
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
          max_tokens: 250,
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
