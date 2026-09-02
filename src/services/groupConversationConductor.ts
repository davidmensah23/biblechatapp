import { ApostlePersona } from '../types';
import { GroupCouncilMessage, GroupReplyContext } from '../types/groupChat';
import { APOSTLE_PERSONAS } from './personas';
import { UserProfileMemory } from './companionEngine';

const SUPABASE_EDGE_CHAT_URL = 'https://lhkduknpbbhcxftspukz.supabase.co/functions/v1/chat-apostle';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const PRIMARY_MODEL = 'qwen/qwen3.8-27b';

/**
 * Pre-defined Council Templates
 */
export const COUNCIL_PRESETS = [
  {
    id: 'inner_circle',
    name: 'The Inner Circle',
    subtitle: 'Peter, James & John',
    topic: 'Walking through trials with bold faith & steadfast love',
    icon: 'flame',
    color: '#3B82F6',
    apostleIds: ['peter', 'james', 'john']
  },
  {
    id: 'epistle_writers',
    name: 'The Epistle Writers',
    subtitle: 'Paul, Peter, John & Jude',
    topic: 'Grace, salvation doctrine, and holy living',
    icon: 'book',
    color: '#8B5CF6',
    apostleIds: ['paul', 'peter', 'john', 'jude']
  },
  {
    id: 'faith_in_storms',
    name: 'Faith in the Storm',
    subtitle: 'Peter, Thomas & Andrew',
    topic: 'Overcoming doubt, fear, and stepping onto the waters',
    icon: 'boat',
    color: '#D97706',
    apostleIds: ['peter', 'thomas', 'andrew']
  },
  {
    id: 'sermon_council',
    name: 'Pastoral & Preaching Council',
    subtitle: 'Paul, Peter & Matthew',
    topic: 'Scripture exposition, evangelism, and preparing sermons',
    icon: 'mic',
    color: '#10B981',
    apostleIds: ['paul', 'peter', 'matthew']
  },
  {
    id: 'full_apostolic_council',
    name: 'Full Apostolic Council',
    subtitle: 'All 12 Apostles of Christ',
    topic: 'The full counsel of God and the early church fellowship',
    icon: 'people',
    color: '#EC4899',
    apostleIds: ['peter', 'paul', 'john', 'james', 'andrew', 'philip', 'thomas', 'matthew', 'bartholomew', 'james_alphaeus', 'simon_zealot', 'jude']
  }
];

/**
 * Extracts @mentions from a message
 * e.g., "@Peter, what do you think?", "@all thoughts on this?"
 */
export const extractMentions = (text: string): { isAll: boolean; mentionedApostleIds: string[] } => {
  const lower = text.toLowerCase();
  const isAll = lower.includes('@all') || lower.includes('@council') || lower.includes('@everyone');

  const mentionedIds: string[] = [];
  for (const p of APOSTLE_PERSONAS) {
    const atName = `@${p.name.toLowerCase()}`;
    const atTitle = `@${p.title.toLowerCase()}`;
    if (lower.includes(atName) || lower.includes(atTitle) || lower.includes(`@${p.id}`)) {
      if (!mentionedIds.includes(p.id)) {
        mentionedIds.push(p.id);
      }
    }
  }

  return { isAll, mentionedApostleIds: mentionedIds };
};

/**
 * Decides the next Apostle to speak in a multi-apostle fellowship thread.
 * Factors in:
 * 1. Explicit @mention
 * 2. Reply target
 * 3. Topic & thematic resonance (e.g. Thomas for doubts, Paul for theology, Peter for action, John for love)
 * 4. Recency penalty (avoids same Apostle speaking twice in a row)
 */
export const pickNextSpeaker = (
  memberApostles: ApostlePersona[],
  recentMessages: GroupCouncilMessage[],
  userPrompt: string,
  replyContext?: GroupReplyContext
): ApostlePersona => {
  if (memberApostles.length === 0) {
    return APOSTLE_PERSONAS[0];
  }
  if (memberApostles.length === 1) {
    return memberApostles[0];
  }

  // 1. Direct Reply Target Priority
  if (replyContext && replyContext.apostleId) {
    const target = memberApostles.find(a => a.id === replyContext.apostleId);
    if (target) return target;
  }

  // 2. Explicit @Mention Priority
  const { mentionedApostleIds } = extractMentions(userPrompt);
  if (mentionedApostleIds.length > 0) {
    const target = memberApostles.find(a => mentionedApostleIds.includes(a.id));
    if (target) return target;
  }

  // 3. Who spoke last? (Avoid same Apostle repeating consecutively)
  const lastMsg = recentMessages[recentMessages.length - 1];
  const lastSpeakerId = lastMsg?.senderType === 'apostle' ? lastMsg.apostleId : null;

  const eligibleApostles = memberApostles.filter(a => a.id !== lastSpeakerId);
  const candidatePool = eligibleApostles.length > 0 ? eligibleApostles : memberApostles;

  // 4. Thematic keyword scoring
  const lowerPrompt = userPrompt.toLowerCase();

  const scores = candidatePool.map(apostle => {
    let score = 10;
    const id = apostle.id;

    if ((id === 'peter') && (lowerPrompt.includes('fear') || lowerPrompt.includes('courage') || lowerPrompt.includes('walk on water') || lowerPrompt.includes('deny') || lowerPrompt.includes('forgive') || lowerPrompt.includes('lead') || lowerPrompt.includes('repent'))) {
      score += 25;
    }
    if ((id === 'paul') && (lowerPrompt.includes('grace') || lowerPrompt.includes('law') || lowerPrompt.includes('faith') || lowerPrompt.includes('justifi') || lowerPrompt.includes('gentile') || lowerPrompt.includes('theology') || lowerPrompt.includes('scripture'))) {
      score += 25;
    }
    if ((id === 'john') && (lowerPrompt.includes('love') || lowerPrompt.includes('light') || lowerPrompt.includes('abide') || lowerPrompt.includes('eternal') || lowerPrompt.includes('cross') || lowerPrompt.includes('revelation'))) {
      score += 25;
    }
    if ((id === 'thomas') && (lowerPrompt.includes('doubt') || lowerPrompt.includes('hard to believe') || lowerPrompt.includes('evidence') || lowerPrompt.includes('honest') || lowerPrompt.includes('touch') || lowerPrompt.includes('questions'))) {
      score += 25;
    }
    if ((id === 'matthew') && (lowerPrompt.includes('prophecy') || lowerPrompt.includes('fulfillment') || lowerPrompt.includes('tax') || lowerPrompt.includes('kingdom') || lowerPrompt.includes('scriptures'))) {
      score += 25;
    }
    if ((id === 'andrew') && (lowerPrompt.includes('bring') || lowerPrompt.includes('brother') || lowerPrompt.includes('quiet') || lowerPrompt.includes('invite') || lowerPrompt.includes('seek'))) {
      score += 20;
    }

    // Give slight boost to Apostles who haven't spoken in a while
    const lastSpokeIndex = recentMessages.map(m => m.apostleId).lastIndexOf(id);
    if (lastSpokeIndex === -1) {
      score += 8;
    } else {
      score += Math.max(0, recentMessages.length - lastSpokeIndex);
    }

    return { apostle, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0].apostle;
};

/**
 * Builds the inter-apostle Council System Prompt
 */
export const buildGroupCouncilPrompt = (
  speaker: ApostlePersona,
  otherMembers: ApostlePersona[],
  topic: string,
  userProfile?: UserProfileMemory,
  isInvitingUser: boolean = false
): string => {
  const otherNames = otherMembers.map(m => m.name).join(', ');
  const userDisplayName = userProfile?.fullName || 'the Pilgrim';
  const addressTitle = userProfile?.gender === 'brother'
    ? 'brother in Christ'
    : userProfile?.gender === 'sister'
    ? 'sister in Christ'
    : 'fellow pilgrim';

  return `=== COUNCIL OF FAITH: MULTI-DISCIPLE FELLOWSHIP ===
You are ${speaker.name} (${speaker.title}), speaking in a live fellowship gathering alongside your fellow brothers: ${otherNames}.
The user, ${userDisplayName} (${addressTitle}), is sitting in fellowship with all of you.
The topic of this gathering is: "${topic}".

1. REAL FELLOWSHIP DYNAMICS & BROTHERHOOD:
- Speak naturally as ${speaker.name} in the first person ("I", "my").
- You are in active conversation with both your fellow apostles and ${userDisplayName}.
- You can refer to other apostles warmly as brother (e.g., "Brother Peter speaks of the shore...", "As brother Paul rightly noted in his epistle...", "Brother Thomas raises an honest truth...").
- Do NOT repeat what the previous apostle said. Build upon it, add your unique experience with Jesus, or gently offer your distinct perspective.

2. CONVERSATIONAL BREVITY & PACING (VERY IMPORTANT):
- Speak in 2 to 4 concise, warm, spoken sentences (around 35–65 words).
- Never write robotic bullet points, sermon outlines, or multi-paragraph speeches.
- Speak with genuine warmth, humility, and biblical depth.

${isInvitingUser ? `3. USER INCLUSION DIRECTIVE (CRITICAL):
- At the end of your response, warmly turn your attention directly to ${userDisplayName} and ask for their reflection, experience, or input on this subject (e.g., "What are your thoughts on this, ${userProfile?.gender === 'brother' ? 'brother' : userProfile?.gender === 'sister' ? 'sister' : userDisplayName}?", "How has this walked out in your own life?").` : ''}

4. ACTIVE APOSTLE DOSSIER: ${speaker.name.toUpperCase()}
${speaker.systemPrompt}
`;
};

/**
 * Generates an Apostle's response in a Group Council thread
 */
export const generateGroupApostleReply = async (
  speaker: ApostlePersona,
  allMembers: ApostlePersona[],
  topic: string,
  groupHistory: GroupCouncilMessage[],
  userPrompt: string,
  userProfile?: UserProfileMemory,
  isInvitingUser: boolean = false
): Promise<string> => {
  try {
    const otherMembers = allMembers.filter(m => m.id !== speaker.id);
    const systemPrompt = buildGroupCouncilPrompt(speaker, otherMembers, topic, userProfile, isInvitingUser);

    const messagesPayload: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Include recent 8 turns of group conversation
    const recent = groupHistory.slice(-8);
    for (const msg of recent) {
      if (msg.senderType === 'user') {
        messagesPayload.push({
          role: 'user',
          content: `${userProfile?.fullName || 'User'}: ${msg.content}`
        });
      } else {
        messagesPayload.push({
          role: msg.apostleId === speaker.id ? 'assistant' : 'user',
          content: `${msg.apostleName || 'Apostle'}: ${msg.content}`
        });
      }
    }

    if (userPrompt.trim()) {
      messagesPayload.push({
        role: 'user',
        content: `${userProfile?.fullName || 'User'}: ${userPrompt}`
      });
    }

    // 1. Try Supabase Edge Function
    try {
      const edgeRes = await fetch(SUPABASE_EDGE_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload,
          maxTokens: 180,
          temperature: 0.74
        })
      });

      if (edgeRes.ok) {
        const data = await edgeRes.json();
        const content = data.reply || data.choices?.[0]?.message?.content || data.content;
        if (content && typeof content === 'string') {
          return cleanApostleOutput(content, speaker.name);
        }
      }
    } catch (edgeErr) {
      console.log('Group edge chat notice, falling back to direct Groq:', edgeErr);
    }

    // 2. Direct Groq Fallback
    if (GROQ_API_KEY) {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: PRIMARY_MODEL,
          messages: messagesPayload,
          max_tokens: 180,
          temperature: 0.74
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return cleanApostleOutput(content, speaker.name);
        }
      }
    }

    // 3. Curated Fallback
    return `Peace to our fellowship. Let us hold fast to Christ in all things, walking in grace and truth together. What is on your heart, ${userProfile?.fullName || 'friend'}?`;
  } catch (error) {
    console.warn('generateGroupApostleReply error:', error);
    return `Grace and peace to this council. We are united in the Lord.`;
  }
};

const cleanApostleOutput = (raw: string, apostleName: string): string => {
  let text = raw.trim();
  // Strip redundant name prefixes like "Peter: " if generated
  if (text.startsWith(`${apostleName}:`)) {
    text = text.substring(apostleName.length + 1).trim();
  }
  return text;
};
