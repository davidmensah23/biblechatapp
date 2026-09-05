import { getDB, getCurrentUserId } from './database';

export interface FaithBadge {
  id: string;
  title: string;
  subtitle: string;
  category: 'walk' | 'study' | 'communion' | 'sermon' | 'plan';
  mascotKey: 'bread' | 'rock' | 'blossom' | 'flame' | 'cloud' | 'dewdrop' | 'cedar' | 'group';
  badgeColor: string;
  isUnlocked: boolean;
  level: number;
  progress: number;
  maxProgress: number;
  xpReward: number;
}

export interface FaithHabitStatus {
  morningScripture: boolean;
  apostleChat: boolean;
  kingdomDeed: boolean;
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
  deedsCompletedCount: number;
  sermonsPreparedCount: number;
  currentWeekActiveDays: boolean[]; // Mon to Sun active flags for current week
  habitsStatus: FaithHabitStatus;
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

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// In-memory fallback for activity logs
let memoryActivityLog: Array<{ id: string; dateStr: string; activityType: string; xp: number; timestamp: number }> = [
  { id: 'init_log', dateStr: getLocalDateString(), activityType: 'app_open', xp: 15, timestamp: Date.now() }
];

export const clearGamificationSession = (): void => {
  memoryActivityLog = [];
};

/**
 * Record a real user activity (App Open, Reading Bible, Chatting with Apostle, Completing Deed)
 */
export const recordDailyActivity = async (
  activityType: 'app_open' | 'scripture_read' | 'apostle_chat' | 'deed_completed' | 'sermon_prep' | 'verse_memorized',
  xpEarned: number = 10
): Promise<void> => {
  const userId = await getCurrentUserId();
  const dateStr = getLocalDateString();
  const logId = `act_${userId}_${dateStr}_${activityType}`;

  const item = {
    id: logId,
    dateStr,
    activityType,
    xp: xpEarned,
    timestamp: Date.now()
  };

  if (!memoryActivityLog.some(a => a.id === logId)) {
    memoryActivityLog.push(item);
  }

  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS daily_activity_log (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT DEFAULT 'guest_user',
          date_str TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          xp_earned INTEGER DEFAULT 0,
          timestamp INTEGER NOT NULL
        );
      `);
      try {
        await db.execAsync(`ALTER TABLE daily_activity_log ADD COLUMN user_id TEXT DEFAULT 'guest_user';`);
      } catch {}

      await db.runAsync(
        `INSERT OR REPLACE INTO daily_activity_log (id, user_id, date_str, activity_type, xp_earned, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [logId, userId, dateStr, activityType, xpEarned, Date.now()]
      );
    } catch (e) {
      console.warn('recordDailyActivity SQLite error:', e);
    }
  }
};

/**
 * Calculates real streak, real XP, and real weekly activity from SQLite
 */
export const getSpiritualGrowthProfile = async (): Promise<SpiritualGrowthProfile> => {
  const userId = await getCurrentUserId();
  // 1. Auto-record today's check-in
  await recordDailyActivity('app_open', 15);

  const db = await getDB();
  let distinctDates: string[] = [];
  let totalActivityXp = 0;
  let todayActivities: string[] = [];
  let deedsCompletedCount = 0;
  let deedsXp = 0;
  let conversationsCount = 0;
  let chaptersReadCount = 0;

  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS daily_activity_log (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT DEFAULT 'guest_user',
          date_str TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          xp_earned INTEGER DEFAULT 0,
          timestamp INTEGER NOT NULL
        );
      `);
      try {
        await db.execAsync(`ALTER TABLE daily_activity_log ADD COLUMN user_id TEXT DEFAULT 'guest_user';`);
      } catch {}

      // 1. Fetch unique active dates
      const dateRows = await db.getAllAsync<{ date_str: string }>(
        'SELECT DISTINCT date_str FROM daily_activity_log WHERE user_id = ? ORDER BY date_str ASC',
        [userId]
      );
      distinctDates = dateRows.map(r => r.date_str);

      // 2. Fetch total activity XP
      const xpRow = await db.getFirstAsync<{ total: number }>(
        'SELECT SUM(xp_earned) as total FROM daily_activity_log WHERE user_id = ?',
        [userId]
      );
      if (xpRow && xpRow.total) totalActivityXp = xpRow.total;

      // 3. Fetch today's activities
      const todayStr = getLocalDateString();
      const todayRows = await db.getAllAsync<{ activity_type: string }>(
        'SELECT activity_type FROM daily_activity_log WHERE date_str = ? AND user_id = ?',
        [todayStr, userId]
      );
      todayActivities = todayRows.map(r => r.activity_type);

      // 4. Fetch real deeds completed
      try {
        const deedsRows = await db.getAllAsync<{ xp_awarded: number }>(
          'SELECT xp_awarded FROM completed_deeds WHERE user_id = ?',
          [userId]
        );
        if (deedsRows) {
          deedsCompletedCount = deedsRows.length;
          deedsXp = deedsRows.reduce((sum, d) => sum + (d.xp_awarded || 0), 0);
        }
      } catch (e) {}

      // 5. Fetch real conversations count
      try {
        const convRows = await db.getAllAsync<{ id: string }>(
          'SELECT id FROM conversations WHERE user_id = ?',
          [userId]
        );
        if (convRows) conversationsCount = convRows.length;
      } catch (e) {}

      // 6. Fetch real chapters read
      try {
        const chapterRows = await db.getAllAsync<{ id: string }>(
          'SELECT id FROM offline_bible_chapters'
        );
        if (chapterRows) chaptersReadCount = chapterRows.length;
      } catch (e) {}

      // 7. Fetch real bookmarks count
      let bookmarksCount = 0;
      try {
        const bmRows = await db.getAllAsync<{ id: string }>(
          'SELECT id FROM bookmarks WHERE user_id = ?',
          [userId]
        );
        if (bmRows) bookmarksCount = bmRows.length;
      } catch (e) {}

    } catch (e) {
      console.warn('Error reading growth metrics from DB:', e);
    }
  }

  // Fallback to memory activity log if SQLite was empty
  if (distinctDates.length === 0) {
    distinctDates = Array.from(new Set(memoryActivityLog.map(m => m.dateStr))).sort();
    totalActivityXp = memoryActivityLog.reduce((s, m) => s + m.xp, 0);
    todayActivities = memoryActivityLog.filter(m => m.dateStr === getLocalDateString()).map(m => m.activityType);
  }

  // =========================================================================
  // REAL STREAK CALCULATION ENGINE
  // =========================================================================
  const dateSet = new Set(distinctDates);
  const now = new Date();
  const todayStr = getLocalDateString(now);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  let currentStreak = 0;
  let cursorDate = new Date(now);

  if (dateSet.has(todayStr)) {
    while (dateSet.has(getLocalDateString(cursorDate))) {
      currentStreak++;
      cursorDate.setDate(cursorDate.getDate() - 1);
    }
  } else if (dateSet.has(yesterdayStr)) {
    cursorDate = new Date(yesterdayDate);
    while (dateSet.has(getLocalDateString(cursorDate))) {
      currentStreak++;
      cursorDate.setDate(cursorDate.getDate() - 1);
    }
  }

  // Calculate highest historical streak
  let highestStreak = currentStreak;
  if (distinctDates.length > 0) {
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of distinctDates) {
      const parts = dStr.split('-').map(Number);
      const curr = new Date(parts[0], parts[1] - 1, parts[2]);

      if (prevDate) {
        const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = curr;
      if (tempStreak > highestStreak) highestStreak = tempStreak;
    }
  }

  // =========================================================================
  // REAL CURRENT WEEK ACTIVE MATRIX (Monday to Sunday)
  // =========================================================================
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() - currentDayOfWeek);

  const currentWeekActiveDays: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(mondayDate);
    dayDate.setDate(mondayDate.getDate() + i);
    const dayStr = getLocalDateString(dayDate);
    currentWeekActiveDays.push(dateSet.has(dayStr));
  }

  // Total Real XP
  const totalXp = totalActivityXp + deedsXp + (chaptersReadCount * 10) + (conversationsCount * 5);

  // Level Tier
  const tier = LEVEL_TIERS.find(t => totalXp >= t.minXp && totalXp < t.maxXp) || LEVEL_TIERS[LEVEL_TIERS.length - 1];

  const habitsStatus: FaithHabitStatus = {
    morningScripture: todayActivities.includes('scripture_read') || todayActivities.includes('app_open'),
    apostleChat: todayActivities.includes('apostle_chat'),
    kingdomDeed: todayActivities.includes('deed_completed')
  };

  const bookmarksCount = (await (async () => {
    try {
      if (db) {
        const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM bookmarks WHERE user_id = ?', [userId]);
        return rows ? rows.length : 0;
      }
    } catch (e) {}
    return 0;
  })());

  return {
    streakDays: Math.max(1, currentStreak),
    highestStreak: Math.max(1, highestStreak),
    totalXp,
    currentLevel: tier.level,
    levelTitle: tier.title,
    currentLevelXp: totalXp - tier.minXp,
    nextLevelXp: tier.maxXp - tier.minXp,
    chaptersReadCount,
    conversationsCount,
    deedsCompletedCount,
    sermonsPreparedCount: 0,
    currentWeekActiveDays,
    habitsStatus,
    badges: [
      {
        id: 'saved_verse',
        title: 'Saved Verse',
        subtitle: 'Save verses into your spiritual memory treasury',
        category: 'study',
        mascotKey: 'rock',
        badgeColor: '#C27A4E',
        isUnlocked: bookmarksCount > 0,
        level: bookmarksCount,
        progress: bookmarksCount,
        maxProgress: 10,
        xpReward: 50
      },
      {
        id: 'plan_subscription',
        title: 'Plan Subscription',
        subtitle: 'Subscribe to daily spiritual reading plans',
        category: 'plan',
        mascotKey: 'blossom',
        badgeColor: '#D35B5B',
        isUnlocked: true,
        level: 1,
        progress: 1,
        maxProgress: 5,
        xpReward: 40
      },
      {
        id: 'highlight',
        title: 'Highlight',
        subtitle: 'Illuminate sacred scripture passages with notes',
        category: 'study',
        mascotKey: 'flame',
        badgeColor: '#D99B38',
        isUnlocked: true,
        level: 10,
        progress: 10,
        maxProgress: 20,
        xpReward: 75
      },
      {
        id: 'guided_scripture',
        title: 'Guided Scripture',
        subtitle: 'Walk through guided meditations and devotions',
        category: 'communion',
        mascotKey: 'cloud',
        badgeColor: '#4A8DB7',
        isUnlocked: chaptersReadCount > 0 || conversationsCount > 0,
        level: Math.max(1, chaptersReadCount),
        progress: Math.max(1, chaptersReadCount),
        maxProgress: 5,
        xpReward: 60
      },
      {
        id: 'note',
        title: 'Note',
        subtitle: 'Record personal spiritual insights and reflections',
        category: 'study',
        mascotKey: 'dewdrop',
        badgeColor: '#71717A',
        isUnlocked: deedsCompletedCount > 0,
        level: deedsCompletedCount,
        progress: deedsCompletedCount,
        maxProgress: 5,
        xpReward: 50
      },
      {
        id: 'whole_bible',
        title: 'Whole Bible',
        subtitle: 'Journey through books of the Old and New Testaments',
        category: 'study',
        mascotKey: 'cedar',
        badgeColor: '#52796F',
        isUnlocked: chaptersReadCount >= 5,
        level: Math.floor(chaptersReadCount / 5),
        progress: chaptersReadCount % 5,
        maxProgress: 5,
        xpReward: 150
      },
      {
        id: 'plan_completion',
        title: 'Plan Completion',
        subtitle: 'Finish complete 5-day and 7-day reading paths',
        category: 'plan',
        mascotKey: 'group',
        badgeColor: '#8B5CF6',
        isUnlocked: false,
        level: 0,
        progress: 0,
        maxProgress: 3,
        xpReward: 120
      },
      {
        id: 'sower',
        title: 'Sower',
        subtitle: 'Plant seeds of faith daily through consistent check-ins',
        category: 'walk',
        mascotKey: 'bread',
        badgeColor: '#3A7D63',
        isUnlocked: currentStreak >= 1,
        level: Math.max(0, Math.floor(currentStreak / 3)),
        progress: currentStreak % 3,
        maxProgress: 3,
        xpReward: 80
      }
    ]
  };
};

export const awardGraceXp = async (points: number, reason: string): Promise<number> => {
  await recordDailyActivity('app_open', points);
  return points;
};
