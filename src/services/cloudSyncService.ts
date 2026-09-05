import { supabase } from './supabase';
import { SavedBookmark } from '../types';
import {
  fetchAllHighlights,
  fetchAllVerseNotes,
  fetchBookmarks,
  fetchMemorizedVerses,
  saveVerseHighlight,
  saveVerseNote,
  saveBookmark,
  saveMemorizedVerse,
  VerseNote,
  VerseHighlight,
  MemorizedVerse,
  registerSyncListener
} from './database';


/**
 * Granular background sync: saves a single bookmark to Supabase
 */
export const syncBookmarkToCloud = async (bookmark: SavedBookmark): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    await supabase.from('user_bookmarks').upsert({
      user_id: user.id,
      reference: bookmark.reference || bookmark.title,
      verse_text: bookmark.content,
      version: 'NIV',
      created_at: new Date(bookmark.timestamp).toISOString()
    }, {
      onConflict: 'user_id,reference'
    });
  } catch (e) {
    console.warn('syncBookmarkToCloud note:', e);
  }
};

/**
 * Granular background sync: removes a single bookmark from Supabase
 */
export const removeBookmarkFromCloud = async (reference: string): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('reference', reference);
  } catch (e) {
    console.warn('removeBookmarkFromCloud note:', e);
  }
};

/**
 * Granular background sync: saves a single note to Supabase
 */
export const syncVerseNoteToCloud = async (note: VerseNote): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    await supabase.from('user_verse_notes').upsert({
      user_id: user.id,
      book: note.book,
      chapter: note.chapter,
      verse: note.verse,
      reference: note.reference,
      verse_text: note.verseText,
      note_text: note.noteText,
      created_at: new Date(note.timestamp).toISOString()
    });
  } catch (e) {
    console.warn('syncVerseNoteToCloud note:', e);
  }
};

/**
 * Granular background sync: saves a single highlight to Supabase
 */
export const syncVerseHighlightToCloud = async (hl: VerseHighlight): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    await supabase.from('user_verse_highlights').upsert({
      user_id: user.id,
      book: hl.book,
      chapter: hl.chapter,
      verse: hl.verse,
      color: hl.color,
      verse_text: hl.verseText,
      created_at: new Date(hl.timestamp).toISOString()
    }, {
      onConflict: 'user_id,book,chapter,verse'
    });
  } catch (e) {
    console.warn('syncVerseHighlightToCloud note:', e);
  }
};

/**
 * Granular background sync: saves a memorized verse to Supabase
 */
export const syncMemorizedVerseToCloud = async (mem: MemorizedVerse): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    await supabase.from('user_memorized_verses').upsert({
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
  } catch (e) {
    console.warn('syncMemorizedVerseToCloud note:', e);
  }
};

/**
 * Full cloud sync: pushes all local highlights, notes, bookmarks, and memorized verses to Supabase
 */
export const syncAllToCloud = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return false;

    // 1. Sync Highlights
    const localHighlights = await fetchAllHighlights();
    if (localHighlights.length > 0) {
      const rows = localHighlights.map(h => ({
        user_id: user.id,
        book: h.book,
        chapter: h.chapter,
        verse: h.verse,
        color: h.color,
        verse_text: h.verseText
      }));
      await supabase.from('user_verse_highlights').upsert(rows, {
        onConflict: 'user_id,book,chapter,verse'
      });
    }

    // 2. Sync Notes
    const localNotes = await fetchAllVerseNotes();
    if (localNotes.length > 0) {
      const rows = localNotes.map(n => ({
        user_id: user.id,
        book: n.book,
        chapter: n.chapter,
        verse: n.verse,
        reference: n.reference,
        verse_text: n.verseText,
        note_text: n.noteText
      }));
      await supabase.from('user_verse_notes').upsert(rows);
    }

    // 3. Sync Bookmarks
    const localBookmarks = await fetchBookmarks();
    if (localBookmarks.length > 0) {
      const rows = localBookmarks.map(b => ({
        user_id: user.id,
        reference: b.reference || b.title,
        verse_text: b.content,
        version: 'NIV',
        created_at: new Date(b.timestamp).toISOString()
      }));
      await supabase.from('user_bookmarks').upsert(rows, {
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

    return true;
  } catch (e) {
    console.warn('syncAllToCloud error:', e);
    return false;
  }
};

/**
 * Pull remote data from Supabase down into local SQLite (merges non-destructively)
 */
export const pullCloudToLocal = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return false;

    // 1. Pull Highlights
    const { data: remoteHls } = await supabase
      .from('user_verse_highlights')
      .select('*')
      .eq('user_id', user.id);

    if (remoteHls && remoteHls.length > 0) {
      for (const h of remoteHls) {
        await saveVerseHighlight(h.book, h.chapter, h.verse, h.color, h.verse_text);
      }
    }

    // 2. Pull Notes
    const { data: remoteNotes } = await supabase
      .from('user_verse_notes')
      .select('*')
      .eq('user_id', user.id);

    if (remoteNotes && remoteNotes.length > 0) {
      for (const n of remoteNotes) {
        await saveVerseNote(n.book, n.chapter, n.verse, n.reference, n.verse_text, n.note_text);
      }
    }

    // 3. Pull Bookmarks
    const { data: remoteBms } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id);

    if (remoteBms && remoteBms.length > 0) {
      for (const b of remoteBms) {
        await saveBookmark({
          id: `bm_${b.reference.replace(/[^a-zA-Z0-9]/g, '_')}`,
          type: 'verse',
          title: b.reference,
          content: b.verse_text,
          reference: b.reference,
          timestamp: b.created_at ? new Date(b.created_at).getTime() : Date.now()
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
        await saveMemorizedVerse(
          m.reference,
          m.verse_text,
          m.version,
          (m.status as 'practicing' | 'mastered') || 'mastered'
        );
      }
    }

    return true;
  } catch (e) {
    console.warn('pullCloudToLocal error:', e);
    return false;
  }
};

// Automatically register background sync listener on database mutations
registerSyncListener({
  onBookmarkSaved: (b) => { syncBookmarkToCloud(b); },
  onBookmarkRemoved: (ref) => { removeBookmarkFromCloud(ref); },
  onNoteSaved: (n) => { syncVerseNoteToCloud(n); },
  onHighlightSaved: (h) => { syncVerseHighlightToCloud(h); },
  onMemorizedSaved: (m) => { syncMemorizedVerseToCloud(m); }
});


