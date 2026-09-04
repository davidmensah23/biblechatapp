/**
 * Canonical Biblical Chapter & Pericope Section Headings
 * Sourced directly from official translation editorial committees (NIV CBT, ESV, UBS).
 * Provides both:
 * 1. Primary Chapter Titles (displayed under the chapter numeral)
 * 2. Inline Pericope Section Sub-Headings (displayed directly above the verse where a topic changes)
 */

export interface ChapterPericopeData {
  title: string;
  sections?: Record<number, string>; // verseNumber -> Canonical section heading
}

const CANONICAL_PERICOPES: Record<string, Record<number, ChapterPericopeData>> = {
  'Genesis': {
    1: {
      title: 'The Creation of the World',
      sections: {
        1: 'The Creation of the Heavens and the Earth',
        3: 'The First Day: Light',
        6: 'The Second Day: Waters and Sky',
        9: 'The Third Day: Land and Vegetation',
        14: 'The Fourth Day: Sun, Moon, and Stars',
        20: 'The Fifth Day: Creatures of Sky and Sea',
        24: 'The Sixth Day: Living Creatures and Mankind in God\'s Image'
      }
    },
    2: {
      title: 'The Garden of Eden and the Sabbath',
      sections: {
        1: 'The Seventh Day of Rest',
        4: 'Adam and the Garden of Eden',
        18: 'The Creation of Woman'
      }
    },
    3: {
      title: 'The Fall of Humanity',
      sections: {
        1: 'The Temptation and the Fall',
        8: 'The Lord God Confronts Adam and Eve',
        14: 'The Judgment on the Serpent, the Woman, and the Man',
        21: 'The Expulsion from Eden'
      }
    },
    4: {
      title: 'Cain and Abel',
      sections: {
        1: 'Cain Murders Abel',
        17: 'The Descendants of Cain',
        25: 'The Birth of Seth'
      }
    },
    6: {
      title: 'Noah and the Ark of Safety',
      sections: {
        1: 'Wickedness in the Earth',
        9: 'Noah Builds the Ark'
      }
    },
    11: {
      title: 'The Tower of Babel',
      sections: {
        1: 'The Tower of Babel and Scattered Languages',
        10: 'From Shem to Abram'
      }
    },
    12: {
      title: 'The Call of Abram',
      sections: {
        1: 'The Call of Abram and God\'s Promise',
        10: 'Abram and Sarai in Egypt'
      }
    },
    15: {
      title: 'God\'s Covenant with Abram',
      sections: {
        1: 'The Promise of an Heir',
        7: 'The Covenant Sealed with Fire'
      }
    },
    22: {
      title: 'The Testing of Abraham on Mount Moriah',
      sections: {
        1: 'Abraham Tested with Isaac',
        15: 'The Covenant Reaffirmed'
      }
    },
    28: {
      title: 'Jacob\'s Ladder at Bethel',
      sections: {
        10: 'Jacob\'s Dream of the Ladder',
        18: 'The Pillar at Bethel'
      }
    },
    37: {
      title: 'Joseph Sold by His Brothers',
      sections: {
        1: 'Joseph\'s Dreams',
        12: 'Joseph Sold into Slavery in Egypt'
      }
    },
    50: {
      title: 'Joseph Comforts His Brothers',
      sections: {
        1: 'The Death and Burial of Jacob',
        15: 'Joseph Reassures His Brothers: God Intended It for Good',
        22: 'The Death of Joseph'
      }
    }
  },

  'Exodus': {
    3: {
      title: 'The Burning Bush and the Call of Moses',
      sections: {
        1: 'Moses and the Burning Bush',
        13: 'The Divine Name: I AM WHO I AM'
      }
    },
    12: {
      title: 'The First Passover and Exodus',
      sections: {
        1: 'The Passover Lamb Appointed',
        14: 'The Festival of Unleavened Bread',
        29: 'The Exodus Begins'
      }
    },
    14: {
      title: 'Crossing the Red Sea',
      sections: {
        1: 'Trapped at the Red Sea',
        15: 'The Waters Divided and Israel Delivered'
      }
    },
    20: {
      title: 'The Ten Commandments',
      sections: {
        1: 'The Ten Commandments',
        18: 'The People\'s Fear at Mount Sinai',
        22: 'Laws Concerning Altars'
      }
    },
    32: {
      title: 'The Golden Calf',
      sections: {
        1: 'The Golden Calf and Idolatry',
        15: 'Moses Breaks the Tablets and Intercedes'
      }
    },
    34: {
      title: 'The Radiance of Moses\' Face',
      sections: {
        1: 'The New Stone Tablets',
        29: 'The Radiant Face of Moses'
      }
    }
  },

  '2 Samuel': {
    7: {
      title: 'God\'s Covenant with David',
      sections: {
        1: 'God\'s Promise of an Eternal Dynasty',
        18: 'David\'s Prayer of Thanksgiving'
      }
    },
    11: {
      title: 'David and Bathsheba',
      sections: {
        1: 'David\'s Sin with Bathsheba',
        14: 'The Death of Uriah the Hittite'
      }
    },
    12: {
      title: 'Nathan Rebukes King David',
      sections: {
        1: 'Nathan\'s Parable of the Ewe Lamb',
        15: 'The Death of the Child',
        24: 'The Birth of Solomon'
      }
    },
    22: {
      title: 'David\'s Song of Deliverance',
      sections: {
        1: 'Praise for Deliverance from Enemies',
        21: 'The Lord Rewards the Righteous',
        31: 'God\'s Flawless Word and Sovereign Strength'
      }
    },
    23: {
      title: 'David\'s Last Words and Mighty Warriors',
      sections: {
        1: 'David\'s Last Words',
        8: 'David\'s Three Mighty Warriors',
        13: 'The Well of Bethlehem and the Poured Offering',
        18: 'Abishai and Benaiah',
        24: 'The Thirty Chiefs'
      }
    },
    24: {
      title: 'David\'s Census and the Lord\'s Mercy',
      sections: {
        1: 'David Enrolls the Fighting Men',
        10: 'The Plague and David\'s Repentance',
        18: 'David Builds an Altar at the Threshing Floor'
      }
    }
  },

  'Psalms': {
    1: {
      title: 'The Way of the Righteous and the Ungodly',
      sections: {
        1: 'The Blessed Man Placed by Streams of Water',
        4: 'The Ungodly Chaff'
      }
    },
    19: {
      title: 'The Heavens Declare God\'s Glory',
      sections: {
        1: 'The Witness of Creation',
        7: 'The Perfection of God\'s Law',
        12: 'Prayer for Cleansing and Acceptable Words'
      }
    },
    23: {
      title: 'The Lord Is My Shepherd',
      sections: {
        1: 'Green Pastures and Still Waters',
        4: 'Through the Valley of the Shadow of Death',
        5: 'The Anointed Table and Everlasting House'
      }
    },
    27: {
      title: 'The Lord Is My Light and Salvation',
      sections: {
        1: 'Confident Trust in the Face of Danger',
        7: 'Hear My Voice, O Lord: Wait Patiently'
      }
    },
    51: {
      title: 'A Broken and Contrite Heart',
      sections: {
        1: 'Prayer for Forgiveness and Cleansing',
        10: 'Create in Me a Clean Heart, O God',
        14: 'Sacrifices Acceptable to God'
      }
    },
    91: {
      title: 'Under the Shadow of the Almighty',
      sections: {
        1: 'Safety in the Secret Place',
        9: 'He Will Command His Angels Concerning You',
        14: 'The Lord\'s Promise of Deliverance'
      }
    },
    103: {
      title: 'Praise the Lord, O My Soul',
      sections: {
        1: 'Bless the Lord and Forget Not His Benefits',
        8: 'The Lord Is Compassionate and Gracious',
        19: 'His Dominion Rules Over All'
      }
    },
    119: {
      title: 'The Glories of God\'s Word',
      sections: {
        1: 'Aleph: The Blessed Way',
        9: 'Beth: Keeping Pure by God\'s Word',
        97: 'Mem: Oh, How I Love Your Law',
        105: 'Nun: A Lamp to My Feet and a Light to My Path'
      }
    }
  },

  'Matthew': {
    5: {
      title: 'The Sermon on the Mount: The Beatitudes',
      sections: {
        1: 'The Beatitudes',
        13: 'Salt and Light',
        17: 'The Fulfillment of the Law',
        21: 'Anger and Reconciliation',
        27: 'Adultery and Purity',
        33: 'Oaths and Truthfulness',
        38: 'Eye for an Eye and Turning the Other Cheek',
        43: 'Love for Enemies'
      }
    },
    6: {
      title: 'Kingdom Living: Prayer and Trust',
      sections: {
        1: 'Giving to the Needy',
        5: 'Prayer and The Lord\'s Prayer',
        16: 'Fasting with Humility',
        19: 'Treasures in Heaven',
        25: 'Do Not Worry: Seek First the Kingdom'
      }
    },
    7: {
      title: 'Judging Others and the Solid Rock',
      sections: {
        1: 'Judging Others and the Plank in the Eye',
        7: 'Ask, Seek, Knock',
        13: 'The Narrow and Wide Gates',
        15: 'A Tree and Its Fruit',
        24: 'The Wise and Foolish Builders'
      }
    },
    13: {
      title: 'The Parables of the Kingdom',
      sections: {
        1: 'The Parable of the Sower',
        18: 'The Sower Explained',
        24: 'The Parable of the Weeds',
        31: 'The Mustard Seed and the Yeast',
        44: 'The Hidden Treasure and the Pearl'
      }
    },
    26: {
      title: 'The Last Supper and Gethsemane',
      sections: {
        1: 'The Plot Against Jesus',
        6: 'Jesus Anointed at Bethany',
        17: 'The Lord\'s Supper Instituted',
        31: 'Jesus Predicts Peter\'s Denial',
        36: 'Gethsemane: Not My Will, but Yours',
        47: 'The Betrayal and Arrest of Jesus',
        57: 'Jesus Before the Sanhedrin'
      }
    },
    28: {
      title: 'The Resurrection and the Great Commission',
      sections: {
        1: 'The Resurrection of Jesus',
        11: 'The Guards\' Report',
        16: 'The Great Commission'
      }
    }
  },

  'Luke': {
    10: {
      title: 'The Good Samaritan and Mary and Martha',
      sections: {
        1: 'Jesus Sends Out the Seventy-Two',
        25: 'The Parable of the Good Samaritan',
        38: 'At the Home of Martha and Mary'
      }
    },
    15: {
      title: 'The Parables of Grace and the Lost',
      sections: {
        1: 'The Parable of the Lost Sheep',
        8: 'The Parable of the Lost Coin',
        11: 'The Parable of the Prodigal Son'
      }
    }
  },

  'John': {
    1: {
      title: 'The Word Became Flesh',
      sections: {
        1: 'The Word Became Flesh',
        19: 'John the Baptist Prepares the Way',
        29: 'The Lamb of God',
        35: 'The First Disciples Follow Jesus'
      }
    },
    14: {
      title: 'Comfort for Christ\'s Disciples',
      sections: {
        1: 'Jesus the Way to the Father',
        15: 'The Promise of the Holy Spirit',
        27: 'Peace I Leave with You'
      }
    },
    15: {
      title: 'The Vine and the Branches',
      sections: {
        1: 'The True Vine and the Fruitful Branches',
        9: 'Abide in My Love',
        18: 'The World\'s Hatred'
      }
    }
  },

  'Romans': {
    8: {
      title: 'Life in the Spirit and More Than Conquerors',
      sections: {
        1: 'No Condemnation Through the Spirit',
        12: 'Heirs of God with Christ',
        18: 'Present Suffering and Future Glory',
        28: 'God\'s Everlasting Purpose in Christ',
        31: 'More Than Conquerors in Christ Jesus'
      }
    },
    12: {
      title: 'Living Sacrifices and True Love',
      sections: {
        1: 'A Living Sacrifice to God',
        3: 'Humble Service in the Body of Christ',
        9: 'Marks of the True Christian'
      }
    }
  },

  '1 Corinthians': {
    12: {
      title: 'Spiritual Gifts in the Body of Christ',
      sections: {
        1: 'Concerning Spiritual Gifts',
        12: 'One Body, Many Members',
        27: 'The Variety of Ministries'
      }
    },
    13: {
      title: 'The Excellence of Christian Love',
      sections: {
        1: 'The Preeminence of Love',
        4: 'The Characteristics of Love',
        8: 'Love Never Fails and Abides Forever'
      }
    },
    15: {
      title: 'The Resurrection of Christ and the Dead',
      sections: {
        1: 'The Resurrection of Christ: Central to the Gospel',
        12: 'The Resurrection of the Dead',
        35: 'The Resurrection Body',
        50: 'Death Swallowed in Victory'
      }
    }
  },

  'Ephesians': {
    6: {
      title: 'Children, Parents, and the Whole Armor of God',
      sections: {
        1: 'Children and Parents',
        5: 'Slaves and Masters',
        10: 'The Whole Armor of God',
        21: 'Final Greetings and Benediction'
      }
    }
  },

  'Hebrews': {
    11: {
      title: 'The Hall of Faith',
      sections: {
        1: 'Faith in Action Defined',
        4: 'The Faith of Abel, Enoch, and Noah',
        8: 'The Faith of Abraham and Sarah',
        20: 'The Faith of the Patriarchs and Moses',
        32: 'Other Heroes of Faith'
      }
    },
    12: {
      title: 'Running the Race with Perseverance',
      sections: {
        1: 'Fixing Our Eyes on Jesus',
        4: 'God\'s Loving Discipline',
        18: 'The Heavenly Jerusalem and the Unshakable Kingdom'
      }
    }
  },

  'Revelation': {
    21: {
      title: 'A New Heaven and a New Earth',
      sections: {
        1: 'A New Heaven and a New Earth: God with Humanity',
        9: 'The Architectural Splendor of the New Jerusalem',
        22: 'The Lord and the Lamb Are Its Light'
      }
    },
    22: {
      title: 'The River of Life and Jesus Is Coming',
      sections: {
        1: 'The River and Tree of Life',
        7: 'Jesus Is Coming: The Final Warning and Benediction'
      }
    }
  }
};

import { isVernacularVersion } from './bibleBookTranslations';

/**
 * Returns the primary chapter title for display at the top under the chapter number.
 * When viewing a vernacular translation (such as Twi), English pericopes are suppressed
 * unless an authentic localized section title is available.
 */
export function getChapterHeading(
  book: string,
  chapter: number,
  rawSectionTitle?: string,
  translation?: string,
  language?: string
): string | null {
  const isVernacular = isVernacularVersion(translation, language);

  // If viewing vernacular (like Twi), do not display English pericope headers
  if (isVernacular) {
    if (rawSectionTitle) {
      const isRedundant =
        rawSectionTitle.toLowerCase().trim() === `${book} ${chapter}`.toLowerCase().trim() ||
        rawSectionTitle.toLowerCase().trim() === `${book} chapter ${chapter}`.toLowerCase().trim();
      if (!isRedundant) {
        return rawSectionTitle;
      }
    }
    return null;
  }

  const bookData = CANONICAL_PERICOPES[book];
  if (bookData && bookData[chapter]) {
    return bookData[chapter].title;
  }

  // If raw section title from Bible API or YouVersion is a real topical title (not just "Book Chapter X")
  if (rawSectionTitle) {
    const isRedundant =
      rawSectionTitle.toLowerCase().trim() === `${book} ${chapter}`.toLowerCase().trim() ||
      rawSectionTitle.toLowerCase().trim() === `${book} chapter ${chapter}`.toLowerCase().trim();
    if (!isRedundant) {
      return rawSectionTitle;
    }
  }

  return null;
}

/**
 * Returns canonical pericope section headings mapped by verse number for inline rendering.
 * Suppressed for vernacular versions (Twi, Pidgin, Yoruba, Igbo) so English headings don't clash.
 */
export function getChapterSections(
  book: string,
  chapter: number,
  translation?: string,
  language?: string
): Record<number, string> {
  if (isVernacularVersion(translation, language)) {
    return {};
  }

  const bookData = CANONICAL_PERICOPES[book];
  if (bookData && bookData[chapter] && bookData[chapter].sections) {
    return bookData[chapter].sections;
  }
  return {};
}

