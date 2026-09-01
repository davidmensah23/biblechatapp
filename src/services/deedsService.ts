import { getDB } from './database';
import { awardGraceXp } from './gamificationService';

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
    tierLabel: 'SEED TIER',
    tierIcon: '🕊️',
    title: 'A Word in Season to the Weary',
    subtitle: 'Speak life to someone carrying a quiet burden',
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
    tierLabel: 'SEED TIER',
    tierIcon: '🕊️',
    title: 'The Hidden Cup of Grace',
    subtitle: 'Do good in secret where only the Father sees',
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
    tierLabel: 'SEED TIER',
    tierIcon: '🕊️',
    title: 'The Bridle of Peace',
    subtitle: 'Choose gracious silence over a sharp response',
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
    tierLabel: 'BRANCH TIER',
    tierIcon: '🌿',
    title: 'Breaking Bread in Kindness',
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
    tierLabel: 'BRANCH TIER',
    tierIcon: '🌿',
    title: 'The Visit to the Forgotten',
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
    tierLabel: 'FRUIT TIER',
    tierIcon: '🌳',
    title: 'The Sower’s Open Hand',
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
    tierLabel: 'FRUIT TIER',
    tierIcon: '🌳',
    title: 'The Release of the Debt',
    subtitle: 'Forgive someone who has caused you grief',
    description: 'Make a deliberate choice in prayer to release a grudge or offense against someone, choosing to bless them in the name of Jesus.',
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
  const newLog: CompletedDeedLog = {
    id: `deed_${Date.now()}`,
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
        `INSERT INTO completed_deeds (id, deed_id, title, reflection, location_name, latitude, longitude, scripture_ref, xp_awarded, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          newLog.id,
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

  // Award Grace XP
  await awardGraceXp(deed.xpReward);
  return newLog;
};

export const fetchCompletedDeeds = async (): Promise<CompletedDeedLog[]> => {
  const db = await getDB();
  if (db) {
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM completed_deeds ORDER BY completed_at DESC;'
      );
      return rows.map(r => ({
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
    } catch (e) {
      return [];
    }
  }
  return [];
};
