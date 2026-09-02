import { supabase } from './supabase';
import {
  fetchAllHighlights,
  fetchAllVerseNotes,
  fetchBookmarks,
  fetchMemorizedVerses,
  saveVerseHighlight,
  saveVerseNote,
  saveBookmark,
  saveMemorizedVerse
} from './database';

export const syncAllToCloud = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
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
        reference: b.verseCitation,
        verse_text: b.verseText,
        version: b.translation || 'NIV'
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
        practice_count: m.practiceCount
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

export const pullCloudToLocal = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 1. Pull Highlights
    const { data: remoteHls } = await supabase
      .from('user_verse_highlights')
      .select('*')
      .eq('user_id', user.id);

    if (remoteHls) {
      for (const h of remoteHls) {
        await saveVerseHighlight(h.book, h.chapter, h.verse, h.color, h.verse_text);
      }
    }

    // 2. Pull Notes
    const { data: remoteNotes } = await supabase
      .from('user_verse_notes')
      .select('*')
      .eq('user_id', user.id);

    if (remoteNotes) {
      for (const n of remoteNotes) {
        await saveVerseNote(n.book, n.chapter, n.verse, n.reference, n.verse_text, n.note_text);
      }
    }

    // 3. Pull Bookmarks
    const { data: remoteBms } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id);

    if (remoteBms) {
      for (const b of remoteBms) {
        await saveBookmark({
          id: `bm_${b.reference.replace(/[^a-zA-Z0-9]/g, '_')}`,
          verseCitation: b.reference,
          verseText: b.verse_text,
          translation: b.version,
          createdAt: new Date(b.created_at).getTime()
        });
      }
    }

    // 4. Pull Memorized Verses
    const { data: remoteMems } = await supabase
      .from('user_memorized_verses')
      .select('*')
      .eq('user_id', user.id);

    if (remoteMems) {
      for (const m of remoteMems) {
        await saveMemorizedVerse(m.reference, m.verse_text, m.version);
      }
    }

    return true;
  } catch (e) {
    console.warn('pullCloudToLocal error:', e);
    return false;
  }
};
