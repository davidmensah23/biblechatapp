import { getDB } from './database';

export interface FaithBadge {
  id: string;
  title: string;
  subtitle: string;
  category: 'walk' | 'study' | 'communion' | 'sermon';
  iconName: string;
  iconColor: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  xpReward: number;
}

export interface SpiritualGrowthProfile {
  streakDays: number;
  highestStreak: number;
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  currentLevelXp: number;
  nextLevelXp: number;
  chaptersReadCount: number;
  conversationsCount: number;
  sermonsPreparedCount: number;
  badges: FaithBadge[];
}

const LEVEL_TIERS = [
  { level: 1, title: 'Seeker of the Way', minXp: 0, maxXp: 100 },
  { level: 2, title: 'Disciple on the Road', minXp: 100, maxXp: 250 },
  { level: 3, title: 'Companion of Apostles', minXp: 250, maxXp: 500 },
  { level: 4, title: 'Berean Scholar', minXp: 500, maxXp: 900 },
  { level: 5, title: 'Pillar of Faith', minXp: 900, maxXp: 1500 },
  { level: 6, title: 'Ambassador of Grace', minXp: 1500, maxXp: 3000 }
];

const INITIAL_BADGES: FaithBadge[] = [
  {
    id: 'fisher_of_men',
    title: 'Fisher of Men',
    subtitle: 'Walked with Simon Peter in candid reflection',
    category: 'communion',
    iconName: 'boat-outline',
    iconColor: '#2563EB',
    isUnlocked: true,
    progress: 1,
    maxProgress: 1,
    xpReward: 50
  },
  {
    id: 'beloved_disciple',
    title: 'Heart of the Beloved',
    subtitle: 'Rest in divine love through deep fellowship with John',
    category: 'communion',
    iconName: 'heart-outline',
    iconColor: '#E11D48',
    isUnlocked: true,
    progress: 2,
    maxProgress: 2,
    xpReward: 50
  },
  {
    id: 'berean_scholar',
    title: 'Berean Scholar',
    subtitle: 'Search the Holy Scriptures daily (3 chapters)',
    category: 'study',
    iconName: 'book-outline',
    iconColor: '#059669',
    isUnlocked: true,
    progress: 3,
    maxProgress: 3,
    xpReward: 75
  },
  {
    id: 'pulpit_builder',
    title: 'Pulpit Builder',
    subtitle: 'Collaborate with Paul in Sunday Sermon Workshop',
    category: 'sermon',
    iconName: 'flame-outline',
    iconColor: '#D97706',
    isUnlocked: false,
    progress: 1,
    maxProgress: 2,
    xpReward: 100
  },
  {
    id: 'flame_walker',
    title: 'Pentecost Flame',
    subtitle: 'Maintain a 5-day continuous walking streak',
    category: 'walk',
    iconName: 'sparkles-outline',
    iconColor: '#7C3AED',
    isUnlocked: false,
    progress: 3,
    maxProgress: 5,
    xpReward: 120
  },
  {
    id: 'polyglot_scribe',
    title: 'Polyglot Scribe',
    subtitle: 'Download and read in 2 different Bible translations',
    category: 'study',
    iconName: 'globe-outline',
    iconColor: '#0284C7',
    isUnlocked: true,
    progress: 2,
    maxProgress: 2,
    xpReward: 60
  }
];

export const getSpiritualGrowthProfile = async (): Promise<SpiritualGrowthProfile> => {
  const db = await getDB();
  let totalXp = 290;
  let streakDays = 4;
  let highestStreak = 7;
  let chaptersRead = 5;
  let conversations = 8;
  let sermons = 1;

  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_gamification (
          key TEXT PRIMARY KEY NOT NULL,
          value INTEGER NOT NULL
        );
      `);

      const rows = await db.getAllAsync<{ key: string; value: number }>(
        'SELECT key, value FROM user_gamification'
      );

      rows.forEach(r => {
        if (r.key === 'total_xp') totalXp = r.value;
        if (r.key === 'streak_days') streakDays = r.value;
        if (r.key === 'highest_streak') highestStreak = r.value;
        if (r.key === 'chapters_read') chaptersRead = r.value;
        if (r.key === 'conversations_count') conversations = r.value;
        if (r.key === 'sermons_count') sermons = r.value;
      });
    } catch (e) {
      console.warn('Gamification DB lookup note:', e);
    }
  }

  // Calculate Level Tier
  const tier = LEVEL_TIERS.find(t => totalXp >= t.minXp && totalXp < t.maxXp) || LEVEL_TIERS[LEVEL_TIERS.length - 1];

  return {
    streakDays,
    highestStreak,
    totalXp,
    currentLevel: tier.level,
    levelTitle: tier.title,
    currentLevelXp: totalXp - tier.minXp,
    nextLevelXp: tier.maxXp - tier.minXp,
    chaptersReadCount: chaptersRead,
    conversationsCount: conversations,
    sermonsPreparedCount: sermons,
    badges: INITIAL_BADGES
  };
};

export const awardGraceXp = async (points: number, reason: string): Promise<number> => {
  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(`
        INSERT INTO user_gamification (key, value) VALUES ('total_xp', ?)
        ON CONFLICT(key) DO UPDATE SET value = value + ?;
      `, [points, points]);
    } catch (e) {}
  }
  return points;
};
