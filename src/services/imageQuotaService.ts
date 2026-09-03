import { getDB } from './database';

const REGISTERED_DAILY_LIMIT = 3;
const GUEST_DAILY_LIMIT = 1;

const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface QuotaStatus {
  remaining: number;
  total: number;
  canGenerate: boolean;
}

/**
 * Checks remaining AI scripture image generations for today.
 */
export async function getRemainingImageGenerations(isGuest: boolean = true): Promise<QuotaStatus> {
  const total = isGuest ? GUEST_DAILY_LIMIT : REGISTERED_DAILY_LIMIT;
  const today = getLocalDateString();
  const db = await getDB();
  if (!db) {
    return { remaining: total, total, canGenerate: true };
  }

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_image_generations (
        date_str TEXT PRIMARY KEY NOT NULL,
        count INTEGER NOT NULL
      );
    `);

    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT count FROM daily_image_generations WHERE date_str = ? LIMIT 1;',
      [today]
    );

    const used = row ? row.count : 0;
    const remaining = Math.max(0, total - used);
    return {
      remaining,
      total,
      canGenerate: remaining > 0
    };
  } catch (e) {
    console.warn('Error reading image quota:', e);
    return { remaining: total, total, canGenerate: true };
  }
}

/**
 * Records one AI scripture image generation for today.
 */
export async function recordImageGeneration(isGuest: boolean = true): Promise<boolean> {
  const today = getLocalDateString();
  const db = await getDB();
  if (!db) return false;

  try {
    const status = await getRemainingImageGenerations(isGuest);
    if (!status.canGenerate) return false;

    await db.runAsync(
      `INSERT INTO daily_image_generations (date_str, count)
       VALUES (?, 1)
       ON CONFLICT(date_str) DO UPDATE SET count = count + 1;`,
      [today]
    );
    return true;
  } catch (e) {
    console.warn('Error recording image generation:', e);
    return false;
  }
}
