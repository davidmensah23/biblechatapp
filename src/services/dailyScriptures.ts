export interface DailyScriptureItem {
  id: string;
  dayIndex: number;
  quote: string;
  reference: string;
  book: string;
  chapter: number;
  verse: string;
  theme: string;
  reflection: string;
  bannerImage: any;
}

export const DAILY_SCRIPTURES_DATABASE: DailyScriptureItem[] = [
  {
    id: 'scripture_1',
    dayIndex: 1,
    quote: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verse: '5-6',
    theme: 'Trust & Guidance',
    reflection: 'When the road ahead seems uncertain, wisdom begins not with our limited foresight, but with resting our hearts in His faithful hand.',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_2',
    dayIndex: 2,
    quote: 'Cast all your anxiety on him because he cares for you.',
    reference: '1 Peter 5:7',
    book: '1 Peter',
    chapter: 5,
    verse: '7',
    theme: 'Peace & Comfort',
    reflection: 'You do not have to carry the weight of tomorrow alone. Hand your heaviest worries to the One whose shoulders bore the cross.',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_3',
    dayIndex: 3,
    quote: 'There is no fear in love. But perfect love drives out fear, because fear has to do with punishment.',
    reference: '1 John 4:18',
    book: '1 John',
    chapter: 4,
    verse: '18',
    theme: 'Divine Love',
    reflection: 'Fear shrinks our souls, but God’s unfailing love expands our capacity to live boldly and without condemnation.',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_4',
    dayIndex: 4,
    quote: 'I can do all this through him who gives me strength.',
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verse: '13',
    theme: 'Strength & Endurance',
    reflection: 'Contentment and resilience do not come from our personal circumstances, but from the indwelling presence of Christ.',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_5',
    dayIndex: 5,
    quote: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.',
    reference: 'Psalm 23:1-3',
    book: 'Psalms',
    chapter: 23,
    verse: '1-3',
    theme: 'Restoration',
    reflection: 'In a noisy and hurried world, the Good Shepherd invites your soul into stillness and spiritual renewal.',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_6',
    dayIndex: 6,
    quote: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
    book: 'Matthew',
    chapter: 11,
    verse: '28',
    theme: 'Rest in Christ',
    reflection: 'Jesus does not demand that you fix your weariness before approaching Him; His invitation is to come precisely as you are.',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_7',
    dayIndex: 7,
    quote: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    reference: 'John 14:27',
    book: 'John',
    chapter: 14,
    verse: '27',
    theme: 'Shalom Peace',
    reflection: 'Worldly peace depends on quiet surroundings; Christ’s peace is an anchor that holds steady even in the midst of stormy seas.',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  }
];

/**
 * Returns today's featured daily scripture based on calendar day
 */
export const getTodayScripture = (): DailyScriptureItem => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % DAILY_SCRIPTURES_DATABASE.length;
  return DAILY_SCRIPTURES_DATABASE[index];
};
