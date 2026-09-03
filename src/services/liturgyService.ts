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

// Simple, clear morning prayers rotating through ALL characters
const MORNING_PRAYERS = [
  {
    theme: "Start Your Day with Peace",
    apostleId: "peter",
    scriptureRef: "Psalm 143:8",
    scriptureText: "Let the morning bring me word of your unfailing love, for I have put my trust in you. Show me the way I should go, for to you I entrust my life.",
    reflection: "Peace be with you, my friend. Simon Peter here. Every morning by the Sea of Galilee, before the sun came up, we had to decide whether we would trust our own strength or trust the Master. Today, do not rush into the day alone. Jesus walks with you.",
    prayer: "Lord Jesus, I give You my worries, my plans, and my fears this morning. Guide my steps, give me kind words, and give me courage to do what is right.",
    blessing: "May God give you peace today, and may His Holy Spirit guide every step you take."
  },
  {
    theme: "Walk in God's Light",
    apostleId: "john",
    scriptureRef: "1 John 1:7",
    scriptureText: "If we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus his Son purifies us from all sin.",
    reflection: "Grace and light to you this morning. John here. Light means you are never walking alone in the dark. Whatever went wrong yesterday, the sunrise is God's reminder that His love for you starts fresh today.",
    prayer: "Father, clear away any doubt in my heart today. Help me stay close to Jesus, treat others with love, and walk in Your truth.",
    blessing: "May the Lord bless you, keep you safe, and fill your heart with calm peace."
  },
  {
    theme: "Be Strong in Jesus Today",
    apostleId: "paul",
    scriptureRef: "Romans 8:37",
    scriptureText: "No, in all these things we are more than conquerors through him who loved us.",
    reflection: "Peace to you from God our Father. Brother Paul speaking. Whatever challenges you face today, nothing can separate you from the love of Jesus. When you feel tired or weak, His power will carry you through.",
    prayer: "Lord Jesus, help me today. Give me patience, guard my thoughts, and help me share Your peace wherever I go.",
    blessing: "May the Lord of peace give you peace at all times and in every way."
  },
  {
    theme: "Follow Jesus with an Open Heart",
    apostleId: "matthew",
    scriptureRef: "Matthew 6:33",
    scriptureText: "Seek first the kingdom of God and his righteousness, and all these things will be given to you as well.",
    reflection: "Hello, my friend. Matthew here. When Jesus walked into my tax booth, He looked at me with grace, not condemnation. He gave me a fresh start. Whatever your past, today is an open door to walk with Him.",
    prayer: "Lord Jesus, help me seek You first today before money, before work, and before worries. I trust You to take care of everything I need.",
    blessing: "May the grace of our Lord Jesus Christ be with your spirit today."
  },
  {
    theme: "Bring Your Questions to God",
    apostleId: "thomas",
    scriptureRef: "Jeremiah 29:13",
    scriptureText: "You will seek me and find me when you seek me with all your heart.",
    reflection: "Thomas here with you. Never be afraid to be honest with God about what you do not understand. Jesus never turned me away when I had questions; He reached out His hands. Bring your honest heart to Him today.",
    prayer: "Lord, You know my thoughts and my questions. Increase my faith today, and let me feel Your calm presence beside me.",
    blessing: "May the Lord reveal His living truth to you and give you unwavering faith."
  },
  {
    theme: "Share Kindness with Someone Today",
    apostleId: "andrew",
    scriptureRef: "John 1:41",
    scriptureText: "The first thing Andrew did was to find his brother Simon and tell him, 'We have found the Messiah.'",
    reflection: "Andrew here. Faith grows when we share it simply. Even bringing one person to Jesus or offering a cup of water in His name matters in heaven. Keep your eyes open today for who you can encourage.",
    prayer: "Lord Jesus, make me a helper today. Show me who needs a kind word, a helping hand, or a prayer.",
    blessing: "May God use your hands and words to bring joy and hope to others today."
  }
];

// Simple, clear evening prayers rotating through ALL characters
const EVENING_PRAYERS = [
  {
    theme: "Let Go of Your Worries Tonight",
    apostleId: "peter",
    scriptureRef: "1 Peter 5:7",
    scriptureText: "Cast all your anxiety on him because he cares for you.",
    reflection: "Simon Peter here. The night can feel heavy when our mistakes or unfinished work replay in our heads. But remember: the same hands that caught me in the stormy sea are holding you right now. Put down your burdens and rest.",
    prayer: "Jesus, I leave everything that happened today in Your hands. Forgive my mistakes, calm my racing mind, and give me peaceful, deep sleep.",
    blessing: "Sleep in peace tonight. God never sleeps, and you are safe in His care."
  },
  {
    theme: "Rest in God's Peace Tonight",
    apostleId: "john",
    scriptureRef: "John 14:27",
    scriptureText: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    reflection: "Beloved, John here. At the Last Supper, I leaned close to Jesus and felt His calm presence even before hard times came. That same peace is with you in your room tonight. Let all fear go.",
    prayer: "Lord Jesus, quiet my heart. Wash away the noise of the day. Fill my home with Your peace, and let me wake up refreshed tomorrow.",
    blessing: "May the peace of God guard your heart and mind tonight as you sleep."
  },
  {
    theme: "Give Thanks for Today",
    apostleId: "paul",
    scriptureRef: "Philippians 4:6-7",
    scriptureText: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    reflection: "Peace to you tonight. Brother Paul here. Even in prison, singing praises gave me peace. Tonight, let thankfulness close your eyes. God helped you through today, and He will take care of tomorrow.",
    prayer: "Father, thank You for watching over me today. I give You all control. Protect my sleep and renew my energy for tomorrow.",
    blessing: "May the God of hope fill you with peace and joy tonight."
  },
  {
    theme: "Calm Your Mind Before Sleep",
    apostleId: "james",
    scriptureRef: "James 1:17",
    scriptureText: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights.",
    reflection: "James here with you. When the day is done, do not let worldly worries rob you of rest. Look back on the good things God gave you today, small and large, and rest in His steady hands.",
    prayer: "Lord, thank You for the breath in my lungs and the roof over my head. Grant me a quiet night and peaceful rest.",
    blessing: "May the Lord keep you safe under His wings tonight."
  },
  {
    theme: "God Watched Over You Today",
    apostleId: "matthew",
    scriptureRef: "Psalm 121:7-8",
    scriptureText: "The LORD will keep you from all harm—he will watch over your life; the LORD will watch over your coming and going both now and forevermore.",
    reflection: "Matthew here. God saw every step you took today. When you laid down your work, His protection remained over you. Sleep without fear tonight.",
    prayer: "Lord, I rest in Your promise that You watch over me day and night. Give me good rest and a renewed heart.",
    blessing: "The Lord keep you safe and grant you restorative sleep."
  }
];

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 4:00 AM to 11:59 AM is Morning Prayer
 * 12:00 PM (noon) onwards is Evening Prayer
 */
export const getCurrentLiturgyPeriod = (): LiturgyPeriod => {
  const hour = new Date().getHours();
  return (hour >= 4 && hour < 12) ? 'morning' : 'evening';
};

export const getTodayLiturgy = (): DailyLiturgy => {
  const period = getCurrentLiturgyPeriod();
  const now = new Date();
  const dateStr = getLocalDateString(now);

  // Day of year calculation for rotating through all Apostles
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const list = period === 'morning' ? MORNING_PRAYERS : EVENING_PRAYERS;
  const template = list[dayOfYear % list.length];

  const apostle = APOSTLE_PERSONAS.find(a => a.id === template.apostleId) || APOSTLE_PERSONAS[0];

  const fullSpokenScript = `${template.reflection} Now, let us bring our hearts together in prayer. ${template.prayer} And hear this blessing over your walk: ${template.blessing}`;

  return {
    id: `prayer_${dateStr}_${period}`,
    period,
    dateStr,
    theme: template.theme,
    apostle,
    scriptureRef: template.scriptureRef,
    scriptureText: template.scriptureText,
    reflection: template.reflection,
    prayer: template.prayer,
    blessing: template.blessing,
    fullSpokenScript
  };
};

export const isLiturgyCompletedForToday = async (): Promise<boolean> => {
  const db = await getDB();
  if (!db) return false;

  const today = getLocalDateString();
  const period = getCurrentLiturgyPeriod();

  try {
    const result = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM liturgy_completions WHERE date_str = ? AND period = ? LIMIT 1;',
      [today, period]
    );
    return Boolean(result);
  } catch (err) {
    console.warn('Error checking prayer completion:', err);
    return false;
  }
};

export const markLiturgyCompleted = async (liturgyId: string): Promise<void> => {
  const db = await getDB();
  if (!db) return;

  const today = getLocalDateString();
  const period = getCurrentLiturgyPeriod();

  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO liturgy_completions (id, liturgy_id, date_str, period, completed_at)
       VALUES (?, ?, ?, ?, ?);`,
      [`${today}_${period}`, liturgyId, today, period, Date.now()]
    );
  } catch (err) {
    console.warn('Error saving prayer completion:', err);
  }
};
