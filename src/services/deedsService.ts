import { getDB, getCurrentUserId } from './database';
import { awardGraceXp, recordDailyActivity } from './gamificationService';

export type DeedTier = 'seed' | 'branch' | 'fruit';

export interface KingdomDeed {
  id: string;
  tier: DeedTier;
  tierLabel: string;
  tierIcon: string;
  title: string;
  subtitle: string;
  description: string;
  checkpoints: string[];
  scriptureRef: string;
  scriptureVerse: string;
  blessingText: string;
  xpReward: number;
}

export interface CompletedDeedLog {
  id: string;
  deedId: string;
  title: string;
  reflection: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  scriptureRef: string;
  xpAwarded: number;
  completedAt: number;
}

export const DEED_CATALOG: KingdomDeed[] = [
  // 1. SEED TIER (Gentle Daily Compassion)
  {
    id: 'seed_encouragement_01',
    tier: 'seed',
    tierLabel: 'DAILY KINDNESS',
    tierIcon: '🕊️',
    title: 'Encourage a Friend Today',
    subtitle: 'Send a kind message to someone on your mind',
    description: 'Reach out with a heartfelt message of sincere prayer, gratitude, or encouragement to an old friend or family member who has been on your mind.',
    checkpoints: [
      'Pause and pray for discernment',
      'Send a genuine, unsolicited message of blessing',
      'Seal your reflection in faith'
    ],
    scriptureRef: '1 Thessalonians 5:11',
    scriptureVerse: '“Therefore encourage one another and build each other up, just as in fact you are doing.”',
    blessingText: 'May your words become living streams of water to their thirsty soul.',
    xpReward: 50
  },
  {
    id: 'seed_secret_generosity_02',
    tier: 'seed',
    tierLabel: 'DAILY KINDNESS',
    tierIcon: '🕊️',
    title: 'Do a Quiet Act of Kindness',
    subtitle: 'Help someone quietly without asking for thanks',
    description: 'Quietly cover a small cost for someone (pay for a coffee, leave a generous tip, or bless someone anonymously) without seeking recognition.',
    checkpoints: [
      'Find an opportunity for quiet kindness',
      'Give without letting your left hand know what your right hand does',
      'Thank God for the abundance to share'
    ],
    scriptureRef: 'Matthew 6:3-4',
    scriptureVerse: '“But when you give to the needy, do not let your left hand know what your right hand is doing, so that your giving may be in secret.”',
    blessingText: 'Your Father, who sees what is done in secret, rewards your faithful heart.',
    xpReward: 50
  },
  {
    id: 'seed_patience_tongue_03',
    tier: 'seed',
    tierLabel: 'DAILY KINDNESS',
    tierIcon: '🕊️',
    title: 'Choose Patience When Angry',
    subtitle: 'Take a deep breath and speak with kindness',
    description: 'In a moment of tension or irritation today, choose patience and answer with gentle grace instead of defensiveness.',
    checkpoints: [
      'Take three slow breaths before speaking',
      'Answer with gentleness that turns away wrath',
      'Hold peace in your spirit'
    ],
    scriptureRef: 'Proverbs 15:1',
    scriptureVerse: '“A gentle answer turns away wrath, but a harsh word stirs up anger.”',
    blessingText: 'You have brought the calm presence of Christ into a restless world.',
    xpReward: 50
  },

  // 2. BRANCH TIER (Intentional Relational Love)
  {
    id: 'branch_table_fellowship_01',
    tier: 'branch',
    tierLabel: 'LOVE IN ACTION',
    tierIcon: '🌿',
    title: 'Share a Meal with Someone',
    subtitle: 'Share physical sustenance with someone in need',
    description: 'Share or buy a warm meal for a person on the street, an overburdened worker, or a neighbor going through a trial.',
    checkpoints: [
      'Prepare or purchase a hearty meal',
      'Look them in the eye with honor and warmth',
      'Speak a gentle blessing over their day'
    ],
    scriptureRef: 'Hebrews 13:16',
    scriptureVerse: '“And do not forget to do good and to share with others, for with such sacrifices God is pleased.”',
    blessingText: 'In feeding another, you have welcomed the Master to your table.',
    xpReward: 65
  },
  {
    id: 'branch_visit_lonely_02',
    tier: 'branch',
    tierLabel: 'LOVE IN ACTION',
    tierIcon: '🌿',
    title: 'Call Someone Who Is Alone',
    subtitle: 'Reach into the quiet corners of loneliness',
    description: 'Call or visit an elderly person, an isolated neighbor, or a sick friend and spend unhurried time listening to their heart.',
    checkpoints: [
      'Set aside 15 uninterrupted minutes',
      'Listen deeply without rushing the conversation',
      'Offer a heartfelt prayer before parting'
    ],
    scriptureRef: 'James 1:27',
    scriptureVerse: '“Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows in their distress.”',
    blessingText: 'Your presence was a reminder of God’s abiding remembrance.',
    xpReward: 65
  },

  // 3. FRUIT TIER (Bold Kingdom Faith)
  {
    id: 'fruit_share_gospel_01',
    tier: 'fruit',
    tierLabel: 'STEP OF FAITH',
    tierIcon: '🌳',
    title: 'Share a Bible Verse Today',
    subtitle: 'Share a verse of hope and your faith journey',
    description: 'Have an authentic spiritual conversation with a friend or seeker, sharing what Christ has done in your life and a comforting Bible verse.',
    checkpoints: [
      'Ask the Holy Spirit for open ears and courage',
      'Share a real story of God’s grace in your life',
      'Leave them with a verse of eternal hope'
    ],
    scriptureRef: 'Mark 16:15',
    scriptureVerse: '“Go into all the world and preach the gospel to all creation.”',
    blessingText: 'Blessed are your feet that carry the good news of peace!',
    xpReward: 80
  },
  {
    id: 'fruit_forgiveness_02',
    tier: 'fruit',
    tierLabel: 'STEP OF FAITH',
    tierIcon: '🌳',
    title: 'Forgive Someone Today',
    subtitle: 'Let go of anger and choose peace',
    description: 'Think of someone who hurt you or made you angry. Choose in your heart to forgive them today and ask God to give you peace.',
    checkpoints: [
      'Name the grievance before God in prayer',
      'Declare forgiveness out loud by faith',
      'Pray for God’s blessing upon their life'
    ],
    scriptureRef: 'Colossians 3:13',
    scriptureVerse: '“Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.”',
    blessingText: 'You walk in the triumphant liberty of Christ’s boundless mercy.',
    xpReward: 80
  }
];

// Deterministic Daily Deed Picker based on User ID + Date String
export const getTodayDeedForUser = (userId: string = 'default_user'): KingdomDeed => {
  const today = new Date().toISOString().split('T')[0];
  let hash = 0;
  const seedStr = `${userId}_${today}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEED_CATALOG.length;
  return DEED_CATALOG[index];
};

export const initDeedsDatabase = async () => {
  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS completed_deeds (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT DEFAULT 'guest_user',
          deed_id TEXT NOT NULL,
          title TEXT NOT NULL,
          reflection TEXT,
          location_name TEXT,
          latitude REAL,
          longitude REAL,
          scripture_ref TEXT,
          xp_awarded INTEGER NOT NULL,
          completed_at INTEGER NOT NULL
        );
      `);
      // Safe migration for user_id column
      try {
        await db.execAsync(`ALTER TABLE completed_deeds ADD COLUMN user_id TEXT DEFAULT 'guest_user';`);
      } catch {}
    } catch (e) {
      console.warn('Deeds table init error:', e);
    }
  }
};

export const logCompletedDeed = async (
  deed: KingdomDeed,
  reflection: string,
  locationName: string = 'Local Community',
  coords?: { latitude: number; longitude: number }
): Promise<CompletedDeedLog> => {
  const userId = await getCurrentUserId();
  const newLog: CompletedDeedLog = {
    id: `deed_${userId}_${Date.now()}`,
    deedId: deed.id,
    title: deed.title,
    reflection: reflection.trim() || 'Completed with a glad and willing heart in Christ.',
    locationName: locationName.trim() || 'Faith Walk',
    latitude: coords?.latitude || 5.6037,
    longitude: coords?.longitude || -0.1870,
    scriptureRef: deed.scriptureRef,
    xpAwarded: deed.xpReward,
    completedAt: Date.now()
  };

  const db = await getDB();
  if (db) {
    try {
      await db.runAsync(
        `INSERT INTO completed_deeds (id, user_id, deed_id, title, reflection, location_name, latitude, longitude, scripture_ref, xp_awarded, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newLog.id,
          userId,
          newLog.deedId,
          newLog.title,
          newLog.reflection,
          newLog.locationName,
          newLog.latitude || null,
          newLog.longitude || null,
          newLog.scriptureRef,
          newLog.xpAwarded,
          newLog.completedAt
        ]
      );
    } catch (e) {
      console.warn('Error saving deed log:', e);
    }
  }

  // In-memory cache
  memoryCompletedDeeds.unshift(newLog);

  // Award Grace XP & Log Daily Streak Activity
  await awardGraceXp(deed.xpReward, deed.title);
  await recordDailyActivity('deed_completed', deed.xpReward);
  return newLog;
};

let memoryCompletedDeeds: CompletedDeedLog[] = [];

export const clearDeedsSession = (): void => {
  memoryCompletedDeeds = [];
};

export const fetchCompletedDeeds = async (): Promise<CompletedDeedLog[]> => {
  const userId = await getCurrentUserId();
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM completed_deeds WHERE user_id = ? ORDER BY completed_at DESC;',
        [userId]
      );
      if (rows && rows.length > 0) {
        const list = rows.map(r => ({
          id: r.id,
          deedId: r.deed_id,
          title: r.title,
          reflection: r.reflection,
          locationName: r.location_name,
          latitude: r.latitude,
          longitude: r.longitude,
          scriptureRef: r.scripture_ref,
          xpAwarded: r.xp_awarded,
          completedAt: r.completed_at
        }));
        memoryCompletedDeeds = list;
        return list;
      }
    } catch (e) {
      console.warn('fetchCompletedDeeds error:', e);
    }
  }
  return memoryCompletedDeeds.filter(d => d.id.startsWith(`deed_${userId}_`));
};

export const isTodayDeedCompleted = async (deedId?: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const startMs = todayStart.getTime();

  // Check in-memory first
  const memoryHit = memoryCompletedDeeds.some(
    d => d.completedAt >= startMs && (!deedId || d.deedId === deedId) && d.id.startsWith(`deed_${userId}_`)
  );
  if (memoryHit) return true;

  const db = await getDB();
  if (db) {
    try {
      let query = 'SELECT id FROM completed_deeds WHERE completed_at >= ? AND user_id = ?';
      const params: any[] = [startMs, userId];
      if (deedId) {
        query += ' AND deed_id = ?';
        params.push(deedId);
      }
      query += ' LIMIT 1;';
      const rows = await db.getAllAsync<any>(query, params);
      return Boolean(rows && rows.length > 0);
    } catch (e) {
      console.warn('isTodayDeedCompleted query error:', e);
      return false;
    }
  }
  return false;
};

export const getTodayCompletedDeed = async (): Promise<CompletedDeedLog | null> => {
  const userId = await getCurrentUserId();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const startMs = todayStart.getTime();

  const memoryHit = memoryCompletedDeeds.find(
    d => d.completedAt >= startMs && d.id.startsWith(`deed_${userId}_`)
  );
  if (memoryHit) return memoryHit;

  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM completed_deeds WHERE completed_at >= ? AND user_id = ? ORDER BY completed_at DESC LIMIT 1;',
        [startMs, userId]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          deedId: r.deed_id,
          title: r.title,
          reflection: r.reflection,
          locationName: r.location_name,
          latitude: r.latitude,
          longitude: r.longitude,
          scriptureRef: r.scripture_ref,
          xpAwarded: r.xp_awarded,
          completedAt: r.completed_at
        };
      }
    } catch (e) {
      console.warn('getTodayCompletedDeed error:', e);
    }
  }
  return null;
};
