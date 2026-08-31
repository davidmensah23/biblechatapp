export interface ApostleQuotationItem {
  id: string;
  apostleId: string;
  apostleName: string;
  apostleTitle: string;
  quote: string;
  contextNote: string;
  scriptureReference: string;
  avatar: any;
}

export const DAILY_APOSTLE_QUOTATIONS: ApostleQuotationItem[] = [
  {
    id: 'quote_peter_1',
    apostleId: 'peter',
    apostleName: 'Simon Peter',
    apostleTitle: 'The Rock',
    quote: 'When the waves were crashing around my boat, fear almost swallowed me. But the moment I cried out, His hand was already there catching me. Whatever storm you face today, keep your eyes on Him.',
    contextNote: 'Reflecting on walking on the Sea of Galilee',
    scriptureReference: 'Matthew 14:30-31',
    avatar: require('../../assets/avatars/peter.png')
  },
  {
    id: 'quote_john_1',
    apostleId: 'john',
    apostleName: 'John',
    apostleTitle: 'The Beloved Disciple',
    quote: 'We love because He first loved us. If you feel weary or empty today, remember that you do not need to earn His affection—you simply need to abide in it.',
    contextNote: 'On the unconditional depth of divine love',
    scriptureReference: '1 John 4:19',
    avatar: require('../../assets/avatars/john.png')
  },
  {
    id: 'quote_paul_1',
    apostleId: 'paul',
    apostleName: 'Paul',
    apostleTitle: 'Apostle to the Nations',
    quote: 'My grace is sufficient for you, for my power is made perfect in weakness. Let your perceived shortcomings today be the very canvas where His strength shines brightest.',
    contextNote: 'On finding strength in vulnerability',
    scriptureReference: '2 Corinthians 12:9',
    avatar: require('../../assets/avatars/paul.png')
  },
  {
    id: 'quote_thomas_1',
    apostleId: 'thomas',
    apostleName: 'Thomas',
    apostleTitle: 'The Honest Seeker',
    quote: 'Never be ashamed of bringing your rawest questions to the Master. He did not scold me for needing proof; He reached out and let me touch His wounds. Honest searching always leads to deeper faith.',
    contextNote: 'On honest wrestling and genuine conviction',
    scriptureReference: 'John 20:27',
    avatar: require('../../assets/avatars/thomas.png')
  },
  {
    id: 'quote_andrew_1',
    apostleId: 'andrew',
    apostleName: 'Andrew',
    apostleTitle: 'The Quiet Connector',
    quote: 'It was just a small boy with five small loaves and two fish, but in Jesus’ hands it was more than enough to feed thousands. Never underestimate the small acts of faithfulness you offer today.',
    contextNote: 'On offering our small gifts to God',
    scriptureReference: 'John 6:8-9',
    avatar: require('../../assets/avatars/andrew.png')
  }
];

export const getTodayApostleQuotation = (): ApostleQuotationItem => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = (dayOfYear + 2) % DAILY_APOSTLE_QUOTATIONS.length;
  return DAILY_APOSTLE_QUOTATIONS[index];
};
