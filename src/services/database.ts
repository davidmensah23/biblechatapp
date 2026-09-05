import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ChatMessage, ConversationThread, SavedBookmark, UserProfile } from '../types';
import { GroupCouncilThread, GroupCouncilMessage } from '../types/groupChat';
import { DEFAULT_PROFILE, supabase } from './supabase';
import { recordDailyActivity } from './gamificationService';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isDbAvailable = true;

// Interfaces for user-scoped data
export interface VerseHighlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  verseText: string;
  timestamp: number;
}

export interface VerseNote {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  reference: string;
  verseText: string;
  noteText: string;
  timestamp: number;
}

export interface MemorizedVerse {
  id: string;
  reference: string;
  verseText: string;
  version: string;
  masteredAt: number;
  practiceCount: number;
}

// In-memory fallback if SQLite encounters an issue
let memoryConversations: ConversationThread[] = [];
let memoryMessages: Record<string, ChatMessage[]> = {};
let memoryBookmarks: SavedBookmark[] = [];
let memoryProfile: UserProfile = { ...DEFAULT_PROFILE };
let memoryHighlights: Record<string, VerseHighlight> = {};
let memoryNotes: Record<string, VerseNote> = {};
let memoryMemorizedVerses: Record<string, MemorizedVerse> = {};

let memoryGroupThreads: GroupCouncilThread[] = [
  {
    id: 'council_inner_circle',
    name: 'The Inner Circle',
    topic: 'Walking through trials with unwavering faith & love',
    memberApostleIds: ['peter', 'james', 'john'],
    lastMessage: 'John: My beloved, perfect love casts out all fear.',
    lastMessageSenderName: 'John',
    updatedAt: Date.now() - 10 * 60 * 1000
  },
  {
    id: 'council_epistle_writers',
    name: 'The Epistle Writers',
    topic: 'Grace, salvation, and persevering in holiness',
    memberApostleIds: ['paul', 'peter', 'john', 'jude'],
    lastMessage: 'Paul: For by grace you have been saved through faith.',
    lastMessageSenderName: 'Paul',
    updatedAt: Date.now() - 60 * 60 * 1000
  }
];

let memoryGroupMessages: Record<string, GroupCouncilMessage[]> = {
  council_inner_circle: [
    {
      id: 'gmsg_init_1',
      threadId: 'council_inner_circle',
      senderType: 'apostle',
      apostleId: 'peter',
      apostleName: 'Peter',
      content: 'Peace to this fellowship. We are gathered in the Master’s name.',
      timestamp: Date.now() - 12 * 60 * 1000
    },
    {
      id: 'gmsg_init_2',
      threadId: 'council_inner_circle',
      senderType: 'apostle',
      apostleId: 'john',
      apostleName: 'John',
      content: 'My beloved, perfect love casts out all fear. What is on your heart today?',
      timestamp: Date.now() - 10 * 60 * 1000
    }
  ]
};

const GUEST_ID_KEY = 'akorno_guest_device_id';

// Retrieve or generate a persistent local Guest ID
export const getOrCreateGuestId = async (): Promise<string> => {
  try {
    let guestId: string | null = null;
    if (Platform.OS === 'web') {
      guestId = typeof localStorage !== 'undefined' ? localStorage.getItem(GUEST_ID_KEY) : null;
    } else {
      guestId = await SecureStore.getItemAsync(GUEST_ID_KEY);
    }
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(GUEST_ID_KEY, guestId);
      } else {
        await SecureStore.setItemAsync(GUEST_ID_KEY, guestId);
      }
    }
    return guestId;
  } catch (e) {
    return `guest_${Date.now()}`;
  }
};

// Returns current Supabase user ID or guest device ID
export const getCurrentUserId = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch (e) {
    // fallback
  }
  return await getOrCreateGuestId();
};

export const getDB = async (): Promise<SQLite.SQLiteDatabase | null> => {
  if (!isDbAvailable) return null;
  try {
    if (!dbInstance) {
      dbInstance = await SQLite.openDatabaseAsync('akorno_bible_chat.db');
      await initTables(dbInstance);
    }
    return dbInstance;
  } catch (err) {
    console.warn('SQLite not fully available, using resilient memory store:', err);
    isDbAvailable = false;
    return null;
  }
};

const initTables = async (db: SQLite.SQLiteDatabase) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        persona_id TEXT NOT NULL,
        persona_name TEXT NOT NULL,
        last_message TEXT,
        last_message_sender TEXT,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        conversation_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        bookmarked INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        reference TEXT,
        author TEXT,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_reading_progress (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER,
        translation TEXT NOT NULL,
        snippet TEXT,
        estimated_minutes INTEGER,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        bio TEXT NOT NULL,
        location TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT DEFAULT 'neutral'
      );

      CREATE TABLE IF NOT EXISTS group_conversations (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        name TEXT NOT NULL,
        topic TEXT NOT NULL,
        member_apostle_ids TEXT NOT NULL,
        last_message TEXT DEFAULT '',
        last_message_sender_name TEXT DEFAULT '',
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS group_messages (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        thread_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        apostle_id TEXT,
        apostle_name TEXT,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        reply_to TEXT,
        mentions TEXT,
        bookmarked INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS verse_highlights (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        color TEXT NOT NULL,
        verse_text TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS verse_notes (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        reference TEXT NOT NULL,
        verse_text TEXT NOT NULL,
        note_text TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memorized_verses (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        reference TEXT NOT NULL,
        verse_text TEXT NOT NULL,
        version TEXT NOT NULL,
        mastered_at INTEGER NOT NULL,
        practice_count INTEGER DEFAULT 1
      );
    `);

    // Safe migrations for user_id column across all local multi-tenant tables
    const tablesWithUserId = [
      'conversations',
      'messages',
      'bookmarks',
      'user_reading_progress',
      'group_conversations',
      'group_messages',
      'verse_highlights',
      'verse_notes',
      'memorized_verses'
    ];
    for (const tbl of tablesWithUserId) {
      try {
        await db.execAsync(`ALTER TABLE ${tbl} ADD COLUMN user_id TEXT DEFAULT 'guest_user';`);
      } catch {
        // Column already exists
      }
    }

    // Safe migration for user_profile columns
    try {
      await db.execAsync(`ALTER TABLE user_profile ADD COLUMN gender TEXT DEFAULT 'neutral';`);
    } catch {
      // Column already exists
    }
    try {
      await db.execAsync(`ALTER TABLE user_profile ADD COLUMN church_role TEXT DEFAULT NULL;`);
    } catch {
      // Column already exists
    }
    try {
      await db.execAsync(`ALTER TABLE user_profile ADD COLUMN church_name TEXT DEFAULT NULL;`);
    } catch {
      // Column already exists
    }
    try {
      await db.execAsync(`ALTER TABLE user_profile ADD COLUMN age_bracket TEXT DEFAULT NULL;`);
    } catch {
      // Column already exists
    }
    try {
      await db.execAsync(`ALTER TABLE user_profile ADD COLUMN comprehension_level TEXT DEFAULT NULL;`);
    } catch {
      // Column already exists
    }
    try {
      await db.execAsync(`ALTER TABLE user_profile ADD COLUMN onboarding_completed INTEGER DEFAULT 0;`);
    } catch {
      // Column already exists
    }
  } catch (e) {
    console.warn('Table creation note:', e);
  }
};

// Database Operations
export const fetchConversations = async (): Promise<ConversationThread[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          personaId: r.persona_id,
          personaName: r.persona_name,
          lastMessage: r.last_message,
          lastMessageSender: r.last_message_sender as 'user' | 'assistant',
          updatedAt: r.updated_at
        }));
      }
    } catch (e) {
      console.warn('fetchConversations error:', e);
    }
  }
  return memoryConversations;
};

export const fetchMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM messages WHERE conversation_id = ? AND user_id = ? ORDER BY timestamp ASC',
        [conversationId, userId]
      );
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          conversationId: r.conversation_id,
          sender: r.sender as 'user' | 'assistant',
          content: r.content,
          timestamp: r.timestamp,
          bookmarked: Boolean(r.bookmarked)
        }));
      }
    } catch (e) {
      console.warn('fetchMessages error:', e);
    }
  }
  return memoryMessages[conversationId] || [];
};

export const saveMessage = async (msg: ChatMessage, personaName: string, personaId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  // Update memory
  if (!memoryMessages[msg.conversationId]) {
    memoryMessages[msg.conversationId] = [];
  }
  memoryMessages[msg.conversationId].push(msg);

  const preview = msg.sender === 'user' ? `You: ${msg.content}` : msg.content;
  const existingConvIndex = memoryConversations.findIndex(c => c.id === msg.conversationId);
  const convItem: ConversationThread = {
    id: msg.conversationId,
    personaId,
    personaName,
    lastMessage: preview,
    lastMessageSender: msg.sender,
    updatedAt: msg.timestamp
  };

  if (existingConvIndex >= 0) {
    memoryConversations[existingConvIndex] = convItem;
  } else {
    memoryConversations.unshift(convItem);
  }

  // Update SQLite
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO messages (id, user_id, conversation_id, sender, content, timestamp, bookmarked) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [msg.id, userId, msg.conversationId, msg.sender, msg.content, msg.timestamp, msg.bookmarked ? 1 : 0]
      );

      await db.runAsync(
        'INSERT OR REPLACE INTO conversations (id, user_id, persona_id, persona_name, last_message, last_message_sender, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [msg.conversationId, userId, personaId, personaName, preview, msg.sender, msg.timestamp]
      );

      if (msg.sender === 'user') {
        recordDailyActivity('apostle_chat', 20).catch(console.warn);
      }
    } catch (e) {
      console.warn('saveMessage SQLite error:', e);
    }
  }
};

export const fetchBookmarks = async (): Promise<SavedBookmark[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY timestamp DESC',
        [userId]
      );
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          type: r.type as 'verse' | 'quote',
          title: r.title,
          content: r.content,
          reference: r.reference,
          author: r.author,
          timestamp: r.timestamp
        }));
      }
    } catch (e) {
      console.warn('fetchBookmarks error:', e);
    }
  }
  return memoryBookmarks;
};

export const saveBookmark = async (bookmark: SavedBookmark): Promise<void> => {
  const userId = await getCurrentUserId();
  memoryBookmarks.unshift(bookmark);
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO bookmarks (id, user_id, type, title, content, reference, author, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [bookmark.id, userId, bookmark.type, bookmark.title, bookmark.content, bookmark.reference || '', bookmark.author || '', bookmark.timestamp]
      );
    } catch (e) {
      console.warn('saveBookmark SQLite error:', e);
    }
  }
};

export const removeBookmark = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  memoryBookmarks = memoryBookmarks.filter(b => b.id !== id);
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [id, userId]);
    } catch (e) {
      console.warn('removeBookmark SQLite error:', e);
    }
  }
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const row = await db.getFirstAsync<any>('SELECT * FROM user_profile WHERE id = ?', [userId]);
      if (row) {
        return {
          fullName: row.full_name,
          email: row.email,
          bio: row.bio,
          location: row.location,
          dateOfBirth: row.date_of_birth,
          gender: row.gender || 'neutral',
          churchRole: row.church_role || undefined,
          churchName: row.church_name || undefined,
          ageBracket: row.age_bracket || undefined,
          comprehensionLevel: row.comprehension_level || undefined,
          onboardingCompleted: Boolean(row.onboarding_completed)
        };
      }
    } catch (e) {
      console.warn('fetchUserProfile error:', e);
    }
  }
  return memoryProfile;
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  const userId = profile.id || await getCurrentUserId();
  memoryProfile = { ...profile, id: userId };
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO user_profile (id, full_name, email, bio, location, date_of_birth, gender, church_role, church_name, age_bracket, comprehension_level, onboarding_completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          profile.fullName,
          profile.email,
          profile.bio,
          profile.location,
          profile.dateOfBirth,
          profile.gender || 'neutral',
          profile.churchRole || null,
          profile.churchName || null,
          profile.ageBracket || null,
          profile.comprehensionLevel || null,
          profile.onboardingCompleted ? 1 : 0
        ]
      );
    } catch (e) {
      console.warn('saveUserProfile SQLite error:', e);
    }
  }
};

export const incrementAndGetSessionCount = async (): Promise<number> => {
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS app_session_tracker (
          id TEXT PRIMARY KEY NOT NULL,
          session_count INTEGER NOT NULL,
          last_opened INTEGER NOT NULL
        );
      `);
      const row = await db.getFirstAsync<any>('SELECT session_count FROM app_session_tracker WHERE id = ?', ['app']);
      const count = (row ? row.session_count : 0) + 1;
      await db.runAsync(
        'INSERT OR REPLACE INTO app_session_tracker (id, session_count, last_opened) VALUES (?, ?, ?)',
        ['app', count, Date.now()]
      );
      return count;
    } catch (e) {
      console.warn('incrementAndGetSessionCount error:', e);
    }
  }
  return 2;
};

export const clearChatHistory = async (): Promise<void> => {
  const userId = await getCurrentUserId();
  memoryConversations = [];
  memoryMessages = {};
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM messages WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM conversations WHERE user_id = ?', [userId]);
    } catch (e) {
      console.warn('clearChatHistory SQLite error:', e);
    }
  }
};

// Migrate all existing guest conversations, bookmarks, and profiles to genuine user ID
export const migrateGuestDataToUser = async (newUserId: string): Promise<{
  bookmarksCount: number;
  conversationsCount: number;
}> => {
  const db = await getDB();
  const guestId = await getOrCreateGuestId();
  if (db) {
    try {
      const tables = [
        'conversations',
        'messages',
        'bookmarks',
        'user_reading_progress',
        'group_conversations',
        'group_messages',
        'verse_highlights',
        'verse_notes',
        'memorized_verses'
      ];
      for (const t of tables) {
        await db.runAsync(
          `UPDATE ${t} SET user_id = ? WHERE user_id = 'guest_user' OR user_id = ?`,
          [newUserId, guestId]
        );
      }
    } catch (e) {
      console.warn('migrateGuestDataToUser SQLite error:', e);
    }
  }

  const bookmarks = await fetchBookmarks();
  const conversations = await fetchConversations();
  const currentProfile = await fetchUserProfile();

  // Save the updated profile under the genuine user ID
  await saveUserProfile({
    ...currentProfile,
    id: newUserId
  });

  return {
    bookmarksCount: bookmarks.length,
    conversationsCount: conversations.length
  };
};

// Clear all personal user data upon sign-out to prevent data bleeding across multiple accounts
export const clearLocalUserSession = async (): Promise<void> => {
  memoryConversations = [];
  memoryMessages = {};
  memoryBookmarks = [];
  memoryProfile = { ...DEFAULT_PROFILE };
  memoryHighlights = {};
  memoryNotes = {};
  memoryMemorizedVerses = {};
  memoryGroupThreads = [];
  memoryGroupMessages = {};

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM messages');
      await db.runAsync('DELETE FROM conversations');
      await db.runAsync('DELETE FROM bookmarks');
      await db.runAsync('DELETE FROM user_profile');
      await db.runAsync('DELETE FROM verse_highlights');
      await db.runAsync('DELETE FROM verse_notes');
      await db.runAsync('DELETE FROM memorized_verses');
      await db.runAsync('DELETE FROM user_reading_progress');
      await db.runAsync('DELETE FROM group_messages');
      await db.runAsync('DELETE FROM group_conversations');
      await db.runAsync('DELETE FROM completed_deeds');
      await db.runAsync('DELETE FROM daily_activity_log');
    } catch (e) {
      console.warn('clearLocalUserSession SQLite error:', e);
    }
  }
};

export const deleteAllUserData = clearLocalUserSession;

// =========================================================================
// COUNCIL OF FAITH (GROUP CHAT) DATABASE OPERATIONS
// =========================================================================

export const createGroupThread = async (
  name: string,
  topic: string,
  memberApostleIds: string[]
): Promise<GroupCouncilThread> => {
  const userId = await getCurrentUserId();
  const newThread: GroupCouncilThread = {
    id: `council_${userId}_${Date.now()}`,
    name,
    topic,
    memberApostleIds,
    lastMessage: 'Fellowship opened. The Apostles have gathered.',
    lastMessageSenderName: 'Council',
    updatedAt: Date.now()
  };

  memoryGroupThreads.unshift(newThread);

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO group_conversations (id, user_id, name, topic, member_apostle_ids, last_message, last_message_sender_name, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newThread.id, userId, newThread.name, newThread.topic, JSON.stringify(newThread.memberApostleIds), newThread.lastMessage, newThread.lastMessageSenderName, newThread.updatedAt]
      );
    } catch (e) {
      console.warn('createGroupThread SQLite error:', e);
    }
  }

  return newThread;
};

export const fetchGroupThreads = async (): Promise<GroupCouncilThread[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM group_conversations WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          name: r.name,
          topic: r.topic,
          memberApostleIds: JSON.parse(r.member_apostle_ids || '[]'),
          lastMessage: r.last_message || '',
          lastMessageSenderName: r.last_message_sender_name || '',
          updatedAt: r.updated_at
        }));
      }
    } catch (e) {
      console.warn('fetchGroupThreads SQLite error:', e);
    }
  }
  return memoryGroupThreads;
};

export const fetchGroupMessages = async (threadId: string): Promise<GroupCouncilMessage[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM group_messages WHERE thread_id = ? AND user_id = ? ORDER BY timestamp ASC',
        [threadId, userId]
      );
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          threadId: r.thread_id,
          senderType: r.sender_type as 'user' | 'apostle',
          apostleId: r.apostle_id || undefined,
          apostleName: r.apostle_name || undefined,
          content: r.content,
          timestamp: r.timestamp,
          replyTo: r.reply_to ? JSON.parse(r.reply_to) : undefined,
          mentions: r.mentions ? JSON.parse(r.mentions) : undefined,
          bookmarked: Boolean(r.bookmarked)
        }));
      }
    } catch (e) {
      console.warn('fetchGroupMessages SQLite error:', e);
    }
  }
  return memoryGroupMessages[threadId] || [];
};

export const saveGroupMessage = async (
  msg: GroupCouncilMessage,
  threadName?: string
): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!memoryGroupMessages[msg.threadId]) {
    memoryGroupMessages[msg.threadId] = [];
  }
  memoryGroupMessages[msg.threadId].push(msg);

  const senderLabel = msg.senderType === 'user' ? 'You' : msg.apostleName || 'Apostle';
  const lastMsgSnippet = `${senderLabel}: ${msg.content.substring(0, 75)}`;

  const threadIndex = memoryGroupThreads.findIndex(t => t.id === msg.threadId);
  if (threadIndex >= 0) {
    memoryGroupThreads[threadIndex].lastMessage = lastMsgSnippet;
    memoryGroupThreads[threadIndex].lastMessageSenderName = senderLabel;
    memoryGroupThreads[threadIndex].updatedAt = msg.timestamp;
  }

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO group_messages (id, user_id, thread_id, sender_type, apostle_id, apostle_name, content, timestamp, reply_to, mentions, bookmarked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          msg.id,
          userId,
          msg.threadId,
          msg.senderType,
          msg.apostleId || null,
          msg.apostleName || null,
          msg.content,
          msg.timestamp,
          msg.replyTo ? JSON.stringify(msg.replyTo) : null,
          msg.mentions ? JSON.stringify(msg.mentions) : null,
          msg.bookmarked ? 1 : 0
        ]
      );

      await db.runAsync(
        `UPDATE group_conversations SET last_message = ?, last_message_sender_name = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
        [lastMsgSnippet, senderLabel, msg.timestamp, msg.threadId, userId]
      );
    } catch (e) {
      console.warn('saveGroupMessage SQLite error:', e);
    }
  }
};

export const deleteGroupThread = async (threadId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  memoryGroupThreads = memoryGroupThreads.filter(t => t.id !== threadId);
  delete memoryGroupMessages[threadId];

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM group_messages WHERE thread_id = ? AND user_id = ?', [threadId, userId]);
      await db.runAsync('DELETE FROM group_conversations WHERE id = ? AND user_id = ?', [threadId, userId]);
    } catch (e) {
      console.warn('deleteGroupThread SQLite error:', e);
    }
  }
};

// =========================================================================
// VERSE HIGHLIGHTS & NOTES OPERATIONS
// =========================================================================

export const saveVerseHighlight = async (
  book: string,
  chapter: number,
  verse: number,
  color: string,
  verseText: string
): Promise<void> => {
  const userId = await getCurrentUserId();
  const id = `hl_${userId}_${book}_${chapter}_${verse}`;
  const hl: VerseHighlight = { id, book, chapter, verse, color, verseText, timestamp: Date.now() };
  memoryHighlights[id] = hl;

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO verse_highlights (id, user_id, book, chapter, verse, color, verse_text, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, book, chapter, verse, color, verseText, hl.timestamp]
      );
    } catch (e) {
      console.warn('saveVerseHighlight error:', e);
    }
  }
};

export const removeVerseHighlight = async (
  book: string,
  chapter: number,
  verse: number
): Promise<void> => {
  const userId = await getCurrentUserId();
  const id = `hl_${userId}_${book}_${chapter}_${verse}`;
  delete memoryHighlights[id];

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        'DELETE FROM verse_highlights WHERE (id = ? OR (book = ? AND chapter = ? AND verse = ?)) AND user_id = ?',
        [id, book, chapter, verse, userId]
      );
    } catch (e) {
      console.warn('removeVerseHighlight error:', e);
    }
  }
};

export const fetchHighlightsForChapter = async (
  book: string,
  chapter: number
): Promise<Record<number, string>> => {
  const userId = await getCurrentUserId();
  const result: Record<number, string> = {};

  // Check memory
  for (const key in memoryHighlights) {
    const hl = memoryHighlights[key];
    if (hl.book === book && hl.chapter === chapter && hl.id.startsWith(`hl_${userId}_`)) {
      result[hl.verse] = hl.color;
    }
  }

  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<{ verse: number; color: string }>(
        'SELECT verse, color FROM verse_highlights WHERE book = ? AND chapter = ? AND user_id = ?',
        [book, chapter, userId]
      );
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          result[r.verse] = r.color;
        });
      }
    } catch (e) {
      console.warn('fetchHighlightsForChapter error:', e);
    }
  }

  return result;
};

export const fetchAllHighlights = async (): Promise<VerseHighlight[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<{
        id: string;
        book: string;
        chapter: number;
        verse: number;
        color: string;
        verse_text: string;
        timestamp: number;
      }>('SELECT * FROM verse_highlights WHERE user_id = ? ORDER BY timestamp DESC', [userId]);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          book: r.book,
          chapter: r.chapter,
          verse: r.verse,
          color: r.color,
          verseText: r.verse_text,
          timestamp: r.timestamp
        }));
      }
    } catch (e) {
      console.warn('fetchAllHighlights error:', e);
    }
  }
  return Object.values(memoryHighlights).filter(h => h.id.startsWith(`hl_${userId}_`));
};

export const saveVerseNote = async (
  book: string,
  chapter: number,
  verse: number,
  reference: string,
  verseText: string,
  noteText: string
): Promise<void> => {
  const userId = await getCurrentUserId();
  const id = `note_${userId}_${book}_${chapter}_${verse}`;
  const noteItem: VerseNote = {
    id,
    book,
    chapter,
    verse,
    reference,
    verseText,
    noteText,
    timestamp: Date.now()
  };
  memoryNotes[id] = noteItem;

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO verse_notes (id, user_id, book, chapter, verse, reference, verse_text, note_text, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, book, chapter, verse, reference, verseText, noteText, noteItem.timestamp]
      );
    } catch (e) {
      console.warn('saveVerseNote error:', e);
    }
  }
};

export const fetchNotesForChapter = async (
  book: string,
  chapter: number
): Promise<Record<number, string>> => {
  const userId = await getCurrentUserId();
  const result: Record<number, string> = {};

  for (const key in memoryNotes) {
    const n = memoryNotes[key];
    if (n.book === book && n.chapter === chapter && n.id.startsWith(`note_${userId}_`)) {
      result[n.verse] = n.noteText;
    }
  }

  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<{ verse: number; note_text: string }>(
        'SELECT verse, note_text FROM verse_notes WHERE book = ? AND chapter = ? AND user_id = ?',
        [book, chapter, userId]
      );
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          result[r.verse] = r.note_text;
        });
      }
    } catch (e) {
      console.warn('fetchNotesForChapter error:', e);
    }
  }

  return result;
};

export const fetchAllVerseNotes = async (): Promise<VerseNote[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<{
        id: string;
        book: string;
        chapter: number;
        verse: number;
        reference: string;
        verse_text: string;
        note_text: string;
        timestamp: number;
      }>('SELECT * FROM verse_notes WHERE user_id = ? ORDER BY timestamp DESC', [userId]);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          book: r.book,
          chapter: r.chapter,
          verse: r.verse,
          reference: r.reference,
          verseText: r.verse_text,
          noteText: r.note_text,
          timestamp: r.timestamp
        }));
      }
    } catch (e) {
      console.warn('fetchAllVerseNotes error:', e);
    }
  }
  return Object.values(memoryNotes).filter(n => n.id.startsWith(`note_${userId}_`));
};

export const deleteVerseNote = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  delete memoryNotes[id];
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM verse_notes WHERE id = ? AND user_id = ?', [id, userId]);
    } catch (e) {
      console.warn('deleteVerseNote error:', e);
    }
  }
};

export const saveMemorizedVerse = async (
  reference: string,
  verseText: string,
  version: string = 'NIV'
): Promise<void> => {
  const userId = await getCurrentUserId();
  const id = `mem_${userId}_${reference.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const now = Date.now();
  const existing = memoryMemorizedVerses[id];
  const count = existing ? existing.practiceCount + 1 : 1;

  memoryMemorizedVerses[id] = {
    id,
    reference,
    verseText,
    version,
    masteredAt: now,
    practiceCount: count
  };

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO memorized_verses (id, user_id, reference, verse_text, version, mastered_at, practice_count)
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(id) DO UPDATE SET
           practice_count = practice_count + 1,
           mastered_at = excluded.mastered_at;`,
        [id, userId, reference, verseText, version, now]
      );
    } catch (e) {
      console.warn('saveMemorizedVerse SQLite error:', e);
    }
  }
};

export const fetchMemorizedVerses = async (): Promise<MemorizedVerse[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<{
        id: string;
        reference: string;
        verse_text: string;
        version: string;
        mastered_at: number;
        practice_count: number;
      }>('SELECT * FROM memorized_verses WHERE user_id = ? ORDER BY mastered_at DESC', [userId]);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          reference: r.reference,
          verseText: r.verse_text,
          version: r.version,
          masteredAt: r.mastered_at,
          practiceCount: r.practice_count || 1
        }));
      }
    } catch (e) {
      console.warn('fetchMemorizedVerses SQLite error:', e);
    }
  }
  return Object.values(memoryMemorizedVerses).filter(m => m.id.startsWith(`mem_${userId}_`));
};

export const isVerseMemorized = async (reference: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  const id = `mem_${userId}_${reference.replace(/[^a-zA-Z0-9]/g, '_')}`;
  if (memoryMemorizedVerses[id]) return true;
  const db = await getDB();
  if (db) {
    try {
      const row = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM memorized_verses WHERE (id = ? OR reference = ?) AND user_id = ?',
        [id, reference, userId]
      );
      return !!row;
    } catch (e) {
      return false;
    }
  }
  return false;
};

export const saveDatabaseReadingProgress = async (
  book: string,
  chapter: number,
  translation: string,
  verse?: number,
  snippet?: string,
  estimatedMinutes?: number
): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  const now = Date.now();
  const id = `current_${userId}`;
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO user_reading_progress (id, user_id, book, chapter, verse, translation, snippet, estimated_minutes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, book, chapter, verse || 1, translation, snippet || '', estimatedMinutes || 3, now]
      );
    } catch (e) {
      console.warn('Error saving user_reading_progress to SQLite:', e);
    }
  }
};

export const fetchDatabaseReadingProgress = async (): Promise<any | null> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  const id = `current_${userId}`;
  if (db) {
    try {
      const row = await db.getFirstAsync<any>(
        `SELECT * FROM user_reading_progress WHERE (id = ? OR id = 'current') AND (user_id = ? OR user_id = 'guest_user') ORDER BY updated_at DESC LIMIT 1;`,
        [id, userId]
      );
      if (row) {
        return {
          book: row.book,
          chapter: row.chapter,
          verse: row.verse,
          translation: row.translation,
          snippet: row.snippet,
          estimatedMinutesRemaining: row.estimated_minutes,
          updatedAt: row.updated_at
        };
      }
    } catch (e) {
      console.warn('Error fetching user_reading_progress from SQLite:', e);
    }
  }
  return null;
};
