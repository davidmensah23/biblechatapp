import { getDB, getCurrentUserId } from './database';
import { CompanionProfile, OngoingThread, PrayerRequestItem, RelationalNote } from '../types/companionMemory';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FAST_EXTRACTION_MODEL = 'llama-3.1-8b-instant';

const createEmptyProfile = (userId: string): CompanionProfile => ({
  userId,
  identity: {},
  studyState: {
    openQuestions: []
  },
  ongoingThreads: [],
  prayerJournal: [],
  relationalNotes: [],
  updatedAt: Date.now()
});

/**
 * Initializes the SQLite table for companion profiles
 */
const initTable = async () => {
  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS companion_profiles (
          user_id TEXT PRIMARY KEY NOT NULL,
          profile_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
    } catch (e) {
      console.warn('companion_profiles table init error:', e);
    }
  }
};

/**
 * Applies natural temporal decay to ongoing emotional and situational threads.
 * If an item is unmentioned for days/weeks, its salience drops so the model does not fixate on old problems.
 */
export const applySalienceDecay = (profile: CompanionProfile): CompanionProfile => {
  const now = Date.now();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const updatedThreads: OngoingThread[] = profile.ongoingThreads.map(thread => {
    const daysElapsed = Math.max(0, (now - thread.lastMentioned) / MS_PER_DAY);
    if (daysElapsed < 0.5) return thread;

    // Daily decay factor 0.92 (half-life of approx 8 days if unmentioned)
    const decayedSalience = Math.max(0.05, thread.salience * Math.pow(0.92, daysElapsed));
    const newStatus = decayedSalience < 0.2 && thread.status === 'ongoing' ? 'faded' : thread.status;

    return {
      ...thread,
      salience: Math.round(decayedSalience * 100) / 100,
      status: newStatus
    };
  });

  return {
    ...profile,
    ongoingThreads: updatedThreads
  };
};

/**
 * Fetches the user's structured companion profile from SQLite
 */
export const getCompanionProfile = async (targetUserId?: string): Promise<CompanionProfile> => {
  await initTable();
  const userId = targetUserId || (await getCurrentUserId());
  const db = await getDB();

  if (db) {
    try {
      const row = await db.getFirstAsync<{ profile_json: string }>(
        'SELECT profile_json FROM companion_profiles WHERE user_id = ?',
        [userId]
      );
      if (row && row.profile_json) {
        const parsed: CompanionProfile = JSON.parse(row.profile_json);
        return applySalienceDecay(parsed);
      }
    } catch (e) {
      console.warn('getCompanionProfile error:', e);
    }
  }

  return createEmptyProfile(userId);
};

/**
 * Saves or updates the companion profile in SQLite
 */
export const saveCompanionProfile = async (profile: CompanionProfile): Promise<void> => {
  await initTable();
  const db = await getDB();
  profile.updatedAt = Date.now();

  if (db) {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO companion_profiles (user_id, profile_json, updated_at) VALUES (?, ?, ?)',
        [profile.userId, JSON.stringify(profile), profile.updatedAt]
      );
    } catch (e) {
      console.warn('saveCompanionProfile error:', e);
    }
  }
};

/**
 * Builds a lean, curated natural summary string for injection into the system prompt.
 * Crucial rule: Never dump the whole database; only surface high-salience facts.
 */
export const buildCuratedMemoryContext = (profile: CompanionProfile): string => {
  const parts: string[] = [];

  // 1. Identity & Life Season
  if (profile.identity.preferredName || profile.identity.name) {
    const name = profile.identity.preferredName || profile.identity.name;
    let identStr = `User: ${name}`;
    if (profile.identity.lifeSeason) {
      identStr += ` (life season: ${profile.identity.lifeSeason})`;
    }
    parts.push(identStr);
  } else if (profile.identity.lifeSeason) {
    parts.push(`Life season: ${profile.identity.lifeSeason}`);
  }

  // 2. Study State
  if (profile.studyState.currentBook) {
    const ch = profile.studyState.currentChapter ? ` chapter ${profile.studyState.currentChapter}` : '';
    parts.push(`Currently studying: ${profile.studyState.currentBook}${ch}`);
  }

  // 3. Ongoing Emotional / Life Threads (filter salience >= 0.35, max 2 items)
  const activeThreads = (profile.ongoingThreads || [])
    .filter(t => t.status === 'ongoing' && t.salience >= 0.35)
    .sort((a, b) => b.salience - a.salience)
    .slice(0, 2);

  if (activeThreads.length > 0) {
    const threadStr = activeThreads.map(t => `${t.topic}`).join('; ');
    parts.push(`Carrying ongoing situation: ${threadStr}`);
  }

  // 4. Active Prayer Requests (unresolved, max 2 items)
  const activePrayers = (profile.prayerJournal || [])
    .filter(p => !p.resolved)
    .slice(0, 2);

  if (activePrayers.length > 0) {
    const prayerStr = activePrayers.map(p => p.request).join('; ');
    parts.push(`Prayer need: ${prayerStr}`);
  }

  // 5. Relational context (max 1 key relationship)
  const relNotes = (profile.relationalNotes || []).slice(0, 1);
  if (relNotes.length > 0) {
    parts.push(`Key relationship: ${relNotes[0].person} (${relNotes[0].context})`);
  }

  if (parts.length === 0) {
    return '';
  }

  return `CONTEXT ABOUT THIS USER (Weave this in naturally ONLY if directly relevant — never recite, announce, or prove you remember this):\n- ${parts.join('\n- ')}`;
};

/**
 * Cheap asynchronous extraction worker that runs in the background AFTER a conversation turn.
 * Zero UI latency — analyzes the exchange to update durable memory in SQLite.
 */
export const runAsyncMemoryExtraction = async (
  userId: string,
  userMessage: string,
  assistantReply: string
): Promise<void> => {
  if (!GROQ_API_KEY) return;
  const trimmedUser = userMessage.trim();
  if (trimmedUser.length < 5) return; // Skip trivial messages like "hi", "ok"

  try {
    const extractionPrompt = `You are a background memory extraction engine for a Christian Bible companion app.
Analyze this single conversational exchange between a USER and their MENTOR.
Extract only durable, long-term personal facts:
- Life season (e.g. "expecting a child", "college student", "recent bereavement")
- An ongoing emotional/life situation (e.g. "struggling with job interview anxiety", "doubting salvation")
- A prayer request mentioned by the user
- A key relationship mentioned (e.g. "strained relationship with father", "praying for sister Sarah")
- Current Scripture study mention

Do NOT extract trivial small talk or transient facts.

USER: "${trimmedUser}"
MENTOR: "${assistantReply.slice(0, 300)}"

Return ONLY a valid JSON object matching this exact structure, or return the single word NONE:
{
  "lifeSeason": "string or null",
  "ongoingTopic": "string or null",
  "resolvedTopic": "string or null",
  "prayerRequest": "string or null",
  "resolvedPrayer": "string or null",
  "relation": { "person": "string", "context": "string" } or null,
  "currentBook": "string or null",
  "currentChapter": number or null
}`;

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: FAST_EXTRACTION_MODEL,
        messages: [{ role: 'user', content: extractionPrompt }],
        max_tokens: 220,
        temperature: 0.1
      })
    });

    if (!res.ok) return;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content || content === 'NONE' || !content.startsWith('{')) return;

    const delta = JSON.parse(content);
    const profile = await getCompanionProfile(userId);
    let modified = false;

    // Update life season
    if (delta.lifeSeason && typeof delta.lifeSeason === 'string') {
      profile.identity.lifeSeason = delta.lifeSeason;
      modified = true;
    }

    // Update ongoing thread
    if (delta.ongoingTopic && typeof delta.ongoingTopic === 'string') {
      const topic = delta.ongoingTopic.trim();
      const existing = profile.ongoingThreads.find(
        t => t.topic.toLowerCase() === topic.toLowerCase()
      );
      if (existing) {
        existing.lastMentioned = Date.now();
        existing.salience = Math.min(1.0, existing.salience + 0.25);
        existing.status = 'ongoing';
      } else {
        profile.ongoingThreads.push({
          id: `thread_${Date.now()}`,
          topic,
          firstMentioned: Date.now(),
          lastMentioned: Date.now(),
          status: 'ongoing',
          salience: 0.9
        });
      }
      modified = true;
    }

    // Resolve thread
    if (delta.resolvedTopic && typeof delta.resolvedTopic === 'string') {
      const existing = profile.ongoingThreads.find(
        t => t.topic.toLowerCase().includes(delta.resolvedTopic.toLowerCase())
      );
      if (existing) {
        existing.status = 'resolved';
        existing.salience = 0.1;
        modified = true;
      }
    }

    // Prayer request
    if (delta.prayerRequest && typeof delta.prayerRequest === 'string') {
      const req = delta.prayerRequest.trim();
      const existing = profile.prayerJournal.find(
        p => p.request.toLowerCase() === req.toLowerCase()
      );
      if (!existing) {
        profile.prayerJournal.push({
          id: `pray_${Date.now()}`,
          request: req,
          created: Date.now(),
          followedUp: false,
          resolved: false
        });
        modified = true;
      }
    }

    // Resolve prayer
    if (delta.resolvedPrayer && typeof delta.resolvedPrayer === 'string') {
      const existing = profile.prayerJournal.find(
        p => p.request.toLowerCase().includes(delta.resolvedPrayer.toLowerCase())
      );
      if (existing) {
        existing.resolved = true;
        modified = true;
      }
    }

    // Relational note
    if (delta.relation && delta.relation.person && delta.relation.context) {
      const person = delta.relation.person.trim();
      const context = delta.relation.context.trim();
      const existing = profile.relationalNotes.find(
        r => r.person.toLowerCase() === person.toLowerCase()
      );
      if (existing) {
        existing.context = context;
        existing.lastMentioned = Date.now();
      } else {
        profile.relationalNotes.push({
          id: `rel_${Date.now()}`,
          person,
          context,
          lastMentioned: Date.now()
        });
      }
      modified = true;
    }

    // Study update
    if (delta.currentBook && typeof delta.currentBook === 'string') {
      profile.studyState.currentBook = delta.currentBook;
      if (delta.currentChapter && typeof delta.currentChapter === 'number') {
        profile.studyState.currentChapter = delta.currentChapter;
      }
      profile.studyState.lastStudiedAt = Date.now();
      modified = true;
    }

    if (modified) {
      await saveCompanionProfile(profile);
    }
  } catch (err) {
    // Non-fatal background worker
    console.warn('runAsyncMemoryExtraction non-fatal error:', err);
  }
};
