import { supabase } from './supabase';
import { SavedBookmark, ConversationThread, ChatMessage } from '../types';
import { GroupCouncilThread, GroupCouncilMessage } from '../types/groupChat';
import {
  fetchAllHighlights,
  fetchAllVerseNotes,
  fetchBookmarks,
  fetchMemorizedVerses,
  fetchConversations,
  fetchMessages,
  fetchGroupThreads,
  fetchGroupMessages,
  saveRemoteBookmark,
  saveRemoteMemorizedVerse,
  saveRemoteVerseNote,
  saveRemoteVerseHighlight,
  saveRemoteConversation,
  saveRemoteMessage,
  saveRemoteGroupThread,
  saveRemoteGroupMessage,
  saveRemoteReadingProgress,
  saveRemoteCompletedDeed,
  saveRemoteDailyActivity,
  markRecordSynced,
  fetchPendingSyncRecords,
  VerseNote,
  VerseHighlight,
  MemorizedVerse,
  registerSyncListener
} from './database';

// =========================================================================
// GRANULAR CLOUD SYNC FUNCTIONS (Single-item upserts with synced = 1 flag)
// =========================================================================

/**
 * Saves a single bookmark to Supabase
 */
export const syncBookmarkToCloud = async (bookmark: SavedBookmark): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('bookmarks').upsert({
      id: bookmark.id,
      user_id: user.id,
      type: bookmark.type || 'verse',
      title: bookmark.title,
      content: bookmark.content,
      reference: bookmark.reference || bookmark.title,
      author: bookmark.author || '',
      timestamp: bookmark.timestamp,
      app_id: 'akorno'
    }, {
      onConflict: 'user_id,reference'
    });

    if (!error) {
      await markRecordSynced('bookmarks', bookmark.id);
    } else {
      console.warn('syncBookmarkToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncBookmarkToCloud error:', e);
  }
};

/**
 * Removes a single bookmark from Supabase
 */
export const removeBookmarkFromCloud = async (reference: string): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('reference', reference);
  } catch (e) {
    console.warn('removeBookmarkFromCloud error:', e);
  }
};

/**
 * Saves a single verse note to Supabase
 */
export const syncVerseNoteToCloud = async (note: VerseNote): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('user_verse_notes').upsert({
      id: note.id,
      user_id: user.id,
      book: note.book,
      chapter: note.chapter,
      verse: note.verse,
      reference: note.reference,
      verse_text: note.verseText,
      note_text: note.noteText,
      timestamp: note.timestamp,
      app_id: 'akorno'
    }, {
      onConflict: 'user_id,book,chapter,verse'
    });

    if (!error) {
      await markRecordSynced('verse_notes', note.id);
    } else {
      console.warn('syncVerseNoteToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncVerseNoteToCloud error:', e);
  }
};

/**
 * Saves a single highlight to Supabase
 */
export const syncVerseHighlightToCloud = async (hl: VerseHighlight): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('user_verse_highlights').upsert({
      id: hl.id,
      user_id: user.id,
      book: hl.book,
      chapter: hl.chapter,
      verse: hl.verse,
      color: hl.color,
      verse_text: hl.verseText,
      timestamp: hl.timestamp,
      app_id: 'akorno'
    }, {
      onConflict: 'user_id,book,chapter,verse'
    });

    if (!error) {
      await markRecordSynced('verse_highlights', hl.id);
    } else {
      console.warn('syncVerseHighlightToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncVerseHighlightToCloud error:', e);
  }
};

/**
 * Saves a single memorized verse to Supabase
 */
export const syncMemorizedVerseToCloud = async (mem: MemorizedVerse): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('user_memorized_verses').upsert({
      user_id: user.id,
      reference: mem.reference,
      verse_text: mem.verseText,
      version: mem.version,
      practice_count: mem.practiceCount,
      status: mem.status || 'mastered',
      mastered_at: new Date(mem.masteredAt).toISOString()
    }, {
      onConflict: 'user_id,reference'
    });

    if (!error) {
      await markRecordSynced('memorized_verses', mem.id);
    } else {
      console.warn('syncMemorizedVerseToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncMemorizedVerseToCloud error:', e);
  }
};

/**
 * Saves a conversation thread header to Supabase
 */
export const syncConversationToCloud = async (conv: ConversationThread): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('conversations').upsert({
      id: conv.id,
      user_id: user.id,
      persona_id: conv.personaId,
      persona_name: conv.personaName,
      last_message: conv.lastMessage || '',
      last_message_sender: conv.lastMessageSender || 'user',
      updated_at: conv.updatedAt,
      app_id: 'akorno'
    }, {
      onConflict: 'id'
    });

    if (!error) {
      await markRecordSynced('conversations', conv.id);
    } else {
      console.warn('syncConversationToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncConversationToCloud error:', e);
  }
};

/**
 * Saves a direct chat message to Supabase
 */
export const syncMessageToCloud = async (msg: ChatMessage, conversationId: string): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('messages').upsert({
      id: msg.id,
      conversation_id: conversationId || msg.conversationId,
      user_id: user.id,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp,
      bookmarked: Boolean(msg.bookmarked),
      app_id: 'akorno'
    }, {
      onConflict: 'id'
    });

    if (!error) {
      await markRecordSynced('messages', msg.id);
    } else {
      console.warn('syncMessageToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncMessageToCloud error:', e);
  }
};

/**
 * Saves a group council thread to Supabase
 */
export const syncGroupThreadToCloud = async (thread: GroupCouncilThread): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('group_conversations').upsert({
      id: thread.id,
      user_id: user.id,
      name: thread.name,
      topic: thread.topic,
      member_apostle_ids: thread.memberApostleIds,
      last_message: thread.lastMessage || '',
      last_message_sender_name: thread.lastMessageSenderName || '',
      updated_at: thread.updatedAt,
      app_id: 'akorno'
    }, {
      onConflict: 'id'
    });

    if (!error) {
      await markRecordSynced('group_conversations', thread.id);
    } else {
      console.warn('syncGroupThreadToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncGroupThreadToCloud error:', e);
  }
};

/**
 * Saves a group council message to Supabase
 */
export const syncGroupMessageToCloud = async (msg: GroupCouncilMessage): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('group_messages').upsert({
      id: msg.id,
      thread_id: msg.threadId,
      user_id: user.id,
      sender_type: msg.senderType,
      apostle_id: msg.apostleId || null,
      apostle_name: msg.apostleName || null,
      content: msg.content,
      timestamp: msg.timestamp,
      reply_to: msg.replyTo || null,
      mentions: msg.mentions || null,
      bookmarked: Boolean(msg.bookmarked),
      app_id: 'akorno'
    }, {
      onConflict: 'id'
    });

    if (!error) {
      await markRecordSynced('group_messages', msg.id);
    } else {
      console.warn('syncGroupMessageToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncGroupMessageToCloud error:', e);
  }
};

/**
 * Saves reading progress to Supabase
 */
export const syncReadingProgressToCloud = async (p: any): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('user_reading_progress').upsert({
      id: p.id,
      user_id: user.id,
      book: p.book,
      chapter: p.chapter,
      verse: p.verse || 1,
      translation: p.translation || 'NIV',
      snippet: p.snippet || '',
      estimated_minutes: p.estimated_minutes || 3,
      updated_at: p.updated_at || Date.now(),
      app_id: 'akorno'
    }, {
      onConflict: 'user_id'
    });

    if (!error) {
      await markRecordSynced('user_reading_progress', p.id);
    } else {
      console.warn('syncReadingProgressToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncReadingProgressToCloud error:', e);
  }
};

/**
 * Saves a completed kingdom deed to Supabase
 */
export const syncCompletedDeedToCloud = async (d: any): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('completed_deeds').upsert({
      id: d.id,
      user_id: user.id,
      deed_id: d.deed_id,
      title: d.title,
      category: d.category || '',
      scripture: d.scripture || '',
      completed_date: d.completed_date,
      xp_awarded: d.xp_awarded || 50,
      app_id: 'akorno'
    }, {
      onConflict: 'user_id,deed_id,completed_date'
    });

    if (!error) {
      await markRecordSynced('completed_deeds', d.id);
    } else {
      console.warn('syncCompletedDeedToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncCompletedDeedToCloud error:', e);
  }
};

/**
 * Saves daily streak activity to Supabase
 */
export const syncDailyActivityToCloud = async (a: any): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from('daily_activity_log').upsert({
      id: a.id,
      user_id: user.id,
      activity_date: a.activity_date,
      xp_earned: a.xp_earned || 0,
      actions_count: a.actions_count || 1,
      app_id: 'akorno'
    }, {
      onConflict: 'user_id,activity_date'
    });

    if (!error) {
      await markRecordSynced('daily_activity_log', a.id);
    } else {
      console.warn('syncDailyActivityToCloud Supabase error:', error.message);
    }
  } catch (e) {
    console.warn('syncDailyActivityToCloud error:', e);
  }
};

// =========================================================================
// OFFLINE QUEUE FLUSH (Pushes pending synced=0 records on reconnect / login)
// =========================================================================

let isFlushing = false;

export const flushPendingSyncQueue = async (): Promise<void> => {
  if (isFlushing) return;
  isFlushing = true;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    // 1. Bookmarks
    const pendingBms = await fetchPendingSyncRecords('bookmarks');
    for (const b of pendingBms) {
      await syncBookmarkToCloud({
        id: b.id,
        type: b.type,
        title: b.title,
        content: b.content,
        reference: b.reference,
        author: b.author,
        timestamp: b.timestamp
      });
    }

    // 2. Memorized Verses
    const pendingMems = await fetchPendingSyncRecords('memorized_verses');
    for (const m of pendingMems) {
      await syncMemorizedVerseToCloud({
        id: m.id,
        reference: m.reference,
        verseText: m.verse_text,
        version: m.version,
        practiceCount: m.practice_count,
        status: m.status,
        masteredAt: m.mastered_at
      });
    }

    // 3. Verse Notes
    const pendingNotes = await fetchPendingSyncRecords('verse_notes');
    for (const n of pendingNotes) {
      await syncVerseNoteToCloud({
        id: n.id,
        book: n.book,
        chapter: n.chapter,
        verse: n.verse,
        reference: n.reference,
        verseText: n.verse_text,
        noteText: n.note_text,
        timestamp: n.timestamp
      });
    }

    // 4. Verse Highlights
    const pendingHls = await fetchPendingSyncRecords('verse_highlights');
    for (const h of pendingHls) {
      await syncVerseHighlightToCloud({
        id: h.id,
        book: h.book,
        chapter: h.chapter,
        verse: h.verse,
        color: h.color,
        verseText: h.verse_text,
        timestamp: h.timestamp
      });
    }

    // 5. Conversations
    const pendingConvs = await fetchPendingSyncRecords('conversations');
    for (const c of pendingConvs) {
      await syncConversationToCloud({
        id: c.id,
        personaId: c.persona_id,
        personaName: c.persona_name,
        lastMessage: c.last_message,
        lastMessageSender: c.last_message_sender,
        updatedAt: c.updated_at
      });
    }

    // 6. Messages
    const pendingMsgs = await fetchPendingSyncRecords('messages');
    for (const m of pendingMsgs) {
      await syncMessageToCloud(
        {
          id: m.id,
          conversationId: m.conversation_id,
          sender: m.sender,
          content: m.content,
          timestamp: m.timestamp,
          bookmarked: Boolean(m.bookmarked)
        },
        m.conversation_id
      );
    }

    // 7. Group Conversations
    const pendingGroupConvs = await fetchPendingSyncRecords('group_conversations');
    for (const gt of pendingGroupConvs) {
      let apostleIds = [];
      try {
        apostleIds = typeof gt.member_apostle_ids === 'string' ? JSON.parse(gt.member_apostle_ids) : gt.member_apostle_ids;
      } catch {}
      await syncGroupThreadToCloud({
        id: gt.id,
        name: gt.name,
        topic: gt.topic,
        memberApostleIds: apostleIds,
        lastMessage: gt.last_message,
        lastMessageSenderName: gt.last_message_sender_name,
        updatedAt: gt.updated_at
      });
    }

    // 8. Group Messages
    const pendingGroupMsgs = await fetchPendingSyncRecords('group_messages');
    for (const gm of pendingGroupMsgs) {
      let replyTo = null;
      let mentions = null;
      try {
        replyTo = typeof gm.reply_to === 'string' ? JSON.parse(gm.reply_to) : gm.reply_to;
      } catch {}
      try {
        mentions = typeof gm.mentions === 'string' ? JSON.parse(gm.mentions) : gm.mentions;
      } catch {}

      await syncGroupMessageToCloud({
        id: gm.id,
        threadId: gm.thread_id,
        senderType: gm.sender_type,
        apostleId: gm.apostle_id,
        apostleName: gm.apostle_name,
        content: gm.content,
        timestamp: gm.timestamp,
        replyTo,
        mentions,
        bookmarked: Boolean(gm.bookmarked)
      });
    }

    // 9. Reading Progress
    const pendingReading = await fetchPendingSyncRecords('user_reading_progress');
    for (const rp of pendingReading) {
      await syncReadingProgressToCloud(rp);
    }

    // 10. Completed Deeds
    const pendingDeeds = await fetchPendingSyncRecords('completed_deeds');
    for (const cd of pendingDeeds) {
      await syncCompletedDeedToCloud(cd);
    }

    // 11. Daily Activity Log
    const pendingActivity = await fetchPendingSyncRecords('daily_activity_log');
    for (const da of pendingActivity) {
      await syncDailyActivityToCloud(da);
    }
  } catch (e) {
    console.warn('flushPendingSyncQueue error:', e);
  } finally {
    isFlushing = false;
  }
};

// =========================================================================
// FULL CLOUD SYNC & PULL
// =========================================================================

/**
 * Pushes all pending and local records across all domains to Supabase
 */
export const syncAllToCloud = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return false;

    // First flush any pending offline rows
    await flushPendingSyncQueue();

    // 1. Sync Highlights
    const localHighlights = await fetchAllHighlights();
    if (localHighlights.length > 0) {
      const rows = localHighlights.map(h => ({
        id: h.id,
        user_id: user.id,
        book: h.book,
        chapter: h.chapter,
        verse: h.verse,
        color: h.color,
        verse_text: h.verseText,
        timestamp: h.timestamp,
        app_id: 'akorno'
      }));
      await supabase.from('user_verse_highlights').upsert(rows, {
        onConflict: 'user_id,book,chapter,verse'
      });
    }

    // 2. Sync Notes
    const localNotes = await fetchAllVerseNotes();
    if (localNotes.length > 0) {
      const rows = localNotes.map(n => ({
        id: n.id,
        user_id: user.id,
        book: n.book,
        chapter: n.chapter,
        verse: n.verse,
        reference: n.reference,
        verse_text: n.verseText,
        note_text: n.noteText,
        timestamp: n.timestamp,
        app_id: 'akorno'
      }));
      await supabase.from('user_verse_notes').upsert(rows, {
        onConflict: 'user_id,book,chapter,verse'
      });
    }

    // 3. Sync Bookmarks
    const localBookmarks = await fetchBookmarks();
    if (localBookmarks.length > 0) {
      const rows = localBookmarks.map(b => ({
        id: b.id,
        user_id: user.id,
        type: b.type || 'verse',
        title: b.title,
        content: b.content,
        reference: b.reference || b.title,
        author: b.author || '',
        timestamp: b.timestamp,
        app_id: 'akorno'
      }));
      await supabase.from('bookmarks').upsert(rows, {
        onConflict: 'user_id,reference'
      });
    }

    // 4. Sync Memorized Verses
    const localMemorized = await fetchMemorizedVerses();
    if (localMemorized.length > 0) {
      const rows = localMemorized.map(m => ({
        user_id: user.id,
        reference: m.reference,
        verse_text: m.verseText,
        version: m.version,
        practice_count: m.practiceCount,
        status: m.status || 'mastered',
        mastered_at: new Date(m.masteredAt).toISOString()
      }));
      await supabase.from('user_memorized_verses').upsert(rows, {
        onConflict: 'user_id,reference'
      });
    }

    // 5. Sync Conversations
    const localConversations = await fetchConversations();
    if (localConversations.length > 0) {
      const rows = localConversations.map(c => ({
        id: c.id,
        user_id: user.id,
        persona_id: c.personaId,
        persona_name: c.personaName,
        last_message: c.lastMessage || '',
        last_message_sender: c.lastMessageSender || 'user',
        updated_at: c.updatedAt,
        app_id: 'akorno'
      }));
      await supabase.from('conversations').upsert(rows, {
        onConflict: 'id'
      });
    }

    // 6. Sync Group Threads
    const localGroupThreads = await fetchGroupThreads();
    if (localGroupThreads.length > 0) {
      const rows = localGroupThreads.map(t => ({
        id: t.id,
        user_id: user.id,
        name: t.name,
        topic: t.topic,
        member_apostle_ids: t.memberApostleIds,
        last_message: t.lastMessage || '',
        last_message_sender_name: t.lastMessageSenderName || '',
        updated_at: t.updatedAt,
        app_id: 'akorno'
      }));
      await supabase.from('group_conversations').upsert(rows, {
        onConflict: 'id'
      });
    }

    return true;
  } catch (e) {
    console.warn('syncAllToCloud error:', e);
    return false;
  }
};

/**
 * Pull remote data from Supabase down into local SQLite (merges non-destructively, sets synced = 1)
 */
export const pullCloudToLocal = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return false;

    // 1. Pull Bookmarks
    const { data: remoteBms } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id);

    if (remoteBms && remoteBms.length > 0) {
      for (const b of remoteBms) {
        await saveRemoteBookmark({
          id: b.id || `bm_${b.reference?.replace(/[^a-zA-Z0-9]/g, '_')}`,
          type: b.type || 'verse',
          title: b.title || b.reference,
          content: b.content || '',
          reference: b.reference,
          author: b.author || '',
          timestamp: b.timestamp || (b.created_at ? new Date(b.created_at).getTime() : Date.now())
        });
      }
    }

    // 2. Pull Highlights
    const { data: remoteHls } = await supabase
      .from('user_verse_highlights')
      .select('*')
      .eq('user_id', user.id);

    if (remoteHls && remoteHls.length > 0) {
      for (const h of remoteHls) {
        await saveRemoteVerseHighlight({
          id: h.id,
          book: h.book,
          chapter: h.chapter,
          verse: h.verse,
          color: h.color,
          verseText: h.verse_text,
          timestamp: h.timestamp || (h.created_at ? new Date(h.created_at).getTime() : Date.now())
        });
      }
    }

    // 3. Pull Notes
    const { data: remoteNotes } = await supabase
      .from('user_verse_notes')
      .select('*')
      .eq('user_id', user.id);

    if (remoteNotes && remoteNotes.length > 0) {
      for (const n of remoteNotes) {
        await saveRemoteVerseNote({
          id: n.id,
          book: n.book,
          chapter: n.chapter,
          verse: n.verse,
          reference: n.reference,
          verseText: n.verse_text,
          noteText: n.note_text,
          timestamp: n.timestamp || (n.created_at ? new Date(n.created_at).getTime() : Date.now())
        });
      }
    }

    // 4. Pull Memorized Verses
    const { data: remoteMems } = await supabase
      .from('user_memorized_verses')
      .select('*')
      .eq('user_id', user.id);

    if (remoteMems && remoteMems.length > 0) {
      for (const m of remoteMems) {
        await saveRemoteMemorizedVerse({
          id: m.id || `mem_${user.id}_${m.reference?.replace(/[^a-zA-Z0-9]/g, '_')}`,
          reference: m.reference,
          verseText: m.verse_text,
          version: m.version || 'NIV',
          masteredAt: m.mastered_at ? new Date(m.mastered_at).getTime() : Date.now(),
          practiceCount: m.practice_count || 1,
          status: (m.status as 'practicing' | 'mastered') || 'mastered'
        });
      }
    }

    // 5. Pull Conversations
    const { data: remoteConvs } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id);

    if (remoteConvs && remoteConvs.length > 0) {
      for (const c of remoteConvs) {
        await saveRemoteConversation({
          id: c.id,
          personaId: c.persona_id,
          personaName: c.persona_name,
          lastMessage: c.last_message || '',
          lastMessageSender: c.last_message_sender || 'user',
          updatedAt: c.updated_at || Date.now()
        });
      }
    }

    // 6. Pull Messages
    const { data: remoteMsgs } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id);

    if (remoteMsgs && remoteMsgs.length > 0) {
      for (const m of remoteMsgs) {
        await saveRemoteMessage(
          {
            id: m.id,
            conversationId: m.conversation_id,
            sender: m.sender || 'user',
            content: m.content || '',
            timestamp: m.timestamp || Date.now(),
            bookmarked: Boolean(m.bookmarked)
          },
          m.conversation_id
        );
      }
    }

    // 7. Pull Group Conversations
    const { data: remoteGroupThreads } = await supabase
      .from('group_conversations')
      .select('*')
      .eq('user_id', user.id);

    if (remoteGroupThreads && remoteGroupThreads.length > 0) {
      for (const gt of remoteGroupThreads) {
        let memberIds = [];
        try {
          memberIds = typeof gt.member_apostle_ids === 'string' ? JSON.parse(gt.member_apostle_ids) : gt.member_apostle_ids;
        } catch {}
        await saveRemoteGroupThread({
          id: gt.id,
          name: gt.name,
          topic: gt.topic,
          memberApostleIds: memberIds || [],
          lastMessage: gt.last_message || '',
          lastMessageSenderName: gt.last_message_sender_name || '',
          updatedAt: gt.updated_at || Date.now()
        });
      }
    }

    // 8. Pull Group Messages
    const { data: remoteGroupMsgs } = await supabase
      .from('group_messages')
      .select('*')
      .eq('user_id', user.id);

    if (remoteGroupMsgs && remoteGroupMsgs.length > 0) {
      for (const gm of remoteGroupMsgs) {
        let replyTo = null;
        let mentions = null;
        try {
          replyTo = typeof gm.reply_to === 'string' ? JSON.parse(gm.reply_to) : gm.reply_to;
        } catch {}
        try {
          mentions = typeof gm.mentions === 'string' ? JSON.parse(gm.mentions) : gm.mentions;
        } catch {}

        await saveRemoteGroupMessage({
          id: gm.id,
          threadId: gm.thread_id,
          senderType: gm.sender_type || 'user',
          apostleId: gm.apostle_id || undefined,
          apostleName: gm.apostle_name || undefined,
          content: gm.content || '',
          timestamp: gm.timestamp || Date.now(),
          replyTo,
          mentions,
          bookmarked: Boolean(gm.bookmarked)
        });
      }
    }

    // 9. Pull Reading Progress
    const { data: remoteProgress } = await supabase
      .from('user_reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (remoteProgress && remoteProgress.length > 0) {
      await saveRemoteReadingProgress(remoteProgress[0]);
    }

    // 10. Pull Completed Deeds
    const { data: remoteDeeds } = await supabase
      .from('completed_deeds')
      .select('*')
      .eq('user_id', user.id);

    if (remoteDeeds && remoteDeeds.length > 0) {
      for (const cd of remoteDeeds) {
        await saveRemoteCompletedDeed(cd);
      }
    }

    // 11. Pull Daily Activity Log
    const { data: remoteActivity } = await supabase
      .from('daily_activity_log')
      .select('*')
      .eq('user_id', user.id);

    if (remoteActivity && remoteActivity.length > 0) {
      for (const da of remoteActivity) {
        await saveRemoteDailyActivity(da);
      }
    }

    return true;
  } catch (e) {
    console.warn('pullCloudToLocal error:', e);
    return false;
  }
};

// =========================================================================
// REGISTER AUTOMATIC SYNC LISTENERS
// =========================================================================

registerSyncListener({
  onBookmarkSaved: (b) => { syncBookmarkToCloud(b); },
  onBookmarkRemoved: (ref) => { removeBookmarkFromCloud(ref); },
  onNoteSaved: (n) => { syncVerseNoteToCloud(n); },
  onHighlightSaved: (h) => { syncVerseHighlightToCloud(h); },
  onMemorizedSaved: (m) => { syncMemorizedVerseToCloud(m); },
  onConversationSaved: (c) => { syncConversationToCloud(c); },
  onMessageSaved: (m, convId) => { syncMessageToCloud(m, convId); },
  onGroupThreadSaved: (t) => { syncGroupThreadToCloud(t); },
  onGroupMessageSaved: (m) => { syncGroupMessageToCloud(m); },
  onReadingProgressSaved: (p) => { syncReadingProgressToCloud(p); },
  onDeedCompleted: (d) => { syncCompletedDeedToCloud(d); },
  onActivityLogged: (a) => { syncDailyActivityToCloud(a); }
});



