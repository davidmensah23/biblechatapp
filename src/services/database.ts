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
  status?: 'practicing' | 'mastered';
}

export type SyncListener = {
  onBookmarkSaved?: (b: SavedBookmark) => void;
  onBookmarkRemoved?: (ref: string) => void;
  onNoteSaved?: (n: VerseNote) => void;
  onHighlightSaved?: (h: VerseHighlight) => void;
  onMemorizedSaved?: (m: MemorizedVerse) => void;
  onConversationSaved?: (c: ConversationThread) => void;
  onMessageSaved?: (m: ChatMessage, conversationId: string) => void;
  onGroupThreadSaved?: (t: GroupCouncilThread) => void;
  onGroupMessageSaved?: (m: GroupCouncilMessage) => void;
  onReadingProgressSaved?: (p: any) => void;
  onDeedCompleted?: (d: any) => void;
  onActivityLogged?: (a: any) => void;
};
let activeSyncListener: SyncListener | null = null;
export const registerSyncListener = (listener: SyncListener) => {
  activeSyncListener = listener;
};
export const getActiveSyncListener = (): SyncListener | null => activeSyncListener;

export const markRecordSynced = async (table: string, id: string): Promise<void> => {
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(`UPDATE ${table} SET synced = 1 WHERE id = ?`, [id]);
    } catch (e) {
      console.warn(`markRecordSynced on ${table} error:`, e);
    }
  }
};

export const fetchPendingSyncRecords = async (table: string): Promise<any[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(`SELECT * FROM ${table} WHERE user_id = ? AND synced = 0`, [userId]);
      return rows || [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

// Internal pub/sub for local UI components to instantly react to database mutations
const dbChangeListeners: Set<() => void> = new Set();
export const subscribeToDatabaseChanges = (callback: () => void): (() => void) => {
  dbChangeListeners.add(callback);
  return () => {
    dbChangeListeners.delete(callback);
  };
};
export const notifyDatabaseChanged = () => {
  dbChangeListeners.forEach(cb => {
    try { cb(); } catch (e) { console.warn('dbChangeListener error:', e); }
  });
};


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

// Returns current Supabase user ID or guest device ID (fast in-memory/cache check first)
export const getCurrentUserId = async (): Promise<string> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;
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
        bookmarked INTEGER DEFAULT 0,
        scripture_references TEXT
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

      CREATE TABLE IF NOT EXISTS completed_deeds (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        deed_id TEXT NOT NULL,
        title TEXT NOT NULL,
        reflection TEXT,
        location_name TEXT,
        latitude REAL,
        longitude REAL,
        scripture_ref TEXT,
        xp_awarded INTEGER NOT NULL,
        completed_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_activity_log (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT DEFAULT 'guest_user',
        date_str TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        xp_earned INTEGER DEFAULT 0,
        timestamp INTEGER NOT NULL
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
      'memorized_verses',
      'completed_deeds',
      'daily_activity_log'
    ];
    for (const tbl of tablesWithUserId) {
      try {
        await db.execAsync(`ALTER TABLE ${tbl} ADD COLUMN user_id TEXT DEFAULT 'guest_user';`);
      } catch {
        // Column already exists
      }
    }

    // Safe migration for synced column across all multi-tenant tables
    const tablesWithSynced = [
      'bookmarks',
      'memorized_verses',
      'verse_notes',
      'verse_highlights',
      'conversations',
      'messages',
      'group_conversations',
      'group_messages',
      'user_reading_progress',
      'completed_deeds',
      'daily_activity_log'
    ];
    for (const tbl of tablesWithSynced) {
      try {
        await db.execAsync(`ALTER TABLE ${tbl} ADD COLUMN synced INTEGER DEFAULT 1;`);
      } catch {
        // Column already exists
      }
    }

    // Safe migration for scripture_references column on messages table
    try {
      await db.execAsync(`ALTER TABLE messages ADD COLUMN scripture_references TEXT;`);
    } catch {
      // Column already exists
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
    // Safe migration for memorized_verses status column ('practicing' | 'mastered')
    try {
      await db.execAsync(`ALTER TABLE memorized_verses ADD COLUMN status TEXT DEFAULT 'mastered';`);
    } catch {
      // Column already exists
    }

    // Pre-emptively deduplicate any legacy duplicate rows before applying unique indices
    try {
      await db.execAsync(`
        DELETE FROM bookmarks WHERE rowid NOT IN (SELECT MIN(rowid) FROM bookmarks GROUP BY user_id, reference);
        DELETE FROM memorized_verses WHERE rowid NOT IN (SELECT MIN(rowid) FROM memorized_verses GROUP BY user_id, reference);
        DELETE FROM verse_notes WHERE rowid NOT IN (SELECT MIN(rowid) FROM verse_notes GROUP BY user_id, book, chapter, verse);
        DELETE FROM verse_highlights WHERE rowid NOT IN (SELECT MIN(rowid) FROM verse_highlights GROUP BY user_id, book, chapter, verse);
        DELETE FROM conversations WHERE rowid NOT IN (SELECT MIN(rowid) FROM conversations GROUP BY user_id, persona_id);
        DELETE FROM group_conversations WHERE rowid NOT IN (SELECT MIN(rowid) FROM group_conversations GROUP BY user_id, name);
        DELETE FROM user_reading_progress WHERE rowid NOT IN (SELECT MIN(rowid) FROM user_reading_progress GROUP BY user_id);
        DELETE FROM completed_deeds WHERE rowid NOT IN (SELECT MIN(rowid) FROM completed_deeds GROUP BY user_id, deed_id, completed_at);
        DELETE FROM daily_activity_log WHERE rowid NOT IN (SELECT MIN(rowid) FROM daily_activity_log GROUP BY user_id, date_str, activity_type);

        CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_ref ON bookmarks(user_id, reference);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_memorized_user_ref ON memorized_verses(user_id, reference);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_verse_notes_user_bcv ON verse_notes(user_id, book, chapter, verse);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_verse_hl_user_bcv ON verse_highlights(user_id, book, chapter, verse);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_progress_user ON user_reading_progress(user_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_user_persona ON conversations(user_id, persona_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_group_conv_user_name ON group_conversations(user_id, name);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_completed_deeds_user_deed_at ON completed_deeds(user_id, deed_id, completed_at);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_log_user_date_type ON daily_activity_log(user_id, date_str, activity_type);
      `);
    } catch (idxErr) {
      console.warn('Error deduplicating and creating local unique indexes:', idxErr);
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
        return rows.map(r => {
          let scriptureReferences: string[] | undefined;
          if (r.scripture_references) {
            try {
              scriptureReferences = JSON.parse(r.scripture_references);
            } catch {}
          }
          return {
            id: r.id,
            conversationId: r.conversation_id,
            sender: r.sender as 'user' | 'assistant',
            content: r.content,
            timestamp: r.timestamp,
            bookmarked: Boolean(r.bookmarked),
            scriptureReferences
          };
        });
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
        'INSERT OR REPLACE INTO messages (id, user_id, conversation_id, sender, content, timestamp, bookmarked, scripture_references, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
        [
          msg.id,
          userId,
          msg.conversationId,
          msg.sender,
          msg.content,
          msg.timestamp,
          msg.bookmarked ? 1 : 0,
          msg.scriptureReferences ? JSON.stringify(msg.scriptureReferences) : null
        ]
      );

      await db.runAsync(
        'INSERT OR REPLACE INTO conversations (id, user_id, persona_id, persona_name, last_message, last_message_sender, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        [msg.conversationId, userId, personaId, personaName, preview, msg.sender, msg.timestamp]
      );

      if (msg.sender === 'user') {
        recordDailyActivity('apostle_chat', 20).catch(console.warn);
      }
    } catch (e) {
      console.warn('saveMessage SQLite error:', e);
    }
  }

  // Background Cloud Sync
  activeSyncListener?.onMessageSaved?.(msg, msg.conversationId);
  activeSyncListener?.onConversationSaved?.(convItem);
  notifyDatabaseChanged();
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
  memoryBookmarks = memoryBookmarks.filter(b => !(b.reference && bookmark.reference && b.reference === bookmark.reference));
  memoryBookmarks.unshift(bookmark);
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO bookmarks (id, user_id, type, title, content, reference, author, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON CONFLICT(user_id, reference) DO UPDATE SET
           title = excluded.title,
           content = excluded.content,
           author = excluded.author,
           timestamp = excluded.timestamp,
           synced = 0;`,
        [bookmark.id, userId, bookmark.type, bookmark.title, bookmark.content, bookmark.reference || '', bookmark.author || '', bookmark.timestamp]
      );
    } catch (e) {
      console.warn('saveBookmark SQLite error:', e);
    }
  }

  // Background Cloud Sync
  activeSyncListener?.onBookmarkSaved?.(bookmark);
  notifyDatabaseChanged();
};

export const removeBookmark = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  const target = memoryBookmarks.find(b => b.id === id);
  memoryBookmarks = memoryBookmarks.filter(b => b.id !== id);
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [id, userId]);
    } catch (e) {
      console.warn('removeBookmark SQLite error:', e);
    }
  }

  // Background Cloud Sync
  if (target?.reference) {
    activeSyncListener?.onBookmarkRemoved?.(target.reference);
  }
  notifyDatabaseChanged();
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
      // 1. Bookmarks: INSERT ... ON CONFLICT DO NOTHING
      await db.runAsync(
        `INSERT INTO bookmarks (id, user_id, type, title, content, reference, author, timestamp, synced)
         SELECT 'bm_' || ? || '_' || hex(randomblob(6)), ?, type, title, content, reference, author, timestamp, 0
         FROM bookmarks WHERE user_id = 'guest_user' OR user_id = ?
         ON CONFLICT(user_id, reference) DO NOTHING;`,
        [newUserId, newUserId, guestId]
      );
      await db.runAsync(`DELETE FROM bookmarks WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);

      // 2. Memorized Verses: INSERT ... ON CONFLICT DO NOTHING
      await db.runAsync(
        `INSERT INTO memorized_verses (id, user_id, reference, verse_text, version, mastered_at, practice_count, status, synced)
         SELECT 'mem_' || ? || '_' || REPLACE(reference, ' ', '_'), ?, reference, verse_text, version, mastered_at, practice_count, status, 0
         FROM memorized_verses WHERE user_id = 'guest_user' OR user_id = ?
         ON CONFLICT(user_id, reference) DO NOTHING;`,
        [newUserId, newUserId, guestId]
      );
      await db.runAsync(`DELETE FROM memorized_verses WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);

      // 3. Verse Notes: INSERT ... ON CONFLICT DO NOTHING
      await db.runAsync(
        `INSERT INTO verse_notes (id, user_id, book, chapter, verse, reference, verse_text, note_text, timestamp, synced)
         SELECT 'note_' || ? || '_' || book || '_' || chapter || '_' || verse, ?, book, chapter, verse, reference, verse_text, note_text, timestamp, 0
         FROM verse_notes WHERE user_id = 'guest_user' OR user_id = ?
         ON CONFLICT(user_id, book, chapter, verse) DO NOTHING;`,
        [newUserId, newUserId, guestId]
      );
      await db.runAsync(`DELETE FROM verse_notes WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);

      // 4. Verse Highlights: INSERT ... ON CONFLICT DO NOTHING
      await db.runAsync(
        `INSERT INTO verse_highlights (id, user_id, book, chapter, verse, color, verse_text, timestamp, synced)
         SELECT 'hl_' || ? || '_' || book || '_' || chapter || '_' || verse, ?, book, chapter, verse, color, verse_text, timestamp, 0
         FROM verse_highlights WHERE user_id = 'guest_user' OR user_id = ?
         ON CONFLICT(user_id, book, chapter, verse) DO NOTHING;`,
        [newUserId, newUserId, guestId]
      );
      await db.runAsync(`DELETE FROM verse_highlights WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);

      // 5. Completed Deeds: INSERT OR IGNORE
      await db.runAsync(
        `INSERT OR IGNORE INTO completed_deeds (id, user_id, deed_id, title, reflection, location_name, latitude, longitude, scripture_ref, xp_awarded, completed_at, synced)
         SELECT 'deed_' || ? || '_' || deed_id || '_' || completed_at, ?, deed_id, title, reflection, location_name, latitude, longitude, scripture_ref, xp_awarded, completed_at, 0
         FROM completed_deeds WHERE user_id = 'guest_user' OR user_id = ?;`,
        [newUserId, newUserId, guestId]
      );
      await db.runAsync(`DELETE FROM completed_deeds WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);

      // 6. Daily Activity Log: INSERT OR IGNORE
      await db.runAsync(
        `INSERT OR IGNORE INTO daily_activity_log (id, user_id, date_str, activity_type, xp_earned, timestamp, synced)
         SELECT 'act_' || ? || '_' || date_str || '_' || activity_type, ?, date_str, activity_type, xp_earned, timestamp, 0
         FROM daily_activity_log WHERE user_id = 'guest_user' OR user_id = ?;`,
        [newUserId, newUserId, guestId]
      );
      await db.runAsync(`DELETE FROM daily_activity_log WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);

      // 7. User Reading Progress: INSERT OR IGNORE
      await db.runAsync(
        `INSERT OR IGNORE INTO user_reading_progress (id, user_id, book, chapter, verse, translation, snippet, estimated_minutes, updated_at, synced)
         SELECT 'current_' || ?, ?, book, chapter, verse, translation, snippet, estimated_minutes, updated_at, 0
         FROM user_reading_progress WHERE user_id = 'guest_user' OR user_id = ?;`,
        [newUserId, newUserId, guestId]
      );
      await db.runAsync(`DELETE FROM user_reading_progress WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);

      // 8. Conversations & Messages
      const guestConversations = await db.getAllAsync<any>(
        `SELECT * FROM conversations WHERE user_id = 'guest_user' OR user_id = ?`,
        [guestId]
      );
      if (guestConversations && guestConversations.length > 0) {
        for (const gc of guestConversations) {
          const userConv = await db.getFirstAsync<any>(
            `SELECT id FROM conversations WHERE user_id = ? AND persona_id = ?`,
            [newUserId, gc.persona_id]
          );
          if (!userConv) {
            await db.runAsync(
              `INSERT OR REPLACE INTO conversations (id, user_id, persona_id, persona_name, last_message, last_message_sender, updated_at, synced)
               VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
              [gc.id, newUserId, gc.persona_id, gc.persona_name, gc.last_message, gc.last_message_sender, gc.updated_at]
            );
          }
          await db.runAsync(
            `UPDATE messages SET user_id = ?, synced = 0 WHERE (user_id = 'guest_user' OR user_id = ?) AND conversation_id = ?`,
            [newUserId, guestId, gc.id]
          );
        }
        await db.runAsync(`DELETE FROM conversations WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);
      }

      // 9. Group Conversations & Group Messages
      const guestGroupThreads = await db.getAllAsync<any>(
        `SELECT * FROM group_conversations WHERE user_id = 'guest_user' OR user_id = ?`,
        [guestId]
      );
      if (guestGroupThreads && guestGroupThreads.length > 0) {
        for (const gt of guestGroupThreads) {
          const userThread = await db.getFirstAsync<any>(
            `SELECT id FROM group_conversations WHERE user_id = ? AND name = ?`,
            [newUserId, gt.name]
          );
          if (!userThread) {
            await db.runAsync(
              `INSERT OR REPLACE INTO group_conversations (id, user_id, name, topic, member_apostle_ids, last_message, last_message_sender_name, updated_at, synced)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
              [gt.id, newUserId, gt.name, gt.topic, gt.member_apostle_ids, gt.last_message, gt.last_message_sender_name, gt.updated_at]
            );
          }
          await db.runAsync(
            `UPDATE group_messages SET user_id = ?, synced = 0 WHERE (user_id = 'guest_user' OR user_id = ?) AND thread_id = ?`,
            [newUserId, guestId, gt.id]
          );
        }
        await db.runAsync(`DELETE FROM group_conversations WHERE user_id = 'guest_user' OR user_id = ?;`, [guestId]);
      }
    } catch (e) {
      console.warn('migrateGuestDataToUser SQLite error:', e);
    }
  }

  // Update in-memory state keys to point to new user ID
  for (const k in memoryMemorizedVerses) {
    const item = memoryMemorizedVerses[k];
    const newKey = `mem_${newUserId}_${item.reference.replace(/[^a-zA-Z0-9]/g, '_')}`;
    memoryMemorizedVerses[newKey] = { ...item, id: newKey };
    if (k !== newKey) delete memoryMemorizedVerses[k];
  }

  const bookmarks = await fetchBookmarks();
  const conversations = await fetchConversations();
  const currentProfile = await fetchUserProfile();

  // Save the updated profile under the genuine user ID
  await saveUserProfile({
    ...currentProfile,
    id: newUserId
  });

  notifyDatabaseChanged();

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
      await db.execAsync(`
        BEGIN TRANSACTION;
        DELETE FROM messages;
        DELETE FROM conversations;
        DELETE FROM bookmarks;
        DELETE FROM user_profile;
        DELETE FROM verse_highlights;
        DELETE FROM verse_notes;
        DELETE FROM memorized_verses;
        DELETE FROM user_reading_progress;
        DELETE FROM group_messages;
        DELETE FROM group_conversations;
        DELETE FROM completed_deeds;
        DELETE FROM daily_activity_log;
        COMMIT;
      `);
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
        `INSERT OR REPLACE INTO group_conversations (id, user_id, name, topic, member_apostle_ids, last_message, last_message_sender_name, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [newThread.id, userId, newThread.name, newThread.topic, JSON.stringify(newThread.memberApostleIds), newThread.lastMessage, newThread.lastMessageSenderName, newThread.updatedAt]
      );
    } catch (e) {
      console.warn('createGroupThread SQLite error:', e);
    }
  }

  activeSyncListener?.onGroupThreadSaved?.(newThread);
  notifyDatabaseChanged();

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
        `INSERT OR REPLACE INTO group_messages (id, user_id, thread_id, sender_type, apostle_id, apostle_name, content, timestamp, reply_to, mentions, bookmarked, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
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
        `UPDATE group_conversations SET last_message = ?, last_message_sender_name = ?, updated_at = ?, synced = 0 WHERE id = ? AND user_id = ?`,
        [lastMsgSnippet, senderLabel, msg.timestamp, msg.threadId, userId]
      );
    } catch (e) {
      console.warn('saveGroupMessage SQLite error:', e);
    }
  }

  activeSyncListener?.onGroupMessageSaved?.(msg);
  notifyDatabaseChanged();
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
  const cleanBook = book.trim();
  const cleanChapter = Number(chapter);
  const cleanVerse = Number(verse);
  const id = `hl_${userId}_${cleanBook}_${cleanChapter}_${cleanVerse}`;
  const hl: VerseHighlight = { id, book: cleanBook, chapter: cleanChapter, verse: cleanVerse, color, verseText, timestamp: Date.now() };
  memoryHighlights[id] = hl;

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO verse_highlights (id, user_id, book, chapter, verse, color, verse_text, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [id, userId, cleanBook, cleanChapter, cleanVerse, color, verseText, hl.timestamp]
      );
    } catch (e) {
      console.warn('saveVerseHighlight error:', e);
    }
  }

  // Background Cloud Sync
  activeSyncListener?.onHighlightSaved?.(hl);
  notifyDatabaseChanged();
};


export const removeVerseHighlight = async (
  book: string,
  chapter: number,
  verse: number
): Promise<void> => {
  const userId = await getCurrentUserId();
  const cleanBook = book.trim();
  const cleanChapter = Number(chapter);
  const cleanVerse = Number(verse);
  const id = `hl_${userId}_${cleanBook}_${cleanChapter}_${cleanVerse}`;
  delete memoryHighlights[id];

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `DELETE FROM verse_highlights 
         WHERE (id = ? OR (LOWER(TRIM(book)) = LOWER(TRIM(?)) AND CAST(chapter AS INTEGER) = CAST(? AS INTEGER) AND CAST(verse AS INTEGER) = CAST(? AS INTEGER))) 
           AND user_id = ?`,
        [id, cleanBook, cleanChapter, cleanVerse, userId]
      );
    } catch (e) {
      console.warn('removeVerseHighlight error:', e);
    }
  }
  notifyDatabaseChanged();
};

export const fetchHighlightsForChapter = async (
  book: string,
  chapter: number
): Promise<Record<number, string>> => {
  const userId = await getCurrentUserId();
  const cleanBook = book.trim();
  const cleanChapter = Number(chapter);
  const result: Record<number, string> = {};

  // Check memory
  for (const key in memoryHighlights) {
    const hl = memoryHighlights[key];
    if (
      hl.book.trim().toLowerCase() === cleanBook.toLowerCase() &&
      Number(hl.chapter) === cleanChapter &&
      hl.id.startsWith(`hl_${userId}_`)
    ) {
      result[Number(hl.verse)] = hl.color;
    }
  }

  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<{ verse: number; color: string }>(
        `SELECT verse, color FROM verse_highlights 
         WHERE LOWER(TRIM(book)) = LOWER(TRIM(?)) 
           AND CAST(chapter AS INTEGER) = CAST(? AS INTEGER) 
           AND user_id = ?`,
        [cleanBook, cleanChapter, userId]
      );
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          result[Number(r.verse)] = r.color;
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
  const cleanBook = book.trim();
  const cleanChapter = Number(chapter);
  const cleanVerse = Number(verse);
  const id = `note_${userId}_${cleanBook}_${cleanChapter}_${cleanVerse}`;
  const noteItem: VerseNote = {
    id,
    book: cleanBook,
    chapter: cleanChapter,
    verse: cleanVerse,
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
        `INSERT OR REPLACE INTO verse_notes (id, user_id, book, chapter, verse, reference, verse_text, note_text, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [id, userId, cleanBook, cleanChapter, cleanVerse, reference, verseText, noteText, noteItem.timestamp]
      );
    } catch (e) {
      console.warn('saveVerseNote error:', e);
    }
  }

  // Background Cloud Sync
  activeSyncListener?.onNoteSaved?.(noteItem);
  notifyDatabaseChanged();
};


export const fetchNotesForChapter = async (
  book: string,
  chapter: number
): Promise<Record<number, string>> => {
  const userId = await getCurrentUserId();
  const cleanBook = book.trim();
  const cleanChapter = Number(chapter);
  const result: Record<number, string> = {};

  for (const key in memoryNotes) {
    const n = memoryNotes[key];
    if (
      n.book.trim().toLowerCase() === cleanBook.toLowerCase() &&
      Number(n.chapter) === cleanChapter &&
      n.id.startsWith(`note_${userId}_`)
    ) {
      result[Number(n.verse)] = n.noteText;
    }
  }

  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<{ verse: number; note_text: string }>(
        `SELECT verse, note_text FROM verse_notes 
         WHERE LOWER(TRIM(book)) = LOWER(TRIM(?)) 
           AND CAST(chapter AS INTEGER) = CAST(? AS INTEGER) 
           AND user_id = ?`,
        [cleanBook, cleanChapter, userId]
      );
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          result[Number(r.verse)] = r.note_text;
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

export const deleteVerseNote = async (
  idOrBook: string,
  chapter?: number,
  verse?: number
): Promise<void> => {
  const userId = await getCurrentUserId();
  if (chapter !== undefined && verse !== undefined) {
    const cleanBook = idOrBook.trim();
    const cleanChapter = Number(chapter);
    const cleanVerse = Number(verse);
    const id = `note_${userId}_${cleanBook}_${cleanChapter}_${cleanVerse}`;
    delete memoryNotes[id];
    delete memoryNotes[idOrBook];

    const db = await getDB();
    if (db) {
      try {
        await db.runAsync(
          `DELETE FROM verse_notes 
           WHERE (id = ? OR id = ? OR (LOWER(TRIM(book)) = LOWER(TRIM(?)) AND CAST(chapter AS INTEGER) = CAST(? AS INTEGER) AND CAST(verse AS INTEGER) = CAST(? AS INTEGER))) 
             AND user_id = ?`,
          [id, idOrBook, cleanBook, cleanChapter, cleanVerse, userId]
        );
      } catch (e) {
        console.warn('deleteVerseNote error:', e);
      }
    }
  } else {
    delete memoryNotes[idOrBook];
    const db = await getDB();
    if (db) {
      try {
        await db.runAsync('DELETE FROM verse_notes WHERE id = ? AND user_id = ?', [idOrBook, userId]);
      } catch (e) {
        console.warn('deleteVerseNote error:', e);
      }
    }
  }
  notifyDatabaseChanged();
};

export const saveMemorizedVerse = async (
  reference: string,
  verseText: string,
  version: string = 'NIV',
  status: 'practicing' | 'mastered' = 'practicing'
): Promise<void> => {
  const userId = await getCurrentUserId();
  const id = `mem_${userId}_${reference.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const now = Date.now();
  const existing = memoryMemorizedVerses[id];
  const count = existing ? existing.practiceCount + (status === 'mastered' ? 1 : 0) : 1;
  const resolvedStatus = (existing?.status === 'mastered' && status === 'practicing') ? 'mastered' : status;

  memoryMemorizedVerses[id] = {
    id,
    reference,
    verseText,
    version,
    masteredAt: now,
    practiceCount: count,
    status: resolvedStatus
  };

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO memorized_verses (id, user_id, reference, verse_text, version, mastered_at, practice_count, status, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON CONFLICT(user_id, reference) DO UPDATE SET
           practice_count = CASE WHEN excluded.status = 'mastered' THEN practice_count + 1 ELSE practice_count END,
           status = CASE WHEN memorized_verses.status = 'mastered' THEN 'mastered' ELSE excluded.status END,
           mastered_at = excluded.mastered_at,
           synced = 0;`,
        [id, userId, reference, verseText, version, now, count, resolvedStatus]
      );
    } catch (e) {
      console.warn('saveMemorizedVerse SQLite error:', e);
    }
  }

  // Background Cloud Sync
  activeSyncListener?.onMemorizedSaved?.(memoryMemorizedVerses[id]);
  notifyDatabaseChanged();
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
        status?: string;
      }>('SELECT * FROM memorized_verses WHERE user_id = ? ORDER BY mastered_at DESC', [userId]);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          reference: r.reference,
          verseText: r.verse_text,
          version: r.version,
          masteredAt: r.mastered_at,
          practiceCount: r.practice_count || 1,
          status: (r.status as 'practicing' | 'mastered') || 'mastered'
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
  const progressObj = {
    id,
    user_id: userId,
    book,
    chapter,
    verse: verse || 1,
    translation,
    snippet: snippet || '',
    estimated_minutes: estimatedMinutes || 3,
    updated_at: now
  };
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO user_reading_progress (id, user_id, book, chapter, verse, translation, snippet, estimated_minutes, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [id, userId, book, chapter, verse || 1, translation, snippet || '', estimatedMinutes || 3, now]
      );
    } catch (e) {
      console.warn('Error saving user_reading_progress to SQLite:', e);
    }
  }
  activeSyncListener?.onReadingProgressSaved?.(progressObj);
  notifyDatabaseChanged();
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

// =========================================================================
// REMOTE SYNC RECONCILIATION HELPERS (synced = 1, silent pull)
// =========================================================================

export const saveRemoteBookmark = async (b: SavedBookmark): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO bookmarks (id, user_id, type, title, content, reference, author, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(user_id, reference) DO UPDATE SET
           title = excluded.title,
           content = excluded.content,
           author = excluded.author,
           timestamp = excluded.timestamp,
           synced = 1;`,
        [b.id, userId, b.type, b.title, b.content, b.reference || '', b.author || '', b.timestamp]
      );
    } catch (e) {
      console.warn('saveRemoteBookmark error:', e);
    }
  }
};

export const saveRemoteMemorizedVerse = async (m: MemorizedVerse): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO memorized_verses (id, user_id, reference, verse_text, version, mastered_at, practice_count, status, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(user_id, reference) DO UPDATE SET
           verse_text = excluded.verse_text,
           version = excluded.version,
           mastered_at = excluded.mastered_at,
           practice_count = excluded.practice_count,
           status = excluded.status,
           synced = 1;`,
        [m.id, userId, m.reference, m.verseText, m.version, m.masteredAt, m.practiceCount, m.status || 'mastered']
      );
    } catch (e) {
      console.warn('saveRemoteMemorizedVerse error:', e);
    }
  }
};

export const saveRemoteVerseNote = async (n: VerseNote): Promise<void> => {
  const userId = await getCurrentUserId();
  const cleanBook = n.book.trim();
  const cleanChapter = Number(n.chapter);
  const cleanVerse = Number(n.verse);
  const noteItem: VerseNote = {
    id: n.id,
    book: cleanBook,
    chapter: cleanChapter,
    verse: cleanVerse,
    reference: n.reference,
    verseText: n.verseText,
    noteText: n.noteText,
    timestamp: n.timestamp
  };
  memoryNotes[n.id] = noteItem;
  memoryNotes[`note_${userId}_${cleanBook}_${cleanChapter}_${cleanVerse}`] = noteItem;

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO verse_notes (id, user_id, book, chapter, verse, reference, verse_text, note_text, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(user_id, book, chapter, verse) DO UPDATE SET
           verse_text = excluded.verse_text,
           note_text = excluded.note_text,
           timestamp = excluded.timestamp,
           synced = 1;`,
        [n.id, userId, cleanBook, cleanChapter, cleanVerse, n.reference, n.verseText, n.noteText, n.timestamp]
      );
    } catch (e) {
      console.warn('saveRemoteVerseNote error:', e);
    }
  }
};

export const saveRemoteVerseHighlight = async (h: VerseHighlight): Promise<void> => {
  const userId = await getCurrentUserId();
  const cleanBook = h.book.trim();
  const cleanChapter = Number(h.chapter);
  const cleanVerse = Number(h.verse);
  const hl: VerseHighlight = {
    id: h.id,
    book: cleanBook,
    chapter: cleanChapter,
    verse: cleanVerse,
    color: h.color,
    verseText: h.verseText,
    timestamp: h.timestamp
  };
  memoryHighlights[h.id] = hl;
  memoryHighlights[`hl_${userId}_${cleanBook}_${cleanChapter}_${cleanVerse}`] = hl;

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO verse_highlights (id, user_id, book, chapter, verse, color, verse_text, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(user_id, book, chapter, verse) DO UPDATE SET
           color = excluded.color,
           verse_text = excluded.verse_text,
           timestamp = excluded.timestamp,
           synced = 1;`,
        [h.id, userId, cleanBook, cleanChapter, cleanVerse, h.color, h.verseText, h.timestamp]
      );
    } catch (e) {
      console.warn('saveRemoteVerseHighlight error:', e);
    }
  }
};

export const saveRemoteConversation = async (c: ConversationThread): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO conversations (id, user_id, persona_id, persona_name, last_message, last_message_sender, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1);`,
        [c.id, userId, c.personaId, c.personaName, c.lastMessage, c.lastMessageSender, c.updatedAt]
      );
    } catch (e) {
      console.warn('saveRemoteConversation error:', e);
    }
  }
};

export const saveRemoteMessage = async (m: ChatMessage, conversationId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO messages (id, user_id, conversation_id, sender, content, timestamp, bookmarked, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1);`,
        [m.id, userId, conversationId, m.sender, m.content, m.timestamp, m.bookmarked ? 1 : 0]
      );
    } catch (e) {
      console.warn('saveRemoteMessage error:', e);
    }
  }
};

export const saveRemoteGroupThread = async (t: GroupCouncilThread): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO group_conversations (id, user_id, name, topic, member_apostle_ids, last_message, last_message_sender_name, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1);`,
        [t.id, userId, t.name, t.topic, JSON.stringify(t.memberApostleIds), t.lastMessage, t.lastMessageSenderName, t.updatedAt]
      );
    } catch (e) {
      console.warn('saveRemoteGroupThread error:', e);
    }
  }
};

export const saveRemoteGroupMessage = async (m: GroupCouncilMessage): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO group_messages (id, user_id, thread_id, sender_type, apostle_id, apostle_name, content, timestamp, reply_to, mentions, bookmarked, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
        [
          m.id,
          userId,
          m.threadId,
          m.senderType,
          m.apostleId || null,
          m.apostleName || null,
          m.content,
          m.timestamp,
          m.replyTo ? JSON.stringify(m.replyTo) : null,
          m.mentions ? JSON.stringify(m.mentions) : null,
          m.bookmarked ? 1 : 0
        ]
      );
    } catch (e) {
      console.warn('saveRemoteGroupMessage error:', e);
    }
  }
};

export const saveRemoteReadingProgress = async (p: any): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  const id = `current_${userId}`;
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO user_reading_progress (id, user_id, book, chapter, verse, translation, snippet, estimated_minutes, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
        [id, userId, p.book, p.chapter, p.verse || 1, p.translation || 'NIV', p.snippet || '', p.estimated_minutes || 3, p.updated_at || Date.now()]
      );
    } catch (e) {
      console.warn('saveRemoteReadingProgress error:', e);
    }
  }
};

export const saveRemoteCompletedDeed = async (d: any): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const completedAt = d.completed_date ? new Date(d.completed_date).getTime() : (d.completed_at || Date.now());
      await db.runAsync(
        `INSERT OR REPLACE INTO completed_deeds (id, user_id, deed_id, title, reflection, location_name, latitude, longitude, scripture_ref, xp_awarded, completed_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
        [
          d.id,
          userId,
          d.deed_id,
          d.title,
          d.reflection || '',
          d.location_name || '',
          d.latitude || null,
          d.longitude || null,
          d.scripture || d.scripture_ref || '',
          d.xp_awarded || 50,
          completedAt
        ]
      );
    } catch (e) {
      console.warn('saveRemoteCompletedDeed error:', e);
    }
  }
};

export const saveRemoteDailyActivity = async (a: any): Promise<void> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO daily_activity_log (id, user_id, date_str, activity_type, xp_earned, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, 1);`,
        [a.id, userId, a.activity_date, 'sync_restore', a.xp_earned || 0, Date.now()]
      );
    } catch (e) {
      console.warn('saveRemoteDailyActivity error:', e);
    }
  }
};

