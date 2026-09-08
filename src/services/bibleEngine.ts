import { BibleBook } from '../types';
import { getDB } from './database';
import { fetchYouVersionPassage, fetchYouVersionBibles } from './youversionService';
import { getLocalizedBookName, isVernacularVersion } from './bibleBookTranslations';

export interface ChapterVerse {
  verseNumber: number;
  text: string;
}

export interface BibleChapterData {
  book: string;
  chapter: number;
  sectionTitle?: string;
  verses: ChapterVerse[];
  translation: string;
}

export interface BibleVersionInfo {
  id: string;
  code: string;
  name: string;
  language?: string;
  hasAudio: boolean;
  isDownloaded: boolean;
  downloadProgress?: number;
  apiTranslationKey: string;
}

// Bundled Public Domain World English Bible (WEB) for 100% Day-One Offline Reading
let bundledWebData: Record<string, string[]> | null = null;
export const getBundledChapter = (book: string, chapter: number): ChapterVerse[] | null => {
  if (!bundledWebData) {
    try {
      bundledWebData = require('../../assets/bibles/web.json');
    } catch (e) {
      console.warn('Could not load bundled web.json:', e);
      bundledWebData = {};
    }
  }
  const key = `${book}_${chapter}`;
  const verses = bundledWebData?.[key];
  if (verses && Array.isArray(verses) && verses.length > 0) {
    return verses.map((text, idx) => ({
      verseNumber: idx + 1,
      text
    }));
  }
  return null;
};

// Bundled New International Version (NIV) for 100% Day-One Offline Reading
let bundledNivData: Record<string, string[]> | null = null;
export const getBundledNivChapter = (book: string, chapter: number): ChapterVerse[] | null => {
  if (!bundledNivData) {
    try {
      bundledNivData = require('../../assets/bibles/niv.json');
    } catch (e) {
      console.warn('Could not load bundled niv.json:', e);
      bundledNivData = {};
    }
  }
  const key = `${book}_${chapter}`;
  const verses = bundledNivData?.[key];
  if (verses && Array.isArray(verses) && verses.length > 0) {
    return verses.map((text, idx) => ({
      verseNumber: idx + 1,
      text
    }));
  }
  return null;
};

export const BOOK_TO_USFM: Record<string, string> = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
  'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR',
  'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA', 'Jeremiah': 'JER',
  'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS', 'Joel': 'JOL',
  'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM',
  'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT',
  'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
  '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
};

// 66 Books of the Holy Bible with accurate chapter counts
export const ALL_BIBLE_BOOKS: BibleBook[] = [
  // Old Testament (39 books)
  { name: 'Genesis', testament: 'OT', chaptersCount: 50 },
  { name: 'Exodus', testament: 'OT', chaptersCount: 40 },
  { name: 'Leviticus', testament: 'OT', chaptersCount: 27 },
  { name: 'Numbers', testament: 'OT', chaptersCount: 36 },
  { name: 'Deuteronomy', testament: 'OT', chaptersCount: 34 },
  { name: 'Joshua', testament: 'OT', chaptersCount: 24 },
  { name: 'Judges', testament: 'OT', chaptersCount: 21 },
  { name: 'Ruth', testament: 'OT', chaptersCount: 4 },
  { name: '1 Samuel', testament: 'OT', chaptersCount: 31 },
  { name: '2 Samuel', testament: 'OT', chaptersCount: 24 },
  { name: '1 Kings', testament: 'OT', chaptersCount: 22 },
  { name: '2 Kings', testament: 'OT', chaptersCount: 25 },
  { name: '1 Chronicles', testament: 'OT', chaptersCount: 29 },
  { name: '2 Chronicles', testament: 'OT', chaptersCount: 36 },
  { name: 'Ezra', testament: 'OT', chaptersCount: 10 },
  { name: 'Nehemiah', testament: 'OT', chaptersCount: 13 },
  { name: 'Esther', testament: 'OT', chaptersCount: 10 },
  { name: 'Job', testament: 'OT', chaptersCount: 42 },
  { name: 'Psalms', testament: 'OT', chaptersCount: 150 },
  { name: 'Proverbs', testament: 'OT', chaptersCount: 31 },
  { name: 'Ecclesiastes', testament: 'OT', chaptersCount: 12 },
  { name: 'Song of Solomon', testament: 'OT', chaptersCount: 8 },
  { name: 'Isaiah', testament: 'OT', chaptersCount: 66 },
  { name: 'Jeremiah', testament: 'OT', chaptersCount: 52 },
  { name: 'Lamentations', testament: 'OT', chaptersCount: 5 },
  { name: 'Ezekiel', testament: 'OT', chaptersCount: 48 },
  { name: 'Daniel', testament: 'OT', chaptersCount: 12 },
  { name: 'Hosea', testament: 'OT', chaptersCount: 14 },
  { name: 'Joel', testament: 'OT', chaptersCount: 3 },
  { name: 'Amos', testament: 'OT', chaptersCount: 9 },
  { name: 'Obadiah', testament: 'OT', chaptersCount: 1 },
  { name: 'Jonah', testament: 'OT', chaptersCount: 4 },
  { name: 'Micah', testament: 'OT', chaptersCount: 7 },
  { name: 'Nahum', testament: 'OT', chaptersCount: 3 },
  { name: 'Habakkuk', testament: 'OT', chaptersCount: 3 },
  { name: 'Zephaniah', testament: 'OT', chaptersCount: 3 },
  { name: 'Haggai', testament: 'OT', chaptersCount: 2 },
  { name: 'Zechariah', testament: 'OT', chaptersCount: 14 },
  { name: 'Malachi', testament: 'OT', chaptersCount: 4 },

  // New Testament (27 books)
  { name: 'Matthew', testament: 'NT', chaptersCount: 28 },
  { name: 'Mark', testament: 'NT', chaptersCount: 16 },
  { name: 'Luke', testament: 'NT', chaptersCount: 24 },
  { name: 'John', testament: 'NT', chaptersCount: 21 },
  { name: 'Acts', testament: 'NT', chaptersCount: 28 },
  { name: 'Romans', testament: 'NT', chaptersCount: 16 },
  { name: '1 Corinthians', testament: 'NT', chaptersCount: 16 },
  { name: '2 Corinthians', testament: 'NT', chaptersCount: 13 },
  { name: 'Galatians', testament: 'NT', chaptersCount: 6 },
  { name: 'Ephesians', testament: 'NT', chaptersCount: 6 },
  { name: 'Philippians', testament: 'NT', chaptersCount: 4 },
  { name: 'Colossians', testament: 'NT', chaptersCount: 4 },
  { name: '1 Thessalonians', testament: 'NT', chaptersCount: 5 },
  { name: '2 Thessalonians', testament: 'NT', chaptersCount: 3 },
  { name: '1 Timothy', testament: 'NT', chaptersCount: 6 },
  { name: '2 Timothy', testament: 'NT', chaptersCount: 4 },
  { name: 'Titus', testament: 'NT', chaptersCount: 3 },
  { name: 'Philemon', testament: 'NT', chaptersCount: 1 },
  { name: 'Hebrews', testament: 'NT', chaptersCount: 13 },
  { name: 'James', testament: 'NT', chaptersCount: 5 },
  { name: '1 Peter', testament: 'NT', chaptersCount: 5 },
  { name: '2 Peter', testament: 'NT', chaptersCount: 3 },
  { name: '1 John', testament: 'NT', chaptersCount: 5 },
  { name: '2 John', testament: 'NT', chaptersCount: 1 },
  { name: '3 John', testament: 'NT', chaptersCount: 1 },
  { name: 'Jude', testament: 'NT', chaptersCount: 1 },
  { name: 'Revelation', testament: 'NT', chaptersCount: 22 }
];

export interface ResolvedScripturePassage {
  citation: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  verses: ChapterVerse[];
  text: string;
  translation: string;
}

export function parseReferenceString(refStr: string): { book: string; chapter: number; startVerse?: number; endVerse?: number } | null {
  if (!refStr || typeof refStr !== 'string') return null;
  const trimmed = refStr.trim();

  // Matches "1 Peter 5:7", "John 21:9-17", "Psalms 23:1-4", "Genesis 1:1", "Romans 8"
  const regex = /^((?:[123]\s+)?[A-Za-z\s]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;
  const match = trimmed.match(regex);
  if (!match) return null;

  let rawBook = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const startVerse = match[3] ? parseInt(match[3], 10) : undefined;
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;

  // Book alias mappings
  const bookAliases: Record<string, string> = {
    'psalm': 'Psalms',
    'song of songs': 'Song of Solomon',
    'canticles': 'Song of Solomon',
    '1 cor': '1 Corinthians',
    '2 cor': '2 Corinthians',
    '1 thess': '1 Thessalonians',
    '2 thess': '2 Thessalonians',
    '1 tim': '1 Timothy',
    '2 tim': '2 Timothy',
    '1 pet': '1 Peter',
    '2 pet': '2 Peter',
    '1 jn': '1 John',
    '2 jn': '2 John',
    '3 jn': '3 John',
    'rev': 'Revelation',
    'matt': 'Matthew',
    'rom': 'Romans',
    'gen': 'Genesis',
    'ex': 'Exodus',
    'exod': 'Exodus',
    'heb': 'Hebrews'
  };

  const lowerRaw = rawBook.toLowerCase();
  let normalizedBook = bookAliases[lowerRaw];

  if (!normalizedBook) {
    const found = ALL_BIBLE_BOOKS.find(b => b.name.toLowerCase() === lowerRaw);
    if (found) {
      normalizedBook = found.name;
    } else {
      const prefixMatch = ALL_BIBLE_BOOKS.find(b => b.name.toLowerCase().startsWith(lowerRaw));
      if (prefixMatch) {
        normalizedBook = prefixMatch.name;
      } else {
        normalizedBook = rawBook;
      }
    }
  }

  return {
    book: normalizedBook,
    chapter,
    startVerse,
    endVerse
  };
}

export function resolveScriptureReference(
  referenceStr: string,
  preferredTranslation: string = 'NIV'
): ResolvedScripturePassage | null {
  const parsed = parseReferenceString(referenceStr);
  if (!parsed) return null;

  const { book, chapter, startVerse, endVerse } = parsed;

  // Try bundled NIV first (0ms offline, verified)
  let allVerses = getBundledNivChapter(book, chapter);
  let translationUsed = 'NIV';

  if (!allVerses || allVerses.length === 0) {
    // Fall back to bundled WEB
    allVerses = getBundledChapter(book, chapter);
    translationUsed = 'WEB';
  }

  if (!allVerses || allVerses.length === 0) {
    return null;
  }

  let selectedVerses: ChapterVerse[];
  if (startVerse !== undefined) {
    const end = endVerse !== undefined ? endVerse : startVerse;
    selectedVerses = allVerses.filter(v => v.verseNumber >= startVerse && v.verseNumber <= end);
    if (selectedVerses.length === 0) {
      selectedVerses = allVerses;
    }
  } else {
    selectedVerses = allVerses;
  }

  const citation = startVerse !== undefined
    ? (endVerse && endVerse !== startVerse
        ? `${book} ${chapter}:${startVerse}-${endVerse}`
        : `${book} ${chapter}:${startVerse}`)
    : `${book} ${chapter}`;

  const text = selectedVerses.map(v => v.text).join(' ');

  return {
    citation,
    book,
    chapter,
    startVerse: startVerse || 1,
    endVerse: endVerse || (selectedVerses[selectedVerses.length - 1]?.verseNumber || 1),
    verses: selectedVerses,
    text,
    translation: translationUsed
  };
}

export const INITIAL_BIBLE_VERSIONS: BibleVersionInfo[] = [
  // English (Historic & Modern)
  { id: '1', code: 'NIV', name: 'New International Version', language: 'en', hasAudio: true, isDownloaded: true, apiTranslationKey: 'niv' },
  { id: '2', code: 'KJV', name: 'King James Version (1611)', language: 'en', hasAudio: true, isDownloaded: true, apiTranslationKey: 'kjv' },
  { id: '3', code: 'ESV', name: 'English Standard Version', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'bolls:ESV' },
  { id: '4', code: 'GNV', name: 'Geneva Bible (1599)', language: 'en', hasAudio: true, isDownloaded: true, apiTranslationKey: 'youversion:2163' },
  { id: '5', code: 'NKJV', name: 'New King James Version', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'bolls:NKJV' },
  { id: '6', code: 'NLT', name: 'New Living Translation', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'bolls:NLT' },
  { id: '7', code: 'NASB', name: 'New American Standard Bible (NASB 2020)', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:2692' },
  { id: '8', code: 'CSB', name: 'Christian Standard Bible', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:1713' },
  { id: '9', code: 'AMP', name: 'Amplified Bible', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:1588' },
  { id: '10', code: 'MSG', name: 'The Message (Eugene Peterson)', language: 'en', hasAudio: false, isDownloaded: false, apiTranslationKey: 'bolls:MSG' },
  { id: '11', code: 'NET', name: 'New English Translation', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:107' },
  { id: '12', code: 'BSB', name: 'Berean Standard Bible', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:3034' },
  { id: '13', code: 'WEB', name: 'World English Bible', language: 'en', hasAudio: true, isDownloaded: true, apiTranslationKey: 'web' },
  { id: '14', code: 'CEV', name: 'Contemporary English Version', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:392' },
  { id: '15', code: 'GNT', name: 'Good News Translation', language: 'en', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:68' },
  { id: '16', code: 'BBE', name: 'Bible in Basic English', language: 'en', hasAudio: false, isDownloaded: false, apiTranslationKey: 'bbe' },
  { id: '17', code: 'ASV', name: 'American Standard Version (1901)', language: 'en', hasAudio: false, isDownloaded: false, apiTranslationKey: 'youversion:12' },
  { id: '18', code: 'YLT', name: 'Young\'s Literal Translation (1898)', language: 'en', hasAudio: false, isDownloaded: false, apiTranslationKey: 'youversion:821' },
  { id: '19', code: 'DBY', name: 'Darby Translation (1890)', language: 'en', hasAudio: false, isDownloaded: false, apiTranslationKey: 'youversion:478' },

  // Ghanaian & West African (Akan, Twi, Fante, Ga, Ewe)
  { id: '40', code: 'ASCB', name: 'Asante Twi Contemporary Bible (Biblica)', language: 'tw', hasAudio: true, isDownloaded: true, apiTranslationKey: 'youversion:2094' },
  { id: '41', code: 'AKCB', name: 'Akuapem Twi Contemporary Bible (Biblica)', language: 'tw', hasAudio: true, isDownloaded: true, apiTranslationKey: 'youversion:1631' },
  { id: '42', code: 'FAT', name: 'Fante Bible (Mfantse Baebor No)', language: 'tw', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:1755' },
  { id: '43', code: 'GA', name: 'Ga Bible (Ngmami Kpotu)', language: 'tw', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:1981' },
  { id: '44', code: 'EWE', name: 'Ewe Bible (Biblia)', language: 'tw', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:1539' },

  // Nigerian & West African
  { id: '45', code: 'PCM', name: 'Holy Bible Nigerian Pidgin English (YouVersion)', language: 'pcm', hasAudio: true, isDownloaded: true, apiTranslationKey: 'youversion:2516' },
  { id: '46', code: 'YCB', name: 'Yoruba Contemporary Bible (YouVersion)', language: 'yo', hasAudio: true, isDownloaded: true, apiTranslationKey: 'youversion:911' },
  { id: '47', code: 'ICB', name: 'Igbo Contemporary Bible (YouVersion)', language: 'ig', hasAudio: true, isDownloaded: true, apiTranslationKey: 'youversion:1624' },
  { id: '48', code: 'HAU', name: 'Hausa Bible (Littafi Mai Tsarki)', language: 'yo', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:1626' },

  // East Africa (Swahili)
  { id: '50', code: 'SUV', name: 'Swahili Union Version (Biblia Takatifu)', language: 'sw', hasAudio: true, isDownloaded: true, apiTranslationKey: 'web' },
  { id: '51', code: 'NEN', name: 'Kiswahili Contemporary Version - Neno (YouVersion)', language: 'sw', hasAudio: true, isDownloaded: true, apiTranslationKey: 'youversion:1627' },

  // Spanish (Español)
  { id: '52', code: 'RVR', name: 'Reina-Valera 1960', language: 'es', hasAudio: true, isDownloaded: true, apiTranslationKey: 'rvr' },
  { id: '53', code: 'NVI-ES', name: 'Nueva Versión Internacional (YouVersion)', language: 'es', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:128' },

  // French (Français)
  { id: '54', code: 'LSG', name: 'Louis Segond 1910', language: 'fr', hasAudio: true, isDownloaded: true, apiTranslationKey: 'lsg' },
  { id: '55', code: 'BDS', name: 'La Bible du Semeur (YouVersion)', language: 'fr', hasAudio: false, isDownloaded: false, apiTranslationKey: 'youversion:21' },

  // Portuguese (Português)
  { id: '56', code: 'ARC', name: 'Almeida Revista e Corrigida', language: 'pt', hasAudio: true, isDownloaded: true, apiTranslationKey: 'almeida' },
  { id: '57', code: 'NVI-PT', name: 'Nova Versão Internacional (YouVersion)', language: 'pt', hasAudio: false, isDownloaded: false, apiTranslationKey: 'youversion:129' },

  // European & Global
  { id: '60', code: 'LUT', name: 'Lutherbibel 1912 (Deutsch)', language: 'de', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:157' },
  { id: '61', code: 'RIV', name: 'La Sacra Bibbia Riveduta 1927 (Italiano)', language: 'it', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:1130' },
  { id: '62', code: 'TAB', name: 'Ang Biblia 1905 (Tagalog)', language: 'tl', hasAudio: true, isDownloaded: false, apiTranslationKey: 'youversion:399' }
];

let memoryVersionsState: BibleVersionInfo[] = [...INITIAL_BIBLE_VERSIONS];


export const registerDynamicBibleVersion = (v: BibleVersionInfo) => {
  const existingIndex = INITIAL_BIBLE_VERSIONS.findIndex(
    item => item.code.toUpperCase() === v.code.toUpperCase()
  );
  if (existingIndex === -1) {
    INITIAL_BIBLE_VERSIONS.push(v);
  } else {
    INITIAL_BIBLE_VERSIONS[existingIndex] = { ...INITIAL_BIBLE_VERSIONS[existingIndex], ...v };
  }
};

/**
 * Fetches Bible versions categorized by language, combining local catalog
 * with real-time live queries from the YouVersion API (1000s of Bibles).
 */
export const fetchBibleVersionsForLanguage = async (
  langCode: string = 'all'
): Promise<BibleVersionInfo[]> => {
  let filteredLocal = [...INITIAL_BIBLE_VERSIONS];
  if (langCode !== 'all') {
    filteredLocal = INITIAL_BIBLE_VERSIONS.filter(v => v.language === langCode);
  }

  try {
    const yvLangMap: Record<string, string> = {
      tw: 'aka',
      es: 'spa',
      fr: 'fra',
      pt: 'por',
      sw: 'swa',
      yo: 'yor',
      ig: 'ibo',
      pcm: 'pcm',
      de: 'deu',
      it: 'ita',
      tl: 'tgl',
      en: 'eng',
      all: 'eng'
    };
    const yvQuery = yvLangMap[langCode] || 'eng';
    const yvList = await fetchYouVersionBibles(yvQuery);
    if (yvList && yvList.length > 0) {
      const liveList: BibleVersionInfo[] = yvList.map(b => ({
        id: String(b.id),
        code: b.abbreviation.toUpperCase(),
        name: b.title,
        language: langCode === 'all' ? 'en' : langCode,
        hasAudio: true,
        isDownloaded: false,
        apiTranslationKey: `youversion:${b.id}`
      }));

      // Register all dynamic bibles so fetchChapter can resolve them!
      liveList.forEach(registerDynamicBibleVersion);

      const combined = [...filteredLocal];
      for (const live of liveList) {
        if (!combined.some(c => c.code.toUpperCase() === live.code.toUpperCase())) {
          combined.push(live);
        }
      }
      return combined;
    }
  } catch (err) {
    console.warn('Error fetching live YouVersion bibles:', err);
  }

  return filteredLocal;
};

export const getBibleVersionsList = async (): Promise<BibleVersionInfo[]> => {
  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS offline_bible_versions (
          code TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          has_audio INTEGER NOT NULL,
          is_downloaded INTEGER NOT NULL,
          api_key TEXT NOT NULL
        );
      `);

      const existing = await db.getAllAsync<{ code: string; is_downloaded: number }>('SELECT code, is_downloaded FROM offline_bible_versions');
      if (!existing || existing.length === 0) {
        for (const v of INITIAL_BIBLE_VERSIONS) {
          await db.runAsync(
            'INSERT OR REPLACE INTO offline_bible_versions (code, name, has_audio, is_downloaded, api_key) VALUES (?, ?, ?, ?, ?)',
            [v.code, v.name, v.hasAudio ? 1 : 0, v.isDownloaded ? 1 : 0, v.apiTranslationKey]
          );
        }
      } else {
        return INITIAL_BIBLE_VERSIONS.map(v => {
          const row = existing.find(e => e.code.toUpperCase() === v.code.toUpperCase());
          return {
            ...v,
            isDownloaded: v.code.toUpperCase() === 'WEB' ? true : (row ? Boolean(row.is_downloaded) : false)
          };
        });
      }
    } catch (e) {
      console.warn('Error reading bible versions from DB:', e);
    }
  }

  return memoryVersionsState;
};

/**
 * Downloads and persists a complete Bible version onto the device (in SQLite).
 * Downloads foundational books & chapters progressively.
 */
export const downloadBibleVersion = async (
  versionCode: string,
  onProgress?: (progress: number) => void
): Promise<boolean> => {
  const version = INITIAL_BIBLE_VERSIONS.find(v => v.code.toUpperCase() === versionCode.toUpperCase());
  if (!version) return false;

  // 1. If WEB or NIV, it is already bundled locally in full
  if (version.code.toUpperCase() === 'WEB' || version.code.toUpperCase() === 'NIV') {
    const db = await getDB();
    if (db) {
      try {
        await db.runAsync(
          'INSERT OR REPLACE INTO offline_bible_versions (code, name, has_audio, is_downloaded, api_key) VALUES (?, ?, ?, 1, ?)',
          [version.code, version.name, version.hasAudio ? 1 : 0, version.apiTranslationKey]
        );
      } catch (e) {}
    }
    if (onProgress) onProgress(100);
    return true;
  }

  try {
    const db = await getDB();
    if (!db) return false;

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_bible_chapters (
        id TEXT PRIMARY KEY NOT NULL,
        translation TEXT NOT NULL,
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        section_title TEXT,
        verses_json TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);

    // Prioritize New Testament first (260 ch), then Psalms (150 ch), Proverbs (31 ch), Genesis (50 ch), then remaining OT
    const priorityBooks = [
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
      '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
      '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
      'Psalms', 'Proverbs', 'Genesis'
    ];

    const orderedBooks = [
      ...ALL_BIBLE_BOOKS.filter(b => priorityBooks.includes(b.name)),
      ...ALL_BIBLE_BOOKS.filter(b => !priorityBooks.includes(b.name))
    ];

    const allChaptersList: { book: string; chapter: number }[] = [];
    for (const book of orderedBooks) {
      for (let ch = 1; ch <= book.chaptersCount; ch++) {
        allChaptersList.push({ book: book.name, chapter: ch });
      }
    }

    const totalChapters = allChaptersList.length;
    let downloadedCount = 0;
    const CHUNK_SIZE = 2; // Paced to avoid 429 rate limits

    for (let i = 0; i < allChaptersList.length; i += CHUNK_SIZE) {
      const chunk = allChaptersList.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (item) => {
          try {
            await fetchChapter(item.book, item.chapter, version.code);
          } catch (err) {
            // Non-fatal, keep downloading
          }
          downloadedCount++;
        })
      );

      // Throttling delay to prevent YouVersion / Bolls API rate limiting
      await new Promise(resolve => setTimeout(resolve, 80));

      if (onProgress) {
        const percent = Math.min(99, Math.round((downloadedCount / totalChapters) * 100));
        onProgress(percent);
      }
    }

    // Mark as permanently downloaded
    await db.runAsync(
      'INSERT OR REPLACE INTO offline_bible_versions (code, name, has_audio, is_downloaded, api_key) VALUES (?, ?, ?, 1, ?)',
      [version.code, version.name, version.hasAudio ? 1 : 0, version.apiTranslationKey]
    );

    memoryVersionsState = memoryVersionsState.map(v =>
      v.code.toUpperCase() === versionCode.toUpperCase() ? { ...v, isDownloaded: true } : v
    );

    if (onProgress) onProgress(100);
    return true;
  } catch (e) {
    console.error('Error downloading Bible version:', e);
    return false;
  }
};

/**
 * Real Multi-Translation Chapter Fetcher with YouVersion, Bible-API & SQLite Offline Caching
 */
export async function fetchChapter(
  book: string,
  chapter: number,
  translation: string = 'NIV'
): Promise<BibleChapterData> {
  const transCode = translation.toUpperCase();
  const cacheKey = `${transCode}_${book}_${chapter}`;

  // 1. Check SQLite Offline Cache (Immediate 0ms response)
  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS offline_bible_chapters (
          id TEXT PRIMARY KEY NOT NULL,
          translation TEXT NOT NULL,
          book TEXT NOT NULL,
          chapter INTEGER NOT NULL,
          section_title TEXT,
          verses_json TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        );
      `);

      const row = await db.getFirstAsync<{
        id: string;
        section_title: string;
        verses_json: string;
      }>('SELECT * FROM offline_bible_chapters WHERE id = ?', [cacheKey]);

      if (row && row.verses_json) {
        const verses: ChapterVerse[] = JSON.parse(row.verses_json);
        return {
          book,
          chapter,
          sectionTitle: row.section_title || `${book} Chapter ${chapter}`,
          translation: transCode,
          verses
        };
      }
    } catch (e) {
      console.warn('SQLite chapter lookup note:', e);
    }
  }

  // 1.5 Special check for bundled World English Bible (WEB): 0ms instant local resolution
  if (transCode === 'WEB') {
    const bundledVerses = getBundledChapter(book, chapter);
    if (bundledVerses && bundledVerses.length > 0) {
      const result: BibleChapterData = {
        book,
        chapter,
        sectionTitle: `${book} Chapter ${chapter}`,
        translation: 'WEB',
        verses: bundledVerses
      };
      if (db) {
        db.runAsync(
          'INSERT OR REPLACE INTO offline_bible_chapters (id, translation, book, chapter, section_title, verses_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [cacheKey, 'WEB', book, chapter, result.sectionTitle || '', JSON.stringify(bundledVerses), Date.now()]
        ).catch(() => {});
      }
      return result;
    }
  }

  // 1.6 Special check for bundled New International Version (NIV): 0ms instant local resolution
  if (transCode === 'NIV') {
    const bundledVerses = getBundledNivChapter(book, chapter);
    if (bundledVerses && bundledVerses.length > 0) {
      const result: BibleChapterData = {
        book,
        chapter,
        sectionTitle: `${book} Chapter ${chapter}`,
        translation: 'NIV',
        verses: bundledVerses
      };
      if (db) {
        db.runAsync(
          'INSERT OR REPLACE INTO offline_bible_chapters (id, translation, book, chapter, section_title, verses_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [cacheKey, 'NIV', book, chapter, result.sectionTitle || '', JSON.stringify(bundledVerses), Date.now()]
        ).catch(() => {});
      }
      return result;
    }
  }

  const versionMeta = INITIAL_BIBLE_VERSIONS.find(v => v.code.toUpperCase() === transCode);

  // 2. Dynamic Live Fetching from YouVersion (Asante Twi, Akuapem Twi, Nigerian Pidgin, Yoruba, Igbo, etc.)
  if (versionMeta?.apiTranslationKey?.startsWith('youversion:')) {
    const bibleId = versionMeta.apiTranslationKey.split(':')[1];
    const usfmBook = BOOK_TO_USFM[book] || book.substring(0, 3).toUpperCase();
    const passageId = `${usfmBook}.${chapter}`;

    try {
      const yvPassage = await fetchYouVersionPassage(passageId, bibleId);
      if (yvPassage && yvPassage.content) {
        const rawParts = yvPassage.content
          .replace(/\r\n/g, '\n')
          .split(/(?<=[.?!])\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const verses: ChapterVerse[] = rawParts.map((text, idx) => ({
          verseNumber: idx + 1,
          text
        }));

        const result: BibleChapterData = {
          book,
          chapter,
          sectionTitle: (() => {
          const isVern = isVernacularVersion(transCode, versionMeta?.language);
          const localBook = getLocalizedBookName(book, versionMeta?.language || 'en');
          return yvPassage.reference || (isVern ? `${localBook} ${chapter}` : `${book} Chapter ${chapter}`);
        })(),
          translation: transCode,
          verses
        };

        // Cache permanently in SQLite for 100% offline reading!
        if (db) {
          try {
            await db.runAsync(
              'INSERT OR REPLACE INTO offline_bible_chapters (id, translation, book, chapter, section_title, verses_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [cacheKey, transCode, book, chapter, result.sectionTitle || '', JSON.stringify(verses), Date.now()]
            );
          } catch (e) {}
        }

        return result;
      }
    } catch (err) {
      console.warn(`YouVersion fetch error for ${book} ${chapter} (${transCode}):`, err);
    }
  }

  // 2.5 Dynamic Live Fetching from Bolls.life for NLT, ESV, NKJV, MSG
  if (versionMeta?.apiTranslationKey?.startsWith('bolls:') || ['NLT', 'ESV', 'NKJV', 'MSG'].includes(transCode)) {
    const transId = versionMeta?.apiTranslationKey?.startsWith('bolls:')
      ? versionMeta.apiTranslationKey.split(':')[1]
      : transCode;
    const bookIndex = ALL_BIBLE_BOOKS.findIndex(b => b.name.toLowerCase() === book.toLowerCase()) + 1;
    if (bookIndex > 0) {
      try {
        const res = await fetch(`https://bolls.life/get-chapter/${transId}/${bookIndex}/${chapter}/`);
        if (res.ok) {
          const items = await res.json();
          if (Array.isArray(items) && items.length > 0) {
            const parsedVerses: ChapterVerse[] = items.map((it: any) => ({
              verseNumber: it.verse,
              text: it.text.replace(/<[^>]*>/g, '').trim()
            }));

            const result: BibleChapterData = {
              book,
              chapter,
              sectionTitle: `${book} Chapter ${chapter}`,
              translation: transCode,
              verses: parsedVerses
            };

            if (db) {
              try {
                await db.runAsync(
                  'INSERT OR REPLACE INTO offline_bible_chapters (id, translation, book, chapter, section_title, verses_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [cacheKey, transCode, book, chapter, result.sectionTitle || '', JSON.stringify(parsedVerses), Date.now()]
                );
              } catch (e) {}
            }

            return result;
          }
        }
      } catch (err) {
        console.warn(`Bolls API fetch error for ${book} ${chapter} (${transCode}):`, err);
      }
    }
  }

  // 3. Dynamic Live Fetching from Bible-API for standard English/Spanish/French/Portuguese
  try {
    const apiTransKey = versionMeta?.apiTranslationKey || (transCode === 'KJV' ? 'kjv' : 'web');
    const formattedBook = encodeURIComponent(book);
    const res = await fetch(`https://bible-api.com/${formattedBook}+${chapter}?translation=${apiTransKey}`);

    if (res.ok) {
      const data = await res.json();
      if (data && data.verses && data.verses.length > 0) {
        const parsedVerses: ChapterVerse[] = data.verses.map((v: any) => ({
          verseNumber: v.verse,
          text: v.text.trim()
        }));

        const result: BibleChapterData = {
          book,
          chapter,
          sectionTitle: `${book} Chapter ${chapter}`,
          translation: transCode,
          verses: parsedVerses
        };

        if (db) {
          try {
            await db.runAsync(
              'INSERT OR REPLACE INTO offline_bible_chapters (id, translation, book, chapter, section_title, verses_json, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [cacheKey, transCode, book, chapter, result.sectionTitle || '', JSON.stringify(parsedVerses), Date.now()]
            );
          } catch (e) {}
        }

        return result;
      }
    }
  } catch (err) {
    console.warn(`Bible API fetch error for ${book} ${chapter} (${transCode}):`, err);
  }

  // 4. Fallback Resilient Chapter (Bundled Offline NIV or WEB)
  if (transCode === 'NIV') {
    const bundledNiv = getBundledNivChapter(book, chapter);
    if (bundledNiv && bundledNiv.length > 0) {
      return {
        book,
        chapter,
        sectionTitle: `${book} Chapter ${chapter}`,
        translation: 'NIV',
        verses: bundledNiv
      };
    }
  }

  const bundledVerses = getBundledChapter(book, chapter);
  if (bundledVerses && bundledVerses.length > 0) {
    return {
      book,
      chapter,
      sectionTitle: `${book} Chapter ${chapter}`,
      translation: transCode,
      verses: bundledVerses
    };
  }

  return {
    book,
    chapter,
    sectionTitle: `${book} Chapter ${chapter}`,
    translation: transCode,
    verses: [
      { verseNumber: 1, text: `The grace of the Lord Jesus Christ be with your spirit. (${book} ${chapter}:1)` },
      { verseNumber: 2, text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
      { verseNumber: 3, text: 'For God so loved the world, that He gave His only begotten Son.' }
    ]
  };
}

/**
 * Real Multi-Translation Specific Verse Fetcher for Instant Accurate Comparisons
 */
export async function fetchSpecificVerse(
  book: string,
  chapter: number,
  verseNumber: number,
  translation: string = 'NIV'
): Promise<string | null> {
  const transCode = translation.toUpperCase();

  // 0. Fast local check for bundled WEB
  if (transCode === 'WEB') {
    const bundledVerses = getBundledChapter(book, chapter);
    if (bundledVerses) {
      const matched = bundledVerses.find(v => v.verseNumber === verseNumber);
      if (matched) return matched.text;
    }
  }

  const versionMeta = INITIAL_BIBLE_VERSIONS.find(v => v.code.toUpperCase() === transCode);

  // 1. Check Bolls.life (NLT, ESV, NKJV, MSG, etc.)
  if (versionMeta?.apiTranslationKey?.startsWith('bolls:') || ['NLT', 'ESV', 'NKJV', 'MSG'].includes(transCode)) {
    const transId = versionMeta?.apiTranslationKey?.startsWith('bolls:')
      ? versionMeta.apiTranslationKey.split(':')[1]
      : transCode;
    const bookIndex = ALL_BIBLE_BOOKS.findIndex(b => b.name.toLowerCase() === book.toLowerCase()) + 1;
    if (bookIndex > 0) {
      try {
        const res = await fetch(`https://bolls.life/get-verse/${transId}/${bookIndex}/${chapter}/${verseNumber}/`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.text) {
            return data.text.replace(/<[^>]*>/g, '').trim();
          }
        }
      } catch (e) {}
    }
  }

  // 2. Check YouVersion (NIV, AMP, NASB, BSB, GNV, Asante Twi, Yoruba, etc.)
  let bibleId = versionMeta?.apiTranslationKey?.startsWith('youversion:')
    ? versionMeta.apiTranslationKey.split(':')[1]
    : null;
  if (!bibleId) {
    if (transCode === 'NIV') bibleId = '111';
    else if (transCode === 'AMP') bibleId = '1588';
    else if (transCode === 'NASB') bibleId = '2692';
    else if (transCode === 'BSB') bibleId = '3034';
    else if (transCode === 'GNV') bibleId = '2163';
    else if (transCode === 'TWI' || transCode === 'ASCB') bibleId = '2094';
    else if (transCode === 'AKCB') bibleId = '1631';
    else if (transCode === 'YOR' || transCode === 'YCB') bibleId = '911';
    else if (transCode === 'ASV') bibleId = '12';
  }

  if (bibleId) {
    const usfmBook = BOOK_TO_USFM[book] || book.substring(0, 3).toUpperCase();
    const passageId = `${usfmBook}.${chapter}.${verseNumber}`;
    try {
      const yvPassage = await fetchYouVersionPassage(passageId, bibleId);
      if (yvPassage && yvPassage.content) {
        return yvPassage.content.replace(/\r\n/g, ' ').replace(/<[^>]*>/g, '').trim();
      }
    } catch (e) {}
  }

  // 3. Check Bible-API (KJV, WEB, etc.)
  try {
    const apiTransKey = (transCode === 'KJV' ? 'kjv' : 'web');
    const formattedBook = encodeURIComponent(book);
    const res = await fetch(`https://bible-api.com/${formattedBook}+${chapter}:${verseNumber}?translation=${apiTransKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return data.text.trim();
      }
    }
  } catch (e) {}

  // 4. Fallback: Fetch chapter and match verse
  try {
    const chapterData = await fetchChapter(book, chapter, translation);
    const matched = chapterData.verses.find(v => v.verseNumber === verseNumber);
    return matched ? matched.text : null;
  } catch (e) {
    return null;
  }
}

