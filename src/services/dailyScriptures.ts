import { supabase } from './supabase';

export interface DailyScriptureItem {
  id: string;
  dayIndex: number;
  quote: string;
  reference: string;
  book: string;
  chapter: number;
  verse: string | number;
  theme: string;
  reflection: string;
  imageUrl: string;
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
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_2',
    dayIndex: 2,
    quote: 'Cast all your anxiety on him because he cares for you.',
    reference: '1 Peter 5:7',
    book: '1 Peter',
    chapter: 5,
    verse: 7,
    theme: 'Peace & Comfort',
    reflection: 'You do not have to carry the weight of tomorrow alone. Hand your heaviest worries to the One whose shoulders bore the cross.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_3',
    dayIndex: 3,
    quote: 'There is no fear in love. But perfect love drives out fear, because fear has to do with punishment.',
    reference: '1 John 4:18',
    book: '1 John',
    chapter: 4,
    verse: 18,
    theme: 'Divine Love',
    reflection: 'Fear shrinks our souls, but God’s unfailing love expands our capacity to live boldly and without condemnation.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_4',
    dayIndex: 4,
    quote: 'I can do all this through him who gives me strength.',
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verse: 13,
    theme: 'Strength & Endurance',
    reflection: 'Contentment and resilience do not come from our personal circumstances, but from the indwelling presence of Christ.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_6',
    dayIndex: 6,
    quote: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
    book: 'Matthew',
    chapter: 11,
    verse: 28,
    theme: 'Rest in Christ',
    reflection: 'Jesus does not demand that you fix your weariness before approaching Him; His invitation is to come precisely as you are.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_7',
    dayIndex: 7,
    quote: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    reference: 'John 14:27',
    book: 'John',
    chapter: 14,
    verse: 27,
    theme: 'Shalom Peace',
    reflection: 'Worldly peace depends on quiet surroundings; Christ’s peace is an anchor that holds steady even in the midst of stormy seas.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_8',
    dayIndex: 8,
    quote: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    reference: 'Romans 8:28',
    book: 'Romans',
    chapter: 8,
    verse: 28,
    theme: 'Sovereign Good',
    reflection: 'Even seasons of waiting and hardship are being woven by the Master Potter into a vessel of profound purpose and grace.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_9',
    dayIndex: 9,
    quote: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    reference: 'Isaiah 40:31',
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    theme: 'Renewed Strength',
    reflection: 'Human stamina eventually fades, but waiting upon the Lord taps into an inexhaustible reservoir of heavenly vitality.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_10',
    dayIndex: 10,
    quote: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    reference: 'Joshua 1:9',
    book: 'Joshua',
    chapter: 1,
    verse: 9,
    theme: 'Courage',
    reflection: 'Courage is not the absence of fear, but the conviction that God’s presence precedes you into every unknown valley.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_11',
    dayIndex: 11,
    quote: 'My grace is sufficient for you, for my power is made perfect in weakness.',
    reference: '2 Corinthians 12:9',
    book: '2 Corinthians',
    chapter: 12,
    verse: 9,
    theme: 'All-Sufficient Grace',
    reflection: 'Where our human capacity runs dry, the unmerited power of Christ steps in to perform what we could never do alone.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_12',
    dayIndex: 12,
    quote: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
    reference: 'Psalm 46:10',
    book: 'Psalms',
    chapter: 46,
    verse: 10,
    theme: 'Sacred Stillness',
    reflection: 'Cease striving. Take a deep breath. Release control to the One who rules the constellations and your very next heartbeat.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_13',
    dayIndex: 13,
    quote: '“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”',
    reference: 'Jeremiah 29:11',
    book: 'Jeremiah',
    chapter: 29,
    verse: 11,
    theme: 'Hope & Future',
    reflection: 'Your life is not a collection of random accidents; it is a tapestry designed with eternal intentionality and divine love.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_14',
    dayIndex: 14,
    quote: 'Your word is a lamp for my feet, a light on my path.',
    reference: 'Psalm 119:105',
    book: 'Psalms',
    chapter: 119,
    verse: 105,
    theme: 'Divine Guidance',
    reflection: 'Scripture does not always reveal the next ten miles, but it will always illuminate the faithful step right before you.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_15',
    dayIndex: 15,
    quote: 'The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    reference: 'Galatians 5:22-23',
    book: 'Galatians',
    chapter: 5,
    verse: '22-23',
    theme: 'Spiritual Fruit',
    reflection: 'Spiritual transformation is not produced by legalistic effort, but by abiding deeply in the true Vine of Christ Jesus.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_16',
    dayIndex: 16,
    quote: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
    reference: 'Romans 12:2',
    book: 'Romans',
    chapter: 12,
    verse: 2,
    theme: 'Transformation',
    reflection: 'Protect what enters your thoughts today. Fill your spiritual gaze with biblical truth rather than worldly anxiety.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_17',
    dayIndex: 17,
    quote: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.',
    reference: 'Ephesians 2:8-9',
    book: 'Ephesians',
    chapter: 2,
    verse: '8-9',
    theme: 'Pure Grace',
    reflection: 'Salvation is an unearned gift of breathtaking love. Walk today in gratitude rather than anxious striving.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_18',
    dayIndex: 18,
    quote: 'The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?',
    reference: 'Psalm 27:1',
    book: 'Psalms',
    chapter: 27,
    verse: 1,
    theme: 'Unshakable Light',
    reflection: 'When God is your lighthouse and your fortress, the shadow of any circumstance loses its power to terrify you.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_19',
    dayIndex: 19,
    quote: 'Therefore, as God’s chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience.',
    reference: 'Colossians 3:12',
    book: 'Colossians',
    chapter: 3,
    verse: 12,
    theme: 'Kingdom Character',
    reflection: 'Before speaking with anyone today, put on the spiritual garments of gentleness, patience, and Christlike charity.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_20',
    dayIndex: 20,
    quote: 'Because of the Lord’s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.',
    reference: 'Lamentations 3:22-23',
    book: 'Lamentations',
    chapter: 3,
    verse: '22-23',
    theme: 'New Mercies',
    reflection: 'Yesterday’s mistakes do not define today. Every sunrise brings a clean slate of God’s unfailing mercy and tender affection.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_21',
    dayIndex: 21,
    quote: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    reference: 'Hebrews 11:1',
    book: 'Hebrews',
    chapter: 11,
    verse: 1,
    theme: 'Unseen Faith',
    reflection: 'Faith is not wishful thinking; it is the spiritual title deed to the promises that God has already spoken into existence.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_22',
    dayIndex: 22,
    quote: 'Taste and see that the Lord is good; blessed is the one who takes refuge in him.',
    reference: 'Psalm 34:8',
    book: 'Psalms',
    chapter: 34,
    verse: 8,
    theme: 'God’s Goodness',
    reflection: 'God is not merely a theological concept to analyze, but an intimate Father whose goodness can be experienced personally today.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_23',
    dayIndex: 23,
    quote: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    reference: 'Isaiah 41:10',
    book: 'Isaiah',
    chapter: 41,
    verse: 10,
    theme: 'Divine Strength',
    reflection: 'When knees tremble and energy flags, the righteous right hand of the Almighty holds you steady above the storm.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_24',
    dayIndex: 24,
    quote: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.',
    reference: 'Romans 15:13',
    book: 'Romans',
    chapter: 15,
    verse: 13,
    theme: 'Overflowing Hope',
    reflection: 'Hope in God does not merely trickle; it overflows into the lives of everyone around you through the Spirit’s presence.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_25',
    dayIndex: 25,
    quote: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.',
    reference: '1 Thessalonians 5:16-18',
    book: '1 Thessalonians',
    chapter: 5,
    verse: '16-18',
    theme: 'Continual Praise',
    reflection: 'Gratitude is the quickest pathway into God’s peace. Whatever today holds, find one quiet reason to whisper thanks.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_26',
    dayIndex: 26,
    quote: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, “He is my refuge and my fortress.”',
    reference: 'Psalm 91:1-2',
    book: 'Psalms',
    chapter: 91,
    verse: '1-2',
    theme: 'Secret Place',
    reflection: 'There is a sacred shelter hidden away from worldly noise where fear cannot follow. Make the Lord your dwelling place today.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_27',
    dayIndex: 27,
    quote: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    reference: '2 Timothy 1:7',
    book: '2 Timothy',
    chapter: 1,
    verse: 7,
    theme: 'Power & Love',
    reflection: 'Timidity is not your spiritual inheritance. The Holy Spirit inside you carries divine power, sacrificial love, and a disciplined mind.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_28',
    dayIndex: 28,
    quote: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.',
    reference: 'Micah 6:8',
    book: 'Micah',
    chapter: 6,
    verse: 8,
    theme: 'Humble Walk',
    reflection: 'True spirituality is beautifully simple: defend what is right, extend tender mercy to others, and walk quietly with your God.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_29',
    dayIndex: 29,
    quote: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    reference: 'Matthew 6:33',
    book: 'Matthew',
    chapter: 6,
    verse: 33,
    theme: 'First Things First',
    reflection: 'When your heart aligns with the Kingdom first, the Father takes personal responsibility for all your earthly needs.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_30',
    dayIndex: 30,
    quote: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.',
    reference: 'Revelation 21:4',
    book: 'Revelation',
    chapter: 21,
    verse: 4,
    theme: 'Eternal Restoration',
    reflection: 'Present pain is not the end of your story. An eternal morning is coming where Christ Himself will gently dry every tear.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_31',
    dayIndex: 31,
    quote: 'God is our refuge and strength, an ever-present help in trouble.',
    reference: 'Psalm 46:1',
    book: 'Psalms',
    chapter: 46,
    verse: 1,
    theme: 'Unshakable Refuge',
    reflection: 'When foundations shake, God does not flinch. He remains your impenetrable sanctuary and personal defense.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_32',
    dayIndex: 32,
    quote: 'Therefore, as God\'s chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience.',
    reference: 'Colossians 3:12',
    book: 'Colossians',
    chapter: 3,
    verse: 12,
    theme: 'Garments of Grace',
    reflection: 'Before facing the world today, put on love and patience like fresh garments of heaven.',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_33',
    dayIndex: 33,
    quote: 'Your word is a lamp for my feet, a light on my path.',
    reference: 'Psalm 119:105',
    book: 'Psalms',
    chapter: 119,
    verse: 105,
    theme: 'Illuminated Steps',
    reflection: 'God rarely reveals ten miles down the road; His Word provides just enough radiant light for your next obedient step.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_34',
    dayIndex: 34,
    quote: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    reference: 'Galatians 5:22-23',
    book: 'Galatians',
    chapter: 5,
    verse: '22-23',
    theme: 'Fruitful Living',
    reflection: 'Spiritual maturity is not measured by spiritual gifts or noise, but by the sweet fragrance of Christlike character.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_35',
    dayIndex: 35,
    quote: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
    reference: 'James 1:5',
    book: 'James',
    chapter: 1,
    verse: 5,
    theme: 'Generous Wisdom',
    reflection: 'God never scolds you for admitting you do not know the way. Ask in faith, and heaven will dispense counsel with open hands.',
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_36',
    dayIndex: 36,
    quote: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    reference: 'Hebrews 11:1',
    book: 'Hebrews',
    chapter: 11,
    verse: 1,
    theme: 'Steadfast Faith',
    reflection: 'Faith is the title deed to heaven’s promises—holding firmly onto God\'s unseen goodness when physical eyes cannot trace it.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_37',
    dayIndex: 37,
    quote: 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.',
    reference: 'Psalm 139:14',
    book: 'Psalms',
    chapter: 139,
    verse: 14,
    theme: 'Sacred Design',
    reflection: 'You are no accident or afterthought. Every breath and fiber of your being was crafted with purposeful delight by your Creator.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_38',
    dayIndex: 38,
    quote: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    reference: '2 Timothy 1:7',
    book: '2 Timothy',
    chapter: 1,
    verse: 7,
    theme: 'Spirit of Boldness',
    reflection: 'Fear does not come from God. When anxious dread knocks at the door, let the Holy Spirit of power answer it.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_39',
    dayIndex: 39,
    quote: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.',
    reference: 'Isaiah 26:3',
    book: 'Isaiah',
    chapter: 26,
    verse: 3,
    theme: 'Perfect Peace',
    reflection: 'Peace is not the absence of storms; it is fixing your thoughts unwaveringly on the Master of the seas.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_40',
    dayIndex: 40,
    quote: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.',
    reference: 'Ephesians 2:8-9',
    book: 'Ephesians',
    chapter: 2,
    verse: '8-9',
    theme: 'Gift of Grace',
    reflection: 'Salvation is an unearnable gift of pure mercy. Cease striving and simply receive the Father\'s lavish embrace.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_41',
    dayIndex: 41,
    quote: 'For I am convinced that neither death nor life, neither angels nor demons... will be able to separate us from the love of God.',
    reference: 'Romans 8:38-39',
    book: 'Romans',
    chapter: 8,
    verse: '38-39',
    theme: 'Inseparable Love',
    reflection: 'Nothing in this cosmos—neither trials, failures, nor darkness—can ever sever the bond of Christ\'s fierce devotion to you.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_42',
    dayIndex: 42,
    quote: 'Taste and see that the Lord is good; blessed is the one who takes refuge in him.',
    reference: 'Psalm 34:8',
    book: 'Psalms',
    chapter: 34,
    verse: 8,
    theme: 'Experienced Goodness',
    reflection: 'God does not ask for distant intellectual assent. Taste His kindness personally in prayer, and you will discover true satisfaction.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_43',
    dayIndex: 43,
    quote: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.',
    reference: '1 Thessalonians 5:16-18',
    book: '1 Thessalonians',
    chapter: 5,
    verse: '16-18',
    theme: 'Heart of Gratitude',
    reflection: 'Gratitude is a spiritual weapon. Giving thanks in all seasons re-anchors your soul in heaven\'s unchanging joy.',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_44',
    dayIndex: 44,
    quote: 'May these words of my mouth and this meditation of my heart be pleasing in your sight, Lord, my Rock and my Redeemer.',
    reference: 'Psalm 19:14',
    book: 'Psalms',
    chapter: 19,
    verse: 14,
    theme: 'Pleasing Worship',
    reflection: 'Offer the thoughts of your mind and the words of your tongue as a holy, sweet sacrifice before your Redeemer today.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_45',
    dayIndex: 45,
    quote: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
    book: 'Matthew',
    chapter: 11,
    verse: 28,
    theme: 'Sabbath Rest',
    reflection: 'Jesus never offers a complicated religion. He offers His gentle presence to trade your exhaustion for supernatural peace.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_46',
    dayIndex: 46,
    quote: 'Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.',
    reference: 'Deuteronomy 31:6',
    book: 'Deuteronomy',
    chapter: 31,
    verse: 6,
    theme: 'Constant Companion',
    reflection: 'Courage is not bravado; it is stepping out with confidence knowing God has walked into the battle ahead of you.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_47',
    dayIndex: 47,
    quote: 'The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?',
    reference: 'Psalm 27:1',
    book: 'Psalms',
    chapter: 27,
    verse: 1,
    theme: 'Divine Stronghold',
    reflection: 'When the Lord illuminates your world, shadows lose all power to intimidate you.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_48',
    dayIndex: 48,
    quote: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    reference: 'John 14:27',
    book: 'John',
    chapter: 14,
    verse: 27,
    theme: 'Supernatural Peace',
    reflection: 'The peace Jesus imparts cannot be stolen by circumstances because it comes from heaven’s unshakable throne.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_49',
    dayIndex: 49,
    quote: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
    reference: 'Romans 12:2',
    book: 'Romans',
    chapter: 12,
    verse: 2,
    theme: 'Renewed Mind',
    reflection: 'Transformation begins when you replace worldly culture\'s noise with the steady truth of scripture.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_50',
    dayIndex: 50,
    quote: 'Praise the Lord, my soul, and forget not all his benefits—who forgives all your sins and heals all your diseases.',
    reference: 'Psalm 103:2-3',
    book: 'Psalms',
    chapter: 103,
    verse: '2-3',
    theme: 'Remembering Benefits',
    reflection: 'Count your blessings out loud today. Gratitude chases away gloom and recalibrates your spirit with praise.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_51',
    dayIndex: 51,
    quote: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
    reference: '2 Corinthians 5:17',
    book: '2 Corinthians',
    chapter: 5,
    verse: 17,
    theme: 'New Creation',
    reflection: 'You are not defined by past shame or broken seasons. In Christ, every day is a fresh, consecrated canvas.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_52',
    dayIndex: 52,
    quote: 'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.',
    reference: 'Zephaniah 3:17',
    book: 'Zephaniah',
    chapter: 3,
    verse: 17,
    theme: 'Singing Over You',
    reflection: 'Hear the tender song of heaven: Almighty God sings over you with passionate joy and fierce protection.',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_53',
    dayIndex: 53,
    quote: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, \'He is my refuge and my fortress, my God, in whom I trust.\'',
    reference: 'Psalm 91:1-2',
    book: 'Psalms',
    chapter: 91,
    verse: '1-2',
    theme: 'Secret Place',
    reflection: 'In the quiet shelter of prayer, no enemy arrow can penetrate the overshadowing wings of the Almighty.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_54',
    dayIndex: 54,
    quote: 'Let us then approach God\'s throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need.',
    reference: 'Hebrews 4:16',
    book: 'Hebrews',
    chapter: 4,
    verse: 16,
    theme: 'Throne of Grace',
    reflection: 'Do not approach God timidly or with fear. Christ\'s blood has swung heaven\'s gates wide open for your bold requests.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_55',
    dayIndex: 55,
    quote: 'You make known to me the path of life; you will fill me with joy in your presence, with eternal pleasures at your right hand.',
    reference: 'Psalm 16:11',
    book: 'Psalms',
    chapter: 16,
    verse: 11,
    theme: 'Fullness of Joy',
    reflection: 'Worldly happiness depends on happenings; divine joy flows ceaselessly from dwelling in His holy presence.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_56',
    dayIndex: 56,
    quote: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.',
    reference: 'Romans 15:13',
    book: 'Romans',
    chapter: 15,
    verse: 13,
    theme: 'Overflowing Hope',
    reflection: 'May the Spirit fill your spiritual reserves until joy and buoyant hope spill over into everyone around you.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_57',
    dayIndex: 57,
    quote: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.',
    reference: 'Lamentations 3:22-23',
    book: 'Lamentations',
    chapter: 3,
    verse: '22-23',
    theme: 'Mercies Every Morning',
    reflection: 'Yesterday\'s failures ran out with yesterday\'s sun. Today, fresh mercies await you with the sunrise.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_58',
    dayIndex: 58,
    quote: 'Above all else, guard your heart, for everything you do flows from it.',
    reference: 'Proverbs 4:23',
    book: 'Proverbs',
    chapter: 4,
    verse: 23,
    theme: 'Guarding the Wellspring',
    reflection: 'Protect what you let into your spiritual gates. A consecrated heart produces rivers of life and peace.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_59',
    dayIndex: 59,
    quote: 'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.',
    reference: 'John 15:5',
    book: 'John',
    chapter: 15,
    verse: 5,
    theme: 'Abiding in the Vine',
    reflection: 'Branches don\'t strain to produce fruit; they simply stay connected to the vine. Abide in Christ, and fruit is inevitable.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  },
  {
    id: 'scripture_60',
    dayIndex: 60,
    quote: 'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace.',
    reference: 'Numbers 6:24-26',
    book: 'Numbers',
    chapter: 6,
    verse: '24-26',
    theme: 'Priestly Blessing',
    reflection: 'Receive the timeless Aaronite blessing: God\'s smiling face turns toward you, wrapping you in shalom peace.',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    bannerImage: require('../../assets/images/daily_scripture_banner.png')
  }
];

export const getTodayScripture = (): DailyScriptureItem => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % DAILY_SCRIPTURES_DATABASE.length;
  return DAILY_SCRIPTURES_DATABASE[index];
};

let cachedTodayScripture: DailyScriptureItem | null = null;
let lastCachedDateStr: string = '';

/**
 * High-performance SWR cached loader for Daily Scripture.
 * Reads centrally from Supabase daily_scriptures_cache (fetch once, shared across all users)
 * and falls back seamlessly to the 60-day local offline database.
 */
export const fetchDailyScriptureWithCache = async (): Promise<DailyScriptureItem> => {
  const todayStr = new Date().toISOString().split('T')[0];
  if (cachedTodayScripture && lastCachedDateStr === todayStr) {
    return cachedTodayScripture;
  }

  const fallback = getTodayScripture();

  try {
    const { data, error } = await supabase
      .from('daily_scriptures_cache')
      .select('*')
      .eq('date_str', todayStr)
      .maybeSingle();

    if (!error && data) {
      cachedTodayScripture = {
        id: data.id,
        dayIndex: fallback.dayIndex,
        quote: data.quote,
        reference: data.reference,
        book: data.book,
        chapter: data.chapter,
        verse: data.verse,
        theme: data.theme,
        reflection: data.reflection,
        imageUrl: data.image_url || fallback.imageUrl,
        bannerImage: fallback.bannerImage
      };
      lastCachedDateStr = todayStr;
      return cachedTodayScripture;
    }

    // Seed into Supabase cache so subsequent users receive the exact same shared verse
    supabase
      .from('daily_scriptures_cache')
      .upsert({
        id: todayStr,
        date_str: todayStr,
        quote: fallback.quote,
        reference: fallback.reference,
        book: fallback.book,
        chapter: fallback.chapter,
        verse: String(fallback.verse),
        theme: fallback.theme,
        reflection: fallback.reflection,
        image_url: fallback.imageUrl
      }, { onConflict: 'date_str' })
      .then(() => {}, () => {});

  } catch (e) {
    // Offline fallback
  }

  cachedTodayScripture = fallback;
  lastCachedDateStr = todayStr;
  return fallback;
};


