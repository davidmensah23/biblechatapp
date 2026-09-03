import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface LastReadProgress {
  book: string;
  chapter: number;
  verse?: number;
  translation: string;
  snippet?: string;
  estimatedMinutesRemaining: number;
  updatedAt: number;
}

const READING_PROGRESS_KEY = 'biblechat_last_read_progress';

const DEFAULT_PROGRESS: LastReadProgress = {
  book: 'Romans',
  chapter: 8,
  verse: 1,
  translation: 'NIV',
  snippet: 'There is now no condemnation for those who are in Christ Jesus, because through Christ Jesus the law of the Spirit who gives life has set you free.',
  estimatedMinutesRemaining: 4,
  updatedAt: Date.now(),
};

let memoryProgress: LastReadProgress = { ...DEFAULT_PROGRESS };

export const getLastReadPosition = async (): Promise<LastReadProgress> => {
  try {
    let saved: string | null = null;
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        saved = localStorage.getItem(READING_PROGRESS_KEY);
      }
    } else {
      saved = await SecureStore.getItemAsync(READING_PROGRESS_KEY);
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.book && parsed.chapter) {
        memoryProgress = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading last read position:', err);
  }
  return memoryProgress;
};

export const saveLastReadPosition = async (
  book: string,
  chapter: number,
  translation: string = 'NIV',
  verse?: number,
  snippet?: string,
  estimatedMinutesRemaining: number = 3
): Promise<void> => {
  const newProgress: LastReadProgress = {
    book,
    chapter,
    verse,
    translation,
    snippet: snippet || `Continuing through ${book} chapter ${chapter}`,
    estimatedMinutesRemaining: Math.max(1, estimatedMinutesRemaining),
    updatedAt: Date.now(),
  };

  memoryProgress = newProgress;

  try {
    const serialized = JSON.stringify(newProgress);
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(READING_PROGRESS_KEY, serialized);
      }
    } else {
      await SecureStore.setItemAsync(READING_PROGRESS_KEY, serialized);
    }
  } catch (err) {
    console.warn('Error saving last read position:', err);
  }
};
