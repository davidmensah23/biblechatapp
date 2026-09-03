/**
 * Biblical Chapter Section Titles & Topic Headings
 * Provides standard, universally recognized thematic headings for Bible chapters.
 */

const FAMOUS_CHAPTER_HEADINGS: Record<string, Record<number, string>> = {
  // Pentateuch
  'Genesis': {
    1: 'The Creation of the World',
    2: 'The Garden of Eden',
    3: 'The Fall of Humanity',
    4: 'Cain and Abel',
    6: 'Noah and the Great Flood',
    11: 'The Tower of Babel',
    12: 'The Call of Abram',
    15: 'God\'s Covenant with Abram',
    22: 'The Testing of Abraham',
    28: 'Jacob\'s Ladder at Bethel',
    37: 'Joseph\'s Dreams and the Coat',
    50: 'Joseph Forgives His Brothers'
  },
  'Exodus': {
    3: 'The Burning Bush',
    12: 'The First Passover',
    14: 'Crossing the Red Sea',
    20: 'The Ten Commandments',
    32: 'The Golden Calf',
    34: 'The Radiance of Moses\' Face'
  },
  'Leviticus': {
    16: 'The Day of Atonement',
    19: 'The Call to Holiness'
  },
  'Numbers': {
    6: 'The Priestly Blessing',
    13: 'The Spies Sent into Canaan'
  },
  'Deuteronomy': {
    6: 'The Shema: Love the Lord Your God',
    28: 'Blessings for Obedience',
    34: 'The Death of Moses'
  },

  // Historical Books
  'Joshua': {
    1: 'Be Strong and Courageous',
    6: 'The Fall of Jericho',
    24: 'Choose This Day Whom You Will Serve'
  },
  'Judges': {
    6: 'The Call of Gideon',
    16: 'Samson and Delilah'
  },
  'Ruth': {
    1: 'Where You Go I Will Go',
    4: 'Boaz Redeems Ruth'
  },
  '1 Samuel': {
    3: 'The Lord Calls Samuel',
    16: 'David Anointed as King',
    17: 'David and Goliath'
  },
  '2 Samuel': {
    7: 'God\'s Covenant with David',
    11: 'David and Bathsheba',
    12: 'Nathan Rebukes David',
    22: 'David\'s Song of Deliverance',
    23: 'David\'s Last Words and Mighty Men',
    24: 'David Builds an Altar'
  },
  '1 Kings': {
    3: 'Solomon\'s Request for Wisdom',
    8: 'Dedication of the Temple',
    18: 'Elijah on Mount Carmel',
    19: 'The Gentle Whisper of God'
  },
  '2 Kings': {
    2: 'Elijah Taken Up to Heaven',
    5: 'Naaman Healed of Leprosy'
  },

  // Wisdom & Poetry
  'Job': {
    1: 'Job\'s Faith in Affliction',
    19: 'I Know That My Redeemer Lives',
    38: 'The Lord Answers Job Out of the Storm'
  },
  'Psalms': {
    1: 'The Way of the Righteous',
    19: 'The Heavens Declare God\'s Glory',
    23: 'The Lord Is My Shepherd',
    27: 'The Lord Is My Light and Salvation',
    34: 'Taste and See That the Lord Is Good',
    46: 'God Is Our Refuge and Strength',
    51: 'Create in Me a Clean Heart',
    91: 'In the Secret Place of the Most High',
    100: 'Enter His Gates with Thanksgiving',
    103: 'Praise the Lord, O My Soul',
    119: 'The Great Glories of God\'s Word',
    121: 'My Help Comes from the Lord',
    139: 'Fearfully and Wonderfully Made'
  },
  'Proverbs': {
    1: 'The Beginning of Knowledge',
    3: 'Trust in the Lord with All Your Heart',
    4: 'Guard Your Heart',
    31: 'The Virtuous Woman'
  },
  'Ecclesiastes': {
    3: 'A Time for Everything',
    12: 'Remember Your Creator in Your Youth'
  },
  'Song of Solomon': {
    2: 'My Beloved Is Mine and I Am His'
  },

  // Prophets
  'Isaiah': {
    6: 'Isaiah\'s Vision of the Holy God',
    9: 'The Prince of Peace',
    40: 'Comfort for God\'s People',
    53: 'The Suffering Servant',
    55: 'Come, All You Who Are Thirsty',
    60: 'Arise, Shine, for Your Light Has Come'
  },
  'Jeremiah': {
    1: 'The Call of Jeremiah',
    29: 'Plans to Prosper and Give You Hope',
    31: 'A New Covenant'
  },
  'Lamentations': {
    3: 'Great Is Your Faithfulness'
  },
  'Ezekiel': {
    37: 'The Valley of Dry Bones'
  },
  'Daniel': {
    3: 'The Fiery Furnace',
    6: 'Daniel in the Lions\' Den'
  },
  'Jonah': {
    1: 'Jonah Flees from the Lord',
    2: 'Jonah\'s Prayer from the Deep'
  },
  'Micah': {
    6: 'Act Justly, Love Mercy, Walk Humbly'
  },
  'Habakkuk': {
    3: 'Rejoicing in the Lord'
  },
  'Malachi': {
    3: 'I Will Send My Messenger'
  },

  // Gospels
  'Matthew': {
    1: 'The Genealogy and Birth of Jesus',
    2: 'The Visit of the Wise Men',
    3: 'The Baptism of Jesus',
    4: 'The Temptation of Jesus',
    5: 'The Sermon on the Mount: The Beatitudes',
    6: 'The Lord\'s Prayer and True Treasures',
    7: 'Ask, Seek, Knock and The Wise Builder',
    13: 'The Parable of the Sower',
    14: 'Jesus Walks on the Water',
    16: 'Peter\'s Confession of Christ',
    26: 'The Last Supper and Gethsemane',
    27: 'The Crucifixion of Jesus',
    28: 'The Resurrection and The Great Commission'
  },
  'Mark': {
    1: 'Jesus Announces the Kingdom',
    4: 'Jesus Calms the Sea',
    5: 'Jesus Heals the Afflicted',
    11: 'The Triumphal Entry into Jerusalem',
    15: 'The Crucifixion and Death of Jesus',
    16: 'He Is Risen'
  },
  'Luke': {
    1: 'The Birth of Jesus Foretold to Mary',
    2: 'The Birth of Jesus in Bethlehem',
    4: 'Jesus Proclaims Good News in Nazareth',
    10: 'The Good Samaritan and Mary and Martha',
    15: 'The Parable of the Prodigal Son',
    19: 'Zacchaeus and The Triumphal Entry',
    24: 'The Road to Emmaus and The Ascension'
  },
  'John': {
    1: 'The Word Became Flesh',
    2: 'Jesus Turns Water into Wine',
    3: 'Born Again: For God So Loved the World',
    4: 'The Woman at the Samaritan Well',
    6: 'The Bread of Life',
    10: 'The Good Shepherd',
    11: 'Jesus Raises Lazarus from the Dead',
    13: 'Jesus Washes His Disciples\' Feet',
    14: 'The Way, the Truth, and the Life',
    15: 'The Vine and the Branches',
    17: 'Jesus\' High Priestly Prayer',
    20: 'The Resurrection and Thomas\' Faith',
    21: 'Jesus Reinstates Peter by the Sea'
  },

  // Acts & Epistles
  'Acts': {
    1: 'The Holy Spirit Promised',
    2: 'The Day of Pentecost',
    9: 'The Conversion of Saul on the Damascus Road',
    10: 'Peter and Cornelius',
    16: 'Paul and Silas in Prison',
    27: 'The Shipwreck at Sea'
  },
  'Romans': {
    1: 'The Power of the Gospel',
    5: 'Peace and Hope Through Faith',
    8: 'Life in the Spirit: More Than Conquerors',
    12: 'Living Sacrifices and True Christian Love'
  },
  '1 Corinthians': {
    12: 'Spiritual Gifts in One Body',
    13: 'The Excellence of Love',
    15: 'The Resurrection of Christ and the Dead'
  },
  '2 Corinthians': {
    4: 'Treasures in Jars of Clay',
    5: 'A New Creation in Christ',
    12: 'My Grace Is Sufficient for You'
  },
  'Galatians': {
    5: 'Freedom in Christ and The Fruit of the Spirit'
  },
  'Ephesians': {
    2: 'Made Alive in Christ by Grace',
    3: 'The Boundless Love of Christ',
    6: 'The Whole Armor of God'
  },
  'Philippians': {
    2: 'The Humility and Exaltation of Christ',
    4: 'Rejoice Always: The Peace of God'
  },
  'Colossians': {
    1: 'The Supremacy of Christ',
    3: 'Put on the New Self'
  },
  '1 Thessalonians': {
    4: 'Living to Please God and The Lord\'s Coming',
    5: 'Pray Without Ceasing'
  },
  '2 Timothy': {
    1: 'A Spirit of Power, Love, and Self-Discipline',
    4: 'I Have Fought the Good Fight'
  },
  'Hebrews': {
    11: 'The Hall of Faith',
    12: 'Run with Perseverance the Race Set Before Us'
  },
  'James': {
    1: 'Faith and Wisdom in Trials',
    2: 'Faith Without Works Is Dead',
    3: 'Taming the Tongue'
  },
  '1 Peter': {
    1: 'A Living Hope',
    5: 'Cast All Your Anxiety on Him'
  },
  '1 John': {
    1: 'Walking in the Light',
    4: 'God Is Love'
  },
  'Revelation': {
    1: 'Vision of the Glorified Christ',
    21: 'A New Heaven and a New Earth',
    22: 'The River of Life: Jesus Is Coming'
  }
};

/**
 * Returns a human-friendly topic heading for any given Bible book and chapter.
 * If no famous heading is catalogued, generates a clean, respectful contextual title.
 */
export function getChapterHeading(book: string, chapter: number, rawSectionTitle?: string): string | null {
  const bookHeadings = FAMOUS_CHAPTER_HEADINGS[book];
  if (bookHeadings && bookHeadings[chapter]) {
    return bookHeadings[chapter];
  }

  // If the raw section title from the Bible API or YouVersion is a real topical title (not just "Book Chapter X")
  if (rawSectionTitle) {
    const isRedundant = rawSectionTitle.toLowerCase().trim() === `${book} ${chapter}`.toLowerCase().trim() ||
      rawSectionTitle.toLowerCase().trim() === `${book} chapter ${chapter}`.toLowerCase().trim();
    if (!isRedundant) {
      return rawSectionTitle;
    }
  }

  return null;
}
