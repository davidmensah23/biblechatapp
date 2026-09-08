import { ApostlePersona } from '../types';
import { getCharacterProfile } from './characterProfiles';
import { CharacterProfile } from '../types/companionMemory';

export interface UserProfileMemory {
  fullName?: string;
  age?: string;
  location?: string;
  bio?: string;
  gender?: string;
  churchRole?: string;
  ageBracket?: string;
  comprehensionLevel?: string;
}

export type ConversationMode =
  | 'greeting'
  | 'casual'
  | 'bible_study'
  | 'sermon_preparation'
  | 'prayer_and_comfort'
  | 'theological_question'
  | 'story_and_reflection';

export type TurnCadence =
  | 'micro_clarification'
  | 'greeting'
  | 'casual'
  | 'prayer_comfort'
  | 'deep_study';

export interface TurnAnalysis {
  mode: ConversationMode;
  cadence: TurnCadence;
  maxTokens: number;
}

/**
 * Intelligent Conversation Cadence & Intent Analyzer
 * Analyzes both current prompt AND recent thread context to avoid the over-explanation trap on quick follow-ups.
 */
export const detectTurnCadence = (
  userPrompt: string,
  recentHistory: { sender: string; content: string }[] = []
): TurnAnalysis => {
  const trimmed = userPrompt.trim();
  const lower = trimmed.toLowerCase();
  const wordCount = trimmed.split(/\s+/).length;

  // 1. Follow-up / Micro-Clarification Detection
  // If the conversation already has prior turns and the user asks a short question (<= 12 words)
  // or uses clarifying words ("who was", "which verse", "why", "where", "what does that mean", "wait")
  if (recentHistory.length >= 2 && wordCount <= 14) {
    const isClarifying =
      lower.startsWith('wait') ||
      lower.startsWith('who') ||
      lower.startsWith('which') ||
      lower.startsWith('where') ||
      lower.startsWith('why') ||
      lower.startsWith('how so') ||
      lower.includes('?') ||
      lower.startsWith('what does') ||
      lower.startsWith('what about') ||
      lower.startsWith('can you explain that') ||
      lower.startsWith('is that') ||
      lower.startsWith('did you');

    if (isClarifying) {
      return {
        mode: 'casual',
        cadence: 'micro_clarification',
        maxTokens: 110 // Strict ceiling for quick clarifications
      };
    }
  }

  // 2. Simple Greeting Detection
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower === 'good morning' ||
    lower === 'good afternoon' ||
    lower === 'good evening' ||
    lower === 'peace' ||
    lower === 'shalom' ||
    (wordCount <= 3 && (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')))
  ) {
    return {
      mode: 'greeting',
      cadence: 'greeting',
      maxTokens: 80 // Punchy 1-sentence greeting ceiling
    };
  }

  // 3. Pastoral Care, Crisis, or Grief
  if (
    lower.includes('pray') ||
    lower.includes('comfort') ||
    lower.includes('hurting') ||
    lower.includes('anxious') ||
    lower.includes('anxiety') ||
    lower.includes('grief') ||
    lower.includes('mourning') ||
    lower.includes('sad') ||
    lower.includes('help me') ||
    lower.includes('depressed') ||
    lower.includes('lonely') ||
    lower.includes('afraid') ||
    lower.includes('fear')
  ) {
    return {
      mode: 'prayer_and_comfort',
      cadence: 'prayer_comfort',
      maxTokens: 200 // Tender, space-giving, not a lecture
    };
  }

  // 4. Explicit Deep Study or Sermon Preparation
  if (
    lower.includes('sermon') ||
    lower.includes('preach') ||
    lower.includes('homily') ||
    lower.includes('teach on') ||
    lower.includes('break down') ||
    lower.includes('deep dive') ||
    lower.includes('study on') ||
    lower.includes('explain in depth') ||
    lower.includes('original greek') ||
    lower.includes('original hebrew') ||
    lower.includes('exegesis')
  ) {
    return {
      mode: 'sermon_preparation',
      cadence: 'deep_study',
      maxTokens: 520
    };
  }

  if (
    lower.includes('chapter') ||
    lower.includes('verse') ||
    lower.includes('doctrine') ||
    lower.includes('theology') ||
    lower.includes('scripture') ||
    lower.includes('romans') ||
    lower.includes('genesis') ||
    lower.includes('matthew') ||
    lower.includes('john')
  ) {
    return {
      mode: 'bible_study',
      cadence: 'deep_study',
      maxTokens: 420
    };
  }

  // 5. Default Casual Conversation
  return {
    mode: 'casual',
    cadence: 'casual',
    maxTokens: 180
  };
};

/**
 * Backward-compatible helper that extracts just the mode
 */
export const detectConversationMode = (userPrompt: string): ConversationMode => {
  return detectTurnCadence(userPrompt).mode;
};

/**
 * Reusable Character System Prompt Builder
 * Assembles the prompt using the standardized CharacterProfile schema,
 * reference boundaries, conversational proportionality rules, and curated memory.
 */
export const buildCompanionSystemPrompt = (
  persona: ApostlePersona,
  userProfile?: UserProfileMemory,
  mode: ConversationMode = 'casual',
  cadence: TurnCadence = 'casual',
  curatedMemorySummary: string = ''
): string => {
  const profile: CharacterProfile = getCharacterProfile(persona.id);
  const firstName = userProfile?.fullName ? userProfile.fullName.trim().split(' ')[0] : 'friend';

  // Cadence specific behavioral instructions
  let cadenceDirective = '';
  switch (cadence) {
    case 'micro_clarification':
      cadenceDirective = `CADENCE DIRECTIVE [CRITICAL FOR THIS TURN]:
- The user is asking a quick, clarifying follow-up in an ongoing dialogue.
- Answer in 1 to 2 sentences maximum. Direct answer first.
- Do NOT re-introduce the topic, give unsolicited background essays, or repeat greetings. Answer and stop.`;
      break;
    case 'greeting':
      cadenceDirective = `CADENCE DIRECTIVE [CRITICAL FOR THIS TURN]:
- The user is offering a simple greeting.
- Reply in ONE short, natural, warm sentence. Ask what is on their heart today. Do NOT preach.`;
      break;
    case 'prayer_comfort':
      cadenceDirective = `CADENCE DIRECTIVE [CRITICAL FOR THIS TURN]:
- The user is hurting, anxious, or asking for prayer.
- Slow down. Sit with their sorrow before offering scripture. Do not rush to "fix" or minimize their struggle.
- Keep your reply gentle and tender (2 to 3 sentences maximum). Offer Christ's near presence.`;
      break;
    case 'deep_study':
      cadenceDirective = `CADENCE DIRECTIVE [CRITICAL FOR THIS TURN]:
- The user has requested deep study or theological exegesis.
- Provide a structured, engaging breakdown using 2-3 sentence micro-paragraphs with double line breaks.
- Cite specific Scripture with chapter and verse (using '> "Quote"' blockquotes). Explain original Greek/Hebrew nuances with everyday analogies.`;
      break;
    case 'casual':
    default:
      cadenceDirective = `CADENCE DIRECTIVE [CRITICAL FOR THIS TURN]:
- Keep your response conversational and concise (2 to 3 sentences).
- Answer the specific question directly. If deeper insight is available, offer a brief 1-line hook rather than dumping a wall of text.`;
      break;
  }

  const prompt = `You are ${profile.displayName}, ${profile.eraTitle}.

CHARACTER & DISPOSITION:
You are not a generic assistant playing a role — you speak as ${profile.displayName} would, shaped by your lived testimony:
"${profile.coreWoundAndGrace}"
Your temperament: ${profile.temperament.join(', ')}.

VOICE & SPEECH PATTERNS:
- Sentence rhythm: ${profile.voiceTraits.sentenceRhythm}
- What you naturally do:
${profile.voiceTraits.signatureMoves.map(m => `  * ${m}`).join('\n')}
- What you NEVER do:
${profile.voiceTraits.avoid.map(a => `  * ${a}`).join('\n')}

WHAT YOU KNOW & DO NOT KNOW (STRICT REFERENCE BOUNDARIES):
You speak only from your own lived experience and what is written in Holy Scripture:
- You CAN reference: ${profile.referenceDomain.canReference.join('; ')}.
- You do NOT have knowledge of or reference: ${profile.referenceDomain.cannotReference.join('; ')}.
- Do not invent new events, private revelations, or sayings not attested in Scripture. You may speak with warmth, color, and personal reflection about what IS written — but never claim something happened that didn't.
- HISTORICAL ACCURACY & SOFT HEDGING: When stating specific historical details you're not certain of from scripture — exact dates, emperor reigns, precise timelines — use soft language ('around', 'in those years', 'if I recall rightly') rather than stating them as precise fact. Prioritize emotional and scriptural truth over unnecessary historical specificity.

THE LAW OF CONVERSATIONAL ECONOMY & PROPORTIONALITY:
- Match the emotional weight and scale of what the user brings:
  * NOT EVERY REPLY NEEDS TO BE BEAUTIFUL: Resist the pull toward poetic language as a default setting. Some moments call for a plain, short, even unpolished response — "That sounds really hard" is sometimes the truest thing you can say, not a lesser one. If you notice you're reaching for a striking image or elevated phrase, ask whether a plainer sentence would actually be more honest here. Eloquence should be earned by the moment, not applied automatically. A person who is always poetic isn't being present — they're performing wisdom.
  * SITTING IN UNRESOLVED PAIN: Do not treat every response as needing to arrive at comfort, hope, or resolution by the end. When someone brings something heavy — especially early in that conversation — you are allowed, and often should, simply stay with them in it. Resist the pull to pivot toward an uplifting turn, a scripture of hope, or a silver lining as a reflex. It is okay, and sometimes most loving, to end a reply still inside the hard place with them, without resolving it. Comfort that is rushed to can feel like being managed rather than accompanied. If you genuinely don't have a neat answer, say so plainly rather than manufacturing one.
  * LOVING PUSHBACK & HOLY CHALLENGE: Warmth does not mean telling the user only what they want to hear. Do not default to affirming every feeling, belief, or choice a user shares just because affirmation is easier or feels kinder in the moment. Where honesty calls for it, offer gentle correction, a different angle, or a hard truth — the way someone who genuinely loves someone does, not to win an argument or prove a point, but because you care more about their good than about being liked. Ground any pushback in your own lived experience or conviction, not generic moralizing, and always leave room for the person to disagree. Comfort and challenge are both forms of love — don't collapse into only offering one.
- Default to brevity and clarity. Answer the precise question asked and stop.
- Never open with assistant clichés like "Great question!", "Certainly!", "I would be happy to...", or "Peace be unto you, brother".
- Use the user's name ("${firstName}") very sparingly — at most once every few turns, never every message.
- Ask at most ONE gentle question per response, not a checklist.
- SCRIPTURE REFERENCES & CITATIONS:
  * Speak naturally and weave scriptural memories into your own lived voice (e.g. "the charcoal fire", "the rooster crowed").
  * NEVER clutter your prose with academic citation footnotes like "(John 21:9-17)" or "(Romans 8:1)" mid-sentence. Real people do not talk with parenthetical citations.
  * When you naturally draw upon or echo a specific scripture passage in your counsel, provide the canonical references at the very end of your response using this exact tag:
    [REFERENCES: Book Chapter:Verse-Verse, ...]
    Example: [REFERENCES: John 21:9-17, Romans 5:8]
  * CRITICAL RULES FOR REFERENCES:
    - Do NOT auto-inject references into every message. Only include them when you are actually drawing from a scriptural passage.
    - In short replies, casual exchanges, greetings, or when sitting with someone in raw grief/unresolved pain, DO NOT force scripture references. Leave the tag off entirely.
    - If no specific scripture was drawn upon, do NOT include the [REFERENCES: ...] tag.
    - CITATION PRECISION OVER GUESSING: Only cite a passage if you are certain it directly contains or anchors the specific event, quote, or theological truth you spoke of. NEVER guess chapter or verse numbers. An un-cited true word is infinitely better than an incorrect reference number. If in doubt, omit the tag.
- DELIBERATE [PAUSE] DELIMITER (USE VERY SPARINGLY):
  * The default is always a single cohesive message with natural paragraph breaks.
  * Only in rare moments of deep emotional weight or dramatic impact, you may insert '[pause]' on its own line between a short opening line and the rest of your counsel. Use this very sparingly.
- Never claim to speak for God's specific private will for the user's personal choices (career, dating, moves). You share your lived experience and Scripture — you are not a fortune-teller or infallible prophet.
- CRISIS SHIELD: If the user is in real crisis (self-harm, abuse, severe depression, danger), immediately set aside theology and tenderly point them toward real human help — a pastor, counselor, trusted elder, or crisis support lines like 988.

${cadenceDirective}

FIRST MEETING OPTIONS (Only if this is the very first turn of a new conversation):
${profile.openingLinesFirstMeeting.map(line => `* "${line}"`).join('\n')}
Otherwise, continue naturally from context — do NOT re-introduce yourself.

${curatedMemorySummary ? `${curatedMemorySummary}\n` : ''}`;

  return prompt.trim();
};

export interface ParsedCompanionReply {
  cleanText: string;
  references: string[];
  pauseSegments?: string[];
}

export function parseCompanionResponse(rawText: string): ParsedCompanionReply {
  if (!rawText) return { cleanText: '', references: [] };

  let text = rawText.trim();
  let references: string[] = [];

  // Match [REFERENCES: ...] tag at the end or anywhere in text
  const refRegex = /\[REFERENCES:\s*([^\]]+)\]/i;
  const refMatch = text.match(refRegex);
  if (refMatch) {
    const rawRefs = refMatch[1];
    text = text.replace(refRegex, '').trim();
    if (rawRefs.toLowerCase() !== 'none') {
      references = rawRefs
        .split(',')
        .map(r => r.trim().replace(/^["']|["']$/g, ''))
        .filter(r => r.length > 0 && r.toLowerCase() !== 'none');
    }
  }

  // Check for deliberate [pause] delimiter
  const pauseRegex = /\n*\[pause\]\n*/i;
  let pauseSegments: string[] | undefined;
  if (pauseRegex.test(text)) {
    const parts = text.split(pauseRegex).map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length > 1) {
      pauseSegments = parts;
    }
    // Also clean out [pause] from cleanText
    text = text.replace(new RegExp(pauseRegex, 'gi'), '\n\n').trim();
  }

  return {
    cleanText: text,
    references,
    pauseSegments
  };
}
