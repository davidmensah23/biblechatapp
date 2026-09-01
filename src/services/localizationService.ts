import { getDB } from './database';

export type AppLanguage = 'en' | 'es' | 'fr' | 'pt' | 'tw' | 'sw';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'tw', name: 'Twi (Akan)', nativeName: 'Twi', flag: '🇬🇭' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' }
];

let currentLanguage: AppLanguage = 'en';
const listeners: Array<(lang: AppLanguage) => void> = [];

export const getAppLanguage = (): AppLanguage => currentLanguage;

export const setAppLanguage = async (lang: AppLanguage) => {
  currentLanguage = lang;
  listeners.forEach(cb => cb(lang));

  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      await db.runAsync(
        `INSERT INTO app_settings (key, value) VALUES ('language', ?)
         ON CONFLICT(key) DO UPDATE SET value = ?;`,
        [lang, lang]
      );
    } catch (e) {}
  }
};

export const subscribeLanguageChange = (cb: (lang: AppLanguage) => void) => {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const initializeLanguagePreference = async (): Promise<AppLanguage> => {
  const db = await getDB();
  if (db) {
    try {
      const row = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = 'language';"
      );
      if (row?.value && ['en', 'es', 'fr', 'pt', 'tw', 'sw'].includes(row.value)) {
        currentLanguage = row.value as AppLanguage;
      }
    } catch (e) {}
  }
  return currentLanguage;
};
