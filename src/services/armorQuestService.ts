import { getDB } from './database';

export interface ArmorPiece {
  id: string;
  name: string;
  scriptureRef: string;
  category: 'armor';
  iconName: string;
  color: string;
  isEquipped: boolean;
  isUnlocked: boolean;
  lessonDecree: string;
  requirement: string;
  progress: number;
  maxProgress: number;
  xpValue: number;
}

export interface StoryChapter {
  id: string;
  era: string;
  title: string;
  subtitle: string;
  scriptureAnchor: string;
  isCompleted: boolean;
  isActive: boolean;
  order: number;
}

export interface FaithTitle {
  id: string;
  title: string;
  condition: string;
  isUnlocked: boolean;
}

export const ARMOR_PIECES: ArmorPiece[] = [
  {
    id: 'belt_of_truth',
    name: 'Belt of Truth',
    scriptureRef: 'Ephesians 6:14',
    category: 'armor',
    iconName: 'ribbon-outline',
    color: '#3B82F6',
    isEquipped: true,
    isUnlocked: true,
    lessonDecree: '“Stand firm then, with the belt of truth buckled around your waist.” Now that you have acquired the Belt of Truth, remember always to wear it with sacred pride—truth anchors every thought and protects you from the deceptions of the world.',
    requirement: 'Engage in your first conversation with an Apostle',
    progress: 1,
    maxProgress: 1,
    xpValue: 80
  },
  {
    id: 'breastplate_of_righteousness',
    name: 'Breastplate of Righteousness',
    scriptureRef: 'Ephesians 6:14',
    category: 'armor',
    iconName: 'shield-outline',
    color: '#E11D48',
    isEquipped: true,
    isUnlocked: true,
    lessonDecree: '“With the breastplate of righteousness in place.” Now that you wear this, guard your heart with all diligence. Your righteousness does not come from your own deeds, but from Christ who lives in you.',
    requirement: 'Read 3 chapters in the Holy Scriptures',
    progress: 3,
    maxProgress: 3,
    xpValue: 100
  },
  {
    id: 'sandals_of_peace',
    name: 'Sandals of the Gospel of Peace',
    scriptureRef: 'Ephesians 6:15',
    category: 'armor',
    iconName: 'footsteps-outline',
    color: '#059669',
    isEquipped: true,
    isUnlocked: true,
    lessonDecree: '“With your feet fitted with the readiness that comes from the gospel of peace.” Walk wherever the road takes you with eager feet, bringing reconciliation and quiet confidence to weary hearts.',
    requirement: 'Maintain a 3-day walking devotion streak',
    progress: 3,
    maxProgress: 3,
    xpValue: 90
  },
  {
    id: 'shield_of_faith',
    name: 'Shield of Faith',
    scriptureRef: 'Ephesians 6:16',
    category: 'armor',
    iconName: 'shield-checkmark-outline',
    color: '#D97706',
    isEquipped: false,
    isUnlocked: false,
    lessonDecree: '“In addition to all this, take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one.” Hold it high whenever doubts whisper in the quiet; faith is your immovable bulwark.',
    requirement: 'Spend 5 minutes in deep reflection with Simon Peter',
    progress: 3,
    maxProgress: 5,
    xpValue: 120
  },
  {
    id: 'helmet_of_salvation',
    name: 'Helmet of Salvation',
    scriptureRef: 'Ephesians 6:17',
    category: 'armor',
    iconName: 'construct-outline',
    color: '#7C3AED',
    isEquipped: false,
    isUnlocked: false,
    lessonDecree: '“Take the helmet of salvation.” Protect your mind from anxiety and despair. Your salvation is sealed by grace and held securely in eternal hands.',
    requirement: 'Complete a Sunday Sermon Workshop with Paul',
    progress: 1,
    maxProgress: 2,
    xpValue: 150
  },
  {
    id: 'sword_of_the_spirit',
    name: 'Sword of the Spirit',
    scriptureRef: 'Ephesians 6:17',
    category: 'armor',
    iconName: 'flash-outline',
    color: '#0284C7',
    isEquipped: false,
    isUnlocked: false,
    lessonDecree: '“Take the sword of the Spirit, which is the word of God.” The living Word is sharper than any double-edged sword. Speak it with wisdom, compassion, and divine authority.',
    requirement: 'Complete 10 Bible chapters and 5 Apostle chats',
    progress: 4,
    maxProgress: 10,
    xpValue: 200
  }
];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'ch1_eden',
    era: 'ACT I • THE BEGINNING',
    title: 'The Breath & The Promise',
    subtitle: 'From the garden of Genesis to the ancient covenant of faith',
    scriptureAnchor: 'Genesis 1:1 - 3:15',
    isCompleted: true,
    isActive: false,
    order: 1
  },
  {
    id: 'ch2_wilderness',
    era: 'ACT II • THE WILDERNESS',
    title: 'The Tabernacle & The Law',
    subtitle: 'Following the pillar of fire through dry and thirsty lands',
    scriptureAnchor: 'Exodus 14 - Deuteronomy 6',
    isCompleted: true,
    isActive: false,
    order: 2
  },
  {
    id: 'ch3_gospels',
    era: 'ACT III • THE LIVING WORD',
    title: 'Footsteps by the Sea of Galilee',
    subtitle: 'Leaving our fishing nets behind to walk alongside Jesus and His 12 Disciples',
    scriptureAnchor: 'Matthew 4 - John 21',
    isCompleted: false,
    isActive: true,
    order: 3
  },
  {
    id: 'ch4_acts',
    era: 'ACT IV • THE FLAME OF PENTECOST',
    title: 'The Early Church & The Open Road',
    subtitle: 'Empowered by the Spirit to take the message from Jerusalem to the ends of the earth',
    scriptureAnchor: 'Acts 2 - Acts 28',
    isCompleted: false,
    isActive: false,
    order: 4
  },
  {
    id: 'ch5_revelation',
    era: 'ACT V • THE NEW JERUSALEM',
    title: 'The City of Light & Overcomers',
    subtitle: 'No more tears, no more pain; eternal communion in radiant joy',
    scriptureAnchor: 'Revelation 21 - 22',
    isCompleted: false,
    isActive: false,
    order: 5
  }
];

export const FAITH_TITLES: FaithTitle[] = [
  { id: 'listener', title: 'The Attentive Listener', condition: 'Completed a 5-min voice call with an Apostle', isUnlocked: true },
  { id: 'orator', title: 'The Humble Orator', condition: 'Completed a 10-min voice call', isUnlocked: false },
  { id: 'scribe', title: 'The Faithful Scribe', condition: 'Engaged in 8+ continuous chat turns', isUnlocked: true },
  { id: 'berean', title: 'The Berean Inquirer', condition: 'Read Scripture across 3 different translations', isUnlocked: true },
  { id: 'overcomer', title: 'Armor-Clad Overcomer', condition: 'Equipped 4+ pieces of the Armor of God', isUnlocked: false }
];
