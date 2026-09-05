import { getDB } from './database';
import { APOSTLE_PERSONAS } from './personas';
import { ApostlePersona } from '../types';

export type LiturgyPeriod = 'morning' | 'midday' | 'evening';

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
  personalGreeting?: string;
  fullSpokenScript: string;
}

// 1. Morning Prayers (4:00 AM - 11:59 AM)
const MORNING_PRAYERS = [
  {
    theme: "Start Your Day with Peace",
    apostleId: "peter",
    scriptureRef: "Psalm 143:8",
    scriptureText: "Let the morning bring me word of your unfailing love, for I have put my trust in you. Show me the way I should go, for to you I entrust my life.",
    reflection: "Peace be with you, my friend. Simon Peter here. Every morning by the Sea of Galilee, before the sun broke over the water, we had to decide whether we would trust our own strength or trust the Master. Today, do not rush into the day alone. Jesus walks with you.",
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
  }
];

// 2. Midday Pause Prayers (12:00 PM - 4:59 PM)
const MIDDAY_PRAYERS = [
  {
    theme: "A 60-Second Breather with Jesus",
    apostleId: "peter",
    scriptureRef: "Psalm 46:10",
    scriptureText: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
    reflection: "Peter here. In the middle of hauling heavy nets at noon, the heat was intense and tempers ran short. In the middle of your workday, pause for just one minute. Take a deep breath. God is in control of your afternoon.",
    prayer: "Lord Jesus, I pause right now in the middle of my busy day. Calms my rushing thoughts, refresh my energy, and help me treat everyone I speak to with kindness.",
    blessing: "May the peace of Christ guard your heart through the rest of this afternoon."
  },
  {
    theme: "Peace in the Middle of Your Day",
    apostleId: "john",
    scriptureRef: "Isaiah 26:3",
    scriptureText: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.",
    reflection: "John here. The day can get noisy with demands, messages, and deadlines. But inside your spirit, Jesus offers a quiet sanctuary. Drop your shoulders, breathe in His grace, and remember you are loved.",
    prayer: "Father, thank You for carrying me through this morning. As I step into this afternoon, let Your joy be my strength.",
    blessing: "The Lord brighten your path and give you renewed focus and grace today."
  },
  {
    theme: "Strength for Your Afternoon",
    apostleId: "paul",
    scriptureRef: "Philippians 4:13",
    scriptureText: "I can do all this through him who gives me strength.",
    reflection: "Paul here. Fatigue often sets in halfway through our labors. Do not lean only on your own stamina. The same Spirit that raised Christ from the dead lives in you. You have divine help for the rest of today.",
    prayer: "Lord, renew my strength where I feel tired. Keep my eyes focused on what truly matters, and let my work honor You.",
    blessing: "May God's grace empower you through every conversation and task this afternoon."
  }
];

// 3. Evening Prayers (5:00 PM - 3:59 AM)
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
 * 4:00 AM - 11:59 AM: Morning Prayer
 * 12:00 PM - 4:59 PM: Midday Pause
 * 5:00 PM - 3:59 AM: Evening Prayer
 */
export const getCurrentLiturgyPeriod = (): LiturgyPeriod => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'midday';
  return 'evening';
};

export const getTodayLiturgy = (userName?: string): DailyLiturgy => {
  const period = getCurrentLiturgyPeriod();
  const now = new Date();
  const dateStr = getLocalDateString(now);

  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  let list = MORNING_PRAYERS;
  if (period === 'midday') list = MIDDAY_PRAYERS;
  if (period === 'evening') list = EVENING_PRAYERS;

  const template = list[dayOfYear % list.length];
  const apostle = APOSTLE_PERSONAS.find(a => a.id === template.apostleId) || APOSTLE_PERSONAS[0];

  const targetName = userName?.trim() ? userName.trim().split(' ')[0] : '';

  let greeting = '';
  if (period === 'morning') {
    greeting = targetName
      ? `Good morning, ${targetName}. It is me, ${apostle.name}. As you start this day, I invite you to pause and listen to God's Word with me.`
      : `Good morning, my friend. It is me, ${apostle.name}. As you start this day, let us pause and hear God's Word together.`;
  } else if (period === 'midday') {
    greeting = targetName
      ? `Hello ${targetName}, it is me, ${apostle.name}. As you pause in the middle of your afternoon, let us center your heart on Christ.`
      : `Peace to you. It is me, ${apostle.name}. In the middle of this afternoon, let us pause and center our hearts on Christ.`;
  } else {
    greeting = targetName
      ? `Good evening, ${targetName}. It is me, ${apostle.name}. As this day closes, let us lay down every burden in God's peace.`
      : `Good evening, beloved. It is me, ${apostle.name}. As this day closes, let us lay down every burden in God's peace.`;
  }

  // Reverent, natural full liturgy spoken script:
  // 1. Personalized Greeting
  // 2. Clear Scripture Recitation
  // 3. Pastoral Reflection
  // 4. Guided Prayer
  // 5. Apostolic Blessing
  const fullSpokenScript = `${greeting}\n\nFirst, let us hear the Holy Word of God from ${template.scriptureRef}: "${template.scriptureText}".\n\n${template.reflection}\n\nNow, let us join our hearts together in prayer: "${template.prayer}" Amen.\n\nReceive this blessing over your walk: "${template.blessing}"`;

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
    personalGreeting: greeting,
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

export const markLiturgyCompleted = async (liturgyId?: string): Promise<void> => {
  const db = await getDB();
  if (!db) return;

  const today = getLocalDateString();
  const period = getCurrentLiturgyPeriod();

  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO liturgy_completions (id, liturgy_id, date_str, period, completed_at)
       VALUES (?, ?, ?, ?, ?);`,
      [`${today}_${period}`, liturgyId || `prayer_${today}_${period}`, today, period, Date.now()]
    );
  } catch (err) {
    console.warn('Error saving prayer completion:', err);
  }
};

export const markTodayLiturgyCompleted = markLiturgyCompleted;
