import { BibleBook, BibleVerse } from '../types';

export const BIBLE_BOOKS: BibleBook[] = [
  // New Testament
  { name: 'Matthew', testament: 'NT', chaptersCount: 28 },
  { name: 'Mark', testament: 'NT', chaptersCount: 16 },
  { name: 'Luke', testament: 'NT', chaptersCount: 24 },
  { name: 'John', testament: 'NT', chaptersCount: 21 },
  { name: 'Acts', testament: 'NT', chaptersCount: 28 },
  { name: 'Romans', testament: 'NT', chaptersCount: 16 },
  { name: '1 Corinthians', testament: 'NT', chaptersCount: 16 },
  { name: '2 Corinthians', testament: 'NT', chaptersCount: 13 },
  { name: 'Galatians', testament: 'NT', chaptersCount: 6 },
  { name: 'Ephesians', testament: 'NT', chaptersCount: 6 },
  { name: 'Philippians', testament: 'NT', chaptersCount: 4 },
  { name: 'Colossians', testament: 'NT', chaptersCount: 4 },
  { name: '1 Peter', testament: 'NT', chaptersCount: 5 },
  { name: '2 Peter', testament: 'NT', chaptersCount: 3 },
  { name: '1 John', testament: 'NT', chaptersCount: 5 },
  { name: '2 John', testament: 'NT', chaptersCount: 1 },
  { name: '3 John', testament: 'NT', chaptersCount: 1 },
  { name: 'Revelation', testament: 'NT', chaptersCount: 22 },
  
  // Old Testament
  { name: 'Genesis', testament: 'OT', chaptersCount: 50 },
  { name: 'Psalms', testament: 'OT', chaptersCount: 150 },
  { name: 'Proverbs', testament: 'OT', chaptersCount: 31 },
  { name: 'Isaiah', testament: 'OT', chaptersCount: 66 }
];

export const INITIAL_FEATURED_VERSES: BibleVerse[] = [
  {
    book: 'Proverbs',
    chapter: 1,
    verse: 5,
    text: 'Let the wise listen and add to their learning, and let the discerning get guidance.',
    translation: 'NIV'
  },
  {
    book: '1 Peter',
    chapter: 5,
    verse: 7,
    text: 'Cast all your anxiety on him because he cares for you.',
    translation: 'NIV'
  },
  {
    book: 'John',
    chapter: 14,
    verse: 6,
    text: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."',
    translation: 'NIV'
  },
  {
    book: 'John',
    chapter: 1,
    verse: 1,
    text: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    translation: 'NIV'
  },
  {
    book: 'Matthew',
    chapter: 16,
    verse: 16,
    text: 'Simon Peter answered, "You are the Messiah, the Son of the living God."',
    translation: 'NIV'
  },
  {
    book: '1 John',
    chapter: 4,
    verse: 19,
    text: 'We love because he first loved us.',
    translation: 'NIV'
  },
  {
    book: 'Philippians',
    chapter: 4,
    verse: 13,
    text: 'I can do all this through him who gives me strength.',
    translation: 'NIV'
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 1,
    text: 'The LORD is my shepherd, I lack nothing.',
    translation: 'NIV'
  }
];

export const DAILY_SCRIPTURE_FEATURED = {
  quote: 'Let the wise listen and add to their learning, and let the discerning get guidance.',
  reference: 'Proverbs 1:5 (NIV)',
  book: 'Proverbs',
  chapter: 1,
  verse: 5
};
