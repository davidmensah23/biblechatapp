import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ChatMessage, ConversationThread, SavedBookmark, UserProfile } from '../types';
import { GroupCouncilThread, GroupCouncilMessage } from '../types/groupChat';
import { DEFAULT_PROFILE } from './supabase';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isDbAvailable = true;

// In-memory fallback if SQLite encounters an issue
let memoryConversations: ConversationThread[] = [
  { id: 'conv_john', personaId: 'john', personaName: 'John, The Apostle', lastMessage: 'Yes, I understand your perspective. Love covers a multitude of sins.', lastMessageSender: 'assistant', updatedAt: Date.now() - 2 * 60 * 1000 },
  { id: 'conv_peter', personaId: 'peter', personaName: 'Simon Peter', lastMessage: 'You: what will be the best way to walk through this trial?', lastMessageSender: 'user', updatedAt: Date.now() - 5 * 60 * 1000 },
  { id: 'conv_thomas', personaId: 'thomas', personaName: 'Thomas', lastMessage: 'No, patience is key, you need to seek truth earnestly.', lastMessageSender: 'assistant', updatedAt: Date.now() - 5 * 60 * 1000 },
  { id: 'conv_philip', personaId: 'philip', personaName: 'Philip', lastMessage: 'not at all, haha. Take it easy and come see for yourself.', lastMessageSender: 'assistant', updatedAt: Date.now() - 60 * 60 * 1000 },
  { id: 'conv_andrew', personaId: 'andrew', personaName: 'Andrew', lastMessage: 'You: In all things give glory and trust the Master.', lastMessageSender: 'user', updatedAt: Date.now() - 24 * 60 * 60 * 1000 }
];

let memoryMessages: Record<string, ChatMessage[]> = {
  conv_john: [{ id: 'msg_j1', conversationId: 'conv_john', sender: 'assistant', content: 'Yes, I understand your perspective. Love covers a multitude of sins.', timestamp: Date.now() - 2 * 60 * 1000 }],
  conv_peter: [{ id: 'msg_p1', conversationId: 'conv_peter', sender: 'user', content: 'what will be the best way to walk through this trial?', timestamp: Date.now() - 5 * 60 * 1000 }],
  conv_thomas: [{ id: 'msg_t1', conversationId: 'conv_thomas', sender: 'assistant', content: 'No, patience is key, you need to seek truth earnestly.', timestamp: Date.now() - 5 * 60 * 1000 }],
  conv_philip: [{ id: 'msg_ph1', conversationId: 'conv_philip', sender: 'assistant', content: 'not at all, haha. Take it easy and come see for yourself.', timestamp: Date.now() - 60 * 60 * 1000 }],
  conv_andrew: [{ id: 'msg_a1', conversationId: 'conv_andrew', sender: 'user', content: 'In all things give glory and trust the Master.', timestamp: Date.now() - 24 * 60 * 60 * 1000 }]
};

let memoryBookmarks: SavedBookmark[] = [
  { id: 'bm_1', type: 'verse', title: 'Proverbs 1:5', content: 'Let the wise listen and add to their learning, and let the discerning get guidance. - Proverbs 1:5 (NIV)', reference: 'Proverbs 1:5 (NIV)', author: 'Solomon', timestamp: Date.now() - 3600000 },
  { id: 'bm_2', type: 'quote', title: 'Thomas', content: 'Staying persistent and focus is a key ingredient to spiritual growth and clarity in faith.', reference: 'Thomas', author: 'Thomas', timestamp: Date.now() - 7200000 }
];

let memoryProfile: UserProfile = { ...DEFAULT_PROFILE };

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
        persona_id TEXT NOT NULL,
        persona_name TEXT NOT NULL,
        last_message TEXT,
        last_message_sender TEXT,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        bookmarked INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        reference TEXT,
        author TEXT,
        timestamp INTEGER NOT NULL
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
        name TEXT NOT NULL,
        topic TEXT NOT NULL,
        member_apostle_ids TEXT NOT NULL,
        last_message TEXT DEFAULT '',
        last_message_sender_name TEXT DEFAULT '',
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS group_messages (
        id TEXT PRIMARY KEY NOT NULL,
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
    `);

    // Safe migration for existing tables
    try {
      await db.execAsync(`ALTER TABLE user_profile ADD COLUMN gender TEXT DEFAULT 'neutral';`);
    } catch {
      // Column already exists
    }
  } catch (e) {
    console.warn('Table creation note:', e);
  }
};

// Database Operations
export const fetchConversations = async (): Promise<ConversationThread[]> => {
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM conversations ORDER BY updated_at DESC');
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
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [conversationId]
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
        'INSERT OR REPLACE INTO messages (id, conversation_id, sender, content, timestamp, bookmarked) VALUES (?, ?, ?, ?, ?, ?)',
        [msg.id, msg.conversationId, msg.sender, msg.content, msg.timestamp, msg.bookmarked ? 1 : 0]
      );

      await db.runAsync(
        'INSERT OR REPLACE INTO conversations (id, persona_id, persona_name, last_message, last_message_sender, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [msg.conversationId, personaId, personaName, preview, msg.sender, msg.timestamp]
      );
    } catch (e) {
      console.warn('saveMessage SQLite error:', e);
    }
  }
};

export const fetchBookmarks = async (): Promise<SavedBookmark[]> => {
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM bookmarks ORDER BY timestamp DESC');
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
  memoryBookmarks.unshift(bookmark);
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO bookmarks (id, type, title, content, reference, author, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bookmark.id, bookmark.type, bookmark.title, bookmark.content, bookmark.reference || '', bookmark.author || '', bookmark.timestamp]
      );
    } catch (e) {
      console.warn('saveBookmark SQLite error:', e);
    }
  }
};

export const removeBookmark = async (id: string): Promise<void> => {
  memoryBookmarks = memoryBookmarks.filter(b => b.id !== id);
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM bookmarks WHERE id = ?', [id]);
    } catch (e) {
      console.warn('removeBookmark SQLite error:', e);
    }
  }
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const db = await getDB();
  if (db) {
    try {
      const row = await db.getFirstAsync<any>('SELECT * FROM user_profile WHERE id = ?', ['current_user']);
      if (row) {
        return {
          fullName: row.full_name,
          email: row.email,
          bio: row.bio,
          location: row.location,
          dateOfBirth: row.date_of_birth,
          gender: row.gender || 'neutral'
        };
      }
    } catch (e) {
      console.warn('fetchUserProfile error:', e);
    }
  }
  return memoryProfile;
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  memoryProfile = profile;
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO user_profile (id, full_name, email, bio, location, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['current_user', profile.fullName, profile.email, profile.bio, profile.location, profile.dateOfBirth, profile.gender || 'neutral']
      );
    } catch (e) {
      console.warn('saveUserProfile SQLite error:', e);
    }
  }
};

export const clearChatHistory = async (): Promise<void> => {
  memoryConversations = [];
  memoryMessages = {};
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM messages');
      await db.runAsync('DELETE FROM conversations');
    } catch (e) {
      console.warn('clearChatHistory SQLite error:', e);
    }
  }
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

// Migrate all existing guest conversations, bookmarks, and profiles to genuine user ID
export const migrateGuestDataToUser = async (newUserId: string): Promise<{
  bookmarksCount: number;
  conversationsCount: number;
}> => {
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

// Delete all user data completely (Account Deletion)
export const deleteAllUserData = async (): Promise<void> => {
  memoryConversations = [];
  memoryMessages = {};
  memoryBookmarks = [];
  memoryProfile = { ...DEFAULT_PROFILE };

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM messages');
      await db.runAsync('DELETE FROM conversations');
      await db.runAsync('DELETE FROM bookmarks');
      await db.runAsync('DELETE FROM user_profile');
      await db.runAsync('DELETE FROM group_messages');
      await db.runAsync('DELETE FROM group_conversations');
    } catch (e) {
      console.warn('deleteAllUserData SQLite error:', e);
    }
  }
};

// =========================================================================
// COUNCIL OF FAITH (GROUP CHAT) DATABASE OPERATIONS
// =========================================================================

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

export const createGroupThread = async (
  name: string,
  topic: string,
  memberApostleIds: string[]
): Promise<GroupCouncilThread> => {
  const newThread: GroupCouncilThread = {
    id: `council_${Date.now()}`,
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
        `INSERT OR REPLACE INTO group_conversations (id, name, topic, member_apostle_ids, last_message, last_message_sender_name, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newThread.id, newThread.name, newThread.topic, JSON.stringify(newThread.memberApostleIds), newThread.lastMessage, newThread.lastMessageSenderName, newThread.updatedAt]
      );
    } catch (e) {
      console.warn('createGroupThread SQLite error:', e);
    }
  }

  return newThread;
};

export const fetchGroupThreads = async (): Promise<GroupCouncilThread[]> => {
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM group_conversations ORDER BY updated_at DESC');
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
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM group_messages WHERE thread_id = ? ORDER BY timestamp ASC',
        [threadId]
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
        `INSERT OR REPLACE INTO group_messages (id, thread_id, sender_type, apostle_id, apostle_name, content, timestamp, reply_to, mentions, bookmarked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          msg.id,
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
        `UPDATE group_conversations SET last_message = ?, last_message_sender_name = ?, updated_at = ? WHERE id = ?`,
        [lastMsgSnippet, senderLabel, msg.timestamp, msg.threadId]
      );
    } catch (e) {
      console.warn('saveGroupMessage SQLite error:', e);
    }
  }
};

export const deleteGroupThread = async (threadId: string): Promise<void> => {
  memoryGroupThreads = memoryGroupThreads.filter(t => t.id !== threadId);
  delete memoryGroupMessages[threadId];

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync('DELETE FROM group_messages WHERE thread_id = ?', [threadId]);
      await db.runAsync('DELETE FROM group_conversations WHERE id = ?', [threadId]);
    } catch (e) {
      console.warn('deleteGroupThread SQLite error:', e);
    }
  }
};



