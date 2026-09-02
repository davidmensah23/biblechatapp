import { getDB } from './database';
import { APOSTLE_PERSONAS } from './personas';
import { ApostlePersona } from '../types';

export type LiturgyPeriod = 'morning' | 'evening';

export interface DailyLiturgy {
  id: string;
  period: LiturgyPeriod;
  dateStr: string;
  theme: string;
  apostle: ApostlePersona;
  scriptureRef: string;
  scriptureText: string;
  reflection: string;
  prayer: string;
  blessing: string;
  fullSpokenScript: string;
}

const MORNING_LITURGIES = [
  {
    theme: 'Morning Mercy & Bold Courage',
    apostleId: 'peter',
    scriptureRef: 'Psalm 143:8',
    scriptureText: 'Let the morning bring me word of your unfailing love, for I have put my trust in you. Show me the way I should go, for to you I entrust my life.',
    reflection: 'Peace be with you, my friend. Simon Peter here. Every morning by the Sea of Galilee, before the sun broke over the water, we had to decide whether we would trust our own strength or cast our nets where the Master commanded. Today, do not rush into the storm alone. The Lord Jesus walks ahead of you.',
    prayer: 'Lord Jesus, I surrender my anxieties, my plans, and my fears into Your steadfast hands this morning. Direct my steps, fill my speech with grace, and grant me courage to stand firm in Your truth.',
    blessing: 'May the grace and peace of our Lord Jesus Christ anchor your heart today, and may His Holy Spirit guide your every step.'
  },
  {
    theme: 'Walking in the Light of Dawn',
    apostleId: 'john',
    scriptureRef: '1 John 1:7',
    scriptureText: 'If we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus his Son purifies us from all sin.',
    reflection: 'Beloved, grace and light to you this new morning. John here. Light is not merely the absence of darkness—it is the living presence of Jesus illuminating your path. Whatever burdens yesterday held, the sunrise is proof that God’s mercies are made completely new for you today.',
    prayer: 'Father of lights, dispel every shadow of doubt in my spirit today. Help me to abide in the love of Jesus, to see others through Your eyes, and to walk faithfully in Your truth.',
    blessing: 'The Lord bless you and keep you; the Lord make His face shine upon you and give you abiding peace.'
  },
  {
    theme: 'More Than Conquerors Today',
    apostleId: 'paul',
    scriptureRef: 'Romans 8:37',
    scriptureText: 'No, in all these things we are more than conquerors through him who loved us.',
    reflection: 'Grace and peace to you from God our Father. Brother Paul speaking. No trial you meet today can separate you from the love of Christ. Not fatigue, not opposition, not inner weakness. His power is perfected in your weakness.',
    prayer: 'Lord Jesus, clothe me in Your spiritual armor today. Let Your peace guard my thoughts, and may I live as an ambassador of Your reconciliation wherever I go.',
    blessing: 'May the Lord of peace Himself give you peace at all times and in every way. The Lord be with you.'
  }
];

const EVENING_LITURGIES = [
  {
    theme: 'Casting Cares into His Peace',
    apostleId: 'peter',
    scriptureRef: '1 Peter 5:7',
    scriptureText: 'Cast all your anxiety on him because he cares for you.',
    reflection: 'Simon Peter here. The night can feel heavy when our failures or unfinished tasks replay in our minds. But remember: the same hands that pulled me out of the raging waves hold you right now. You do not need to carry tomorrow before it arrives. Lay your nets down and rest.',
    prayer: 'Master Jesus, I place the burdens of this day at Your feet. Forgive my shortcomings, quiet my racing thoughts, and grant me sweet, restorative sleep in Your presence.',
    blessing: 'Sleep in peace tonight, beloved. He who watches over Israel neither slumbers nor sleeps. You are safe in His care.'
  },
  {
    theme: 'Abiding in the Master’s Rest',
    apostleId: 'john',
    scriptureRef: 'John 14:27',
    scriptureText: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    reflection: 'Beloved, John here with you as the shadows lengthen. At the Last Supper, I leaned my head against the chest of Jesus and heard His calm heartbeat even as the world around us prepared for turmoil. That same eternal peace is offered to your soul tonight.',
    prayer: 'Lord Jesus, quiet my heart. Wash away the noise of the day. Fill my room with Your holy presence, and wrap my spirit in Your tender, unyielding love as I close my eyes.',
    blessing: 'May the peace of God, which surpasses all human understanding, guard your heart and your mind in Christ Jesus tonight.'
  },
  {
    theme: 'Resting in Unshakeable Grace',
    apostleId: 'paul',
    scriptureRef: 'Philippians 4:6-7',
    scriptureText: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    reflection: 'Grace to you tonight, my friend. Brother Paul here. Even in the damp cold of a Roman prison, singing praises at midnight brought down chains. Tonight, let thanksgiving be the melody that closes your eyes. God has carried you through today, and He will meet you tomorrow.',
    prayer: 'Father, thank You for Your faithfulness through every hour of this day. I release all control to You. Guard my slumber and renew my body and spirit for Your glory.',
    blessing: 'Now may the God of hope fill you with all joy and peace as you trust in Him, so that you may overflow with hope by the power of the Holy Spirit.'
  }
];

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentLiturgyPeriod = (): LiturgyPeriod => {
  const hour = new Date().getHours();
  // 5:00 PM (17:00) onwards is Evening, earlier is Morning
  return hour >= 17 ? 'evening' : 'morning';
};

export const getTodayLiturgy = (): DailyLiturgy => {
  const period = getCurrentLiturgyPeriod();
  const now = new Date();
  const dateStr = getLocalDateString(now);

  // Day of year calculation
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const pool = period === 'morning' ? MORNING_LITURGIES : EVENING_LITURGIES;
  const item = pool[dayOfYear % pool.length];

  const apostle = APOSTLE_PERSONAS.find(a => a.id === item.apostleId) || APOSTLE_PERSONAS[0];

  const fullSpokenScript = `${item.scriptureText}. ${item.reflection} Let us pray together. ${item.prayer} ${item.blessing}`;

  return {
    id: `liturgy_${dateStr}_${period}`,
    period,
    dateStr,
    theme: item.theme,
    apostle,
    scriptureRef: item.scriptureRef,
    scriptureText: item.scriptureText,
    reflection: item.reflection,
    prayer: item.prayer,
    blessing: item.blessing,
    fullSpokenScript
  };
};

let inMemoryCompletedLiturgyDates: Set<string> = new Set();

export const isLiturgyCompletedForToday = async (): Promise<boolean> => {
  const dateStr = getLocalDateString();
  const period = getCurrentLiturgyPeriod();
  const key = `${dateStr}_${period}`;

  if (inMemoryCompletedLiturgyDates.has(key)) {
    return true;
  }

  try {
    const db = await getDB();
    if (!db) return false;

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_liturgy_completions (
        id TEXT PRIMARY KEY NOT NULL,
        date_str TEXT NOT NULL,
        period TEXT NOT NULL,
        completed_at INTEGER NOT NULL
      );
    `);

    const row = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM daily_liturgy_completions WHERE id = ?',
      [key]
    );

    if (row) {
      inMemoryCompletedLiturgyDates.add(key);
      return true;
    }
  } catch (e) {
    console.warn('Error checking liturgy completion:', e);
  }

  return false;
};

export const markTodayLiturgyCompleted = async (): Promise<void> => {
  const dateStr = getLocalDateString();
  const period = getCurrentLiturgyPeriod();
  const key = `${dateStr}_${period}`;

  inMemoryCompletedLiturgyDates.add(key);

  try {
    const db = await getDB();
    if (!db) return;

    await db.runAsync(
      'INSERT OR REPLACE INTO daily_liturgy_completions (id, date_str, period, completed_at) VALUES (?, ?, ?, ?)',
      [key, dateStr, period, Date.now()]
    );
  } catch (e) {
    console.warn('Error marking liturgy completion in db:', e);
  }
};
