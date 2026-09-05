export interface GlossaryEntry {
  term: string;
  category: 'greek' | 'hebrew' | 'historical_idiom' | 'roman_custom' | 'jewish_custom';
  originLabel: string;
  definition: string;
  exampleContext?: string;
}

export const BIBLICAL_GLOSSARY: Record<string, GlossaryEntry> = {
  // --- ROMAN & HISTORICAL IDIOMS ---
  gavel: {
    term: 'Gavel',
    category: 'roman_custom',
    originLabel: 'Ancient Legal Practice',
    definition: 'A small wooden mallet struck by a judge or magistrate to signal an official, irreversible judicial verdict.',
    exampleContext: 'In Roman courts, the strike of the gavel declared a sentence final.'
  },
  'banging his gavel': {
    term: 'Banging His Gavel',
    category: 'roman_custom',
    originLabel: 'Ancient Legal Practice',
    definition: 'A vivid picture of a judge delivering a binding, formal verdict of guilty or acquitted.',
    exampleContext: 'Symbolizes an official legal ruling that cannot be overturned.'
  },
  sanhedrin: {
    term: 'Sanhedrin',
    category: 'jewish_custom',
    originLabel: 'Jewish Supreme Council',
    definition: 'The 71-member ruling supreme court and legislative body of ancient Jerusalem, composed of chief priests, elders, and scribes.',
    exampleContext: 'The highest religious authority in 1st-century Judea under Roman oversight.'
  },
  denarius: {
    term: 'Denarius',
    category: 'roman_custom',
    originLabel: 'Roman Imperial Coin',
    definition: 'A standard Roman silver coin bearing Caesar’s image, representing a full day’s typical wage for a working laborer.',
    exampleContext: 'Two hundred denarii was equivalent to eight months of hard labor.'
  },
  stater: {
    term: 'Stater',
    category: 'roman_custom',
    originLabel: 'Greek & Roman Coin',
    definition: 'A valuable silver coin worth four drachmas, exactly enough to pay the annual Temple tax for two people (Matthew 17:27).',
    exampleContext: 'Found in the mouth of the fish by Peter to pay the Temple tax.'
  },
  publican: {
    term: 'Publican',
    category: 'roman_custom',
    originLabel: 'Roman Tax Collector',
    definition: 'A Jewish contractor hired by the Roman empire to extract customs tolls from fellow Jews, widely despised as traitors and extortionists.',
    exampleContext: 'Matthew sat at the publican tollbooth before following Christ.'
  },
  'tax booth': {
    term: 'Tax Booth',
    category: 'roman_custom',
    originLabel: 'Capernaum Toll Station',
    definition: 'A Roman checkpoint situated along major trade routes (like the Via Maris) to levy taxes on fish, grain, and travel goods.',
    exampleContext: 'The customs booth where Matthew collected tolls for Herod Antipas.'
  },
  'via maris': {
    term: 'Via Maris',
    category: 'historical_idiom',
    originLabel: 'Ancient Trade Highway',
    definition: 'The historic "Way of the Sea" connecting Egypt, Galilee, and Damascus, heavily guarded by Roman garrisons and tax stations.',
    exampleContext: 'The busy international highway passing directly through Capernaum.'
  },
  praetorium: {
    term: 'Praetorium',
    category: 'roman_custom',
    originLabel: 'Roman Governor’s Palace',
    definition: 'The official headquarters and judicial hall of the Roman military governor (like Pontius Pilate) in Jerusalem.',
    exampleContext: 'Where Jesus was interrogated by Pilate and mocked by Roman soldiers.'
  },
  patmos: {
    term: 'Patmos',
    category: 'historical_idiom',
    originLabel: 'Aegean Penal Island',
    definition: 'A barren, rocky island in the Aegean Sea used as a harsh Roman penal colony for political and religious exiles.',
    exampleContext: 'Where the apostle John was exiled under Emperor Domitian.'
  },
  'fig tree': {
    term: 'Fig Tree',
    category: 'jewish_custom',
    originLabel: 'Rabbinic Idiom',
    definition: 'In 1st-century Judea, "sitting under the fig tree" was a cultural idiom for quiet, solitary prayer and deep study of the Torah.',
    exampleContext: 'Where Jesus saw Nathanael in prayer before Philip called him.'
  },
  'mercy seat': {
    term: 'Mercy Seat (Kapporeth)',
    category: 'jewish_custom',
    originLabel: 'Tabernacle & Temple',
    definition: 'The solid gold cover of the Ark of the Covenant, where the High Priest sprinkled blood once a year on Yom Kippur for the atonement of sins.',
    exampleContext: 'Paul calls Christ our true Mercy Seat (Hilasterion) in Romans 3:25.'
  },
  'charcoal fire': {
    term: 'Charcoal Fire',
    category: 'historical_idiom',
    originLabel: 'Biblical Setting',
    definition: 'Occurs only twice in the New Testament: where Peter denied Jesus (John 18:18), and where the Risen Jesus lovingly restored Peter with roasted fish (John 21:9).',
    exampleContext: 'The scent of burning charcoal tied Peter’s deepest failure to his deepest restoration.'
  },

  // --- ORIGINAL KOINE GREEK TERMS ---
  katakrima: {
    term: 'Katakrima',
    category: 'greek',
    originLabel: 'Koine Greek (κατάκριμα)',
    definition: 'A Roman judicial legal term referring to both the formal guilty verdict AND the immediate execution of the criminal punishment.',
    exampleContext: 'Romans 8:1 — In Christ, there is neither the guilty verdict nor the penalty.'
  },
  agape: {
    term: 'Agape',
    category: 'greek',
    originLabel: 'Koine Greek (ἀγάπη)',
    definition: 'Unconditional, self-giving, covenant love driven by deliberate choice rather than fleeting feelings, demonstrated supremely at the Cross.',
    exampleContext: 'Distinct from brotherly affection (phileo) or family affection (storge).'
  },
  phileo: {
    term: 'Phileo',
    category: 'greek',
    originLabel: 'Koine Greek (φιλέω)',
    definition: 'Warm, affectionate brotherly love and deep emotional friendship among trusted companions.',
    exampleContext: 'Used in John 21 when Peter replied to Jesus by the Galilean shore.'
  },
  logos: {
    term: 'Logos',
    category: 'greek',
    originLabel: 'Koine Greek (λόγος)',
    definition: 'The eternal Word of God—not just a philosophical cosmic idea, but the living Person of Jesus Christ who reveals the Father.',
    exampleContext: 'John 1:1 — "In the beginning was the Word (Logos)..."'
  },
  eskenosen: {
    term: 'Eskēnōsen',
    category: 'greek',
    originLabel: 'Koine Greek (ἐσκήνωσεν)',
    definition: 'Literally "pitched His tent" or tabernacled among us, echoing the Shekinah presence of God dwelling inside the wilderness tent.',
    exampleContext: 'John 1:14 — "And the Word became flesh and tabernacled among us."'
  },
  zoe: {
    term: 'Zōē Aiōnios',
    category: 'greek',
    originLabel: 'Koine Greek (ζωὴ αἰώνιος)',
    definition: 'Eternal life—not just endless time, but the very quality of divine, uncreated life overflowing from God into the human spirit.',
    exampleContext: 'Contrasted with biological mortal life (bios).'
  },
  meno: {
    term: 'Menō',
    category: 'greek',
    originLabel: 'Koine Greek (μένω)',
    definition: 'To abide, remain, and dwell continuously; rooted like a branch drinking sap from the vine without detachment.',
    exampleContext: 'John 15:4 — "Abide in Me, and I in you."'
  },
  hypomone: {
    term: 'Hypomonē',
    category: 'greek',
    originLabel: 'Koine Greek (ὑπομονή)',
    definition: 'Steadfast endurance—literally "remaining under" a crushing load without breaking, running away, or losing faith.',
    exampleContext: 'James 1:3 — "The testing of your faith produces steadfast endurance."'
  },
  epiripsantes: {
    term: 'Epiripsantes',
    category: 'greek',
    originLabel: 'Koine Greek (ἐπιρίψαντες)',
    definition: 'A decisive, once-for-all hurling or casting of a heavy burden off your own back onto someone else’s shoulders.',
    exampleContext: '1 Peter 5:7 — "Hurling all your anxieties upon Him, because He cares for you."'
  },
  koinonia: {
    term: 'Koinonia',
    category: 'greek',
    originLabel: 'Koine Greek (κοινωνία)',
    definition: 'Deep joint-participation, shared life, and mutual covenant partnership—far beyond casual socializing.',
    exampleContext: 'Acts 2:42 — The early believers devoted themselves to fellowship and communion.'
  },
  dikaiosyne: {
    term: 'Dikaiosynē',
    category: 'greek',
    originLabel: 'Koine Greek (δικαιοσύνη)',
    definition: 'Righteousness / Justification—God’s sovereign legal declaration that a sinner is innocent and accepted solely on Christ’s merits.',
    exampleContext: 'Romans 3:21 — The righteousness of God manifested through faith in Jesus Christ.'
  },
  hilasterion: {
    term: 'Hilastērion',
    category: 'greek',
    originLabel: 'Koine Greek (ἱλαστήριον)',
    definition: 'The place of propitiation / the Mercy Seat where the wrath of God against sin is satisfied by the blood of Christ.',
    exampleContext: 'Romans 3:25 — "Whom God put forward as a propitiation by His blood."'
  },
  sarx: {
    term: 'Sarx',
    category: 'greek',
    originLabel: 'Koine Greek (σάρξ)',
    definition: 'Fallen human nature living in autonomous self-reliance and rebellion against God, distinct from mere physical muscle.',
    exampleContext: 'Romans 8:8 — "Those who are in the flesh cannot please God."'
  },
  pneuma: {
    term: 'Pneuma',
    category: 'greek',
    originLabel: 'Koine Greek (πνεῦμα)',
    definition: 'The Holy Spirit / holy breath of God that imparts divine life, guidance, and power to the believer’s reborn spirit.',
    exampleContext: 'Romans 8:9 — "You are not in the flesh but in the Spirit, if the Spirit of God dwells in you."'
  },
  parakletos: {
    term: 'Paraklētos',
    category: 'greek',
    originLabel: 'Koine Greek (παράκλητος)',
    definition: 'The Advocate / Comforter—literally "one summoned alongside to help", acting as a defense attorney, protector, and coach.',
    exampleContext: 'John 14:16 — Jesus promised the Holy Spirit as another Paraclete.'
  },
  pleroo: {
    term: 'Plēroō',
    category: 'greek',
    originLabel: 'Koine Greek (πληρόω)',
    definition: 'To fill to the brim, complete, or bring to full intended climax—not abolishing, but actualizing the promise.',
    exampleContext: 'Matthew 5:17 — "I came not to destroy the Law, but to fulfill it."'
  },
  boanerges: {
    term: 'Boanerges',
    category: 'greek',
    originLabel: 'Aramaic / Greek (Βοανηργές)',
    definition: '"Sons of Thunder" (*B’nei Regesh* in Aramaic)—the nickname Jesus gave James and John for their fiery, impetuous zeal.',
    exampleContext: 'Mark 3:17 — Purified through discipleship into holy self-sacrificing endurance.'
  },
  'artous krithinous': {
    term: 'Artous Krithinous',
    category: 'greek',
    originLabel: 'Koine Greek (ἄρτους κριθίνους)',
    definition: 'Coarse barley loaves—the everyday, humble bread of poor peasants, considered food for animals or impoverished families.',
    exampleContext: 'John 6:9 — The small boy’s five barley loaves multiplied by Jesus to feed thousands.'
  },
  doulos: {
    term: 'Doulos',
    category: 'greek',
    originLabel: 'Koine Greek (δοῦλος)',
    definition: 'A bondservant or slave who belongs wholly to his master by covenant devotion, viewed as the highest title of honor by Paul.',
    exampleContext: 'Romans 1:1 — "Paul, a bondservant of Christ Jesus."'
  },

  // --- ORIGINAL BIBLICAL HEBREW TERMS ---
  shalom: {
    term: 'Shalom',
    category: 'hebrew',
    originLabel: 'Biblical Hebrew (שָׁלוֹם)',
    definition: 'Complete wholeness, flourishing, and harmony in every dimension of life—where nothing is broken and nothing is missing.',
    exampleContext: 'Far greater than mere quietness or the temporary absence of military warfare.'
  },
  chesed: {
    term: 'Chesed',
    category: 'hebrew',
    originLabel: 'Biblical Hebrew (חֶסֶד)',
    definition: 'God’s unfailing covenant love, fierce loyal devotion, and steadfast mercy that never gives up on His people.',
    exampleContext: 'Hosea 6:6 / Matthew 9:13 — "I desire steadfast love and not sacrifice."'
  },
  emunah: {
    term: '’Emunah',
    category: 'hebrew',
    originLabel: 'Biblical Hebrew (אֱמוּנָה)',
    definition: 'Relational faithfulness and steadfast firmness rooted in God’s character, rather than blind emotional optimism.',
    exampleContext: 'Habakkuk 2:4 — "The righteous shall live by his faith / steadfastness."'
  }
};

/**
 * Searches the glossary for a matching term (case-insensitive, exact or stem match).
 */
export const findGlossaryTerm = (wordOrPhrase: string): GlossaryEntry | null => {
  if (!wordOrPhrase) return null;
  const clean = wordOrPhrase.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (BIBLICAL_GLOSSARY[clean]) {
    return BIBLICAL_GLOSSARY[clean];
  }

  for (const key of Object.keys(BIBLICAL_GLOSSARY)) {
    const entry = BIBLICAL_GLOSSARY[key];
    if (entry.term.toLowerCase() === clean) {
      return entry;
    }
  }

  if (clean.startsWith('katakrim')) return BIBLICAL_GLOSSARY.katakrima;
  if (clean.startsWith('gavel')) return BIBLICAL_GLOSSARY.gavel;
  if (clean.startsWith('denari')) return BIBLICAL_GLOSSARY.denarius;
  if (clean.startsWith('eskenos')) return BIBLICAL_GLOSSARY.eskenosen;
  if (clean.startsWith('epirip')) return BIBLICAL_GLOSSARY.epiripsantes;
  if (clean.startsWith('hypomon')) return BIBLICAL_GLOSSARY.hypomone;
  if (clean.startsWith('koinoni')) return BIBLICAL_GLOSSARY.koinonia;
  if (clean.startsWith('hilaster')) return BIBLICAL_GLOSSARY.hilasterion;
  if (clean.startsWith('dikaios')) return BIBLICAL_GLOSSARY.dikaiosyne;
  if (clean.startsWith('paraklet')) return BIBLICAL_GLOSSARY.parakletos;
  if (clean.startsWith('boanerg')) return BIBLICAL_GLOSSARY.boanerges;
  if (clean.startsWith('sanhedrin')) return BIBLICAL_GLOSSARY.sanhedrin;
  if (clean.startsWith('publican')) return BIBLICAL_GLOSSARY.publican;
  if (clean.startsWith('praetori')) return BIBLICAL_GLOSSARY.praetorium;
  if (clean.startsWith('shalom')) return BIBLICAL_GLOSSARY.shalom;
  if (clean.startsWith('chesed') || clean.startsWith('hesed')) return BIBLICAL_GLOSSARY.chesed;
  if (clean.startsWith('emunah')) return BIBLICAL_GLOSSARY.emunah;

  return null;
};
