import { getDB } from './database';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'pt' | 'tw' | 'sw';

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

// Multilingual Translations for Armor of God (Ephesians 6)
const LOCALIZED_ARMOR: Record<SupportedLanguage, Record<string, { name: string; decree: string; req: string }>> = {
  en: {
    belt_of_truth: {
      name: 'Belt of Truth',
      decree: '“Stand firm then, with the belt of truth buckled around your waist.” Now that you have acquired the Belt of Truth, remember always to wear it with sacred pride—truth anchors every thought and protects you from deception.',
      req: 'Engage in your first conversation with an Apostle'
    },
    breastplate_of_righteousness: {
      name: 'Breastplate of Righteousness',
      decree: '“With the breastplate of righteousness in place.” Guard your heart with all diligence. Your righteousness does not come from your own deeds, but from Christ who lives in you.',
      req: 'Read 3 chapters in the Holy Scriptures'
    },
    sandals_of_peace: {
      name: 'Sandals of the Gospel of Peace',
      decree: '“With your feet fitted with the readiness that comes from the gospel of peace.” Walk wherever the road takes you with eager feet, bringing reconciliation to weary hearts.',
      req: 'Maintain a 3-day walking devotion streak'
    },
    shield_of_faith: {
      name: 'Shield of Faith',
      decree: '“Take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one.” Hold it high whenever doubts whisper in the quiet.',
      req: 'Spend 5 minutes in deep reflection with Simon Peter'
    },
    helmet_of_salvation: {
      name: 'Helmet of Salvation',
      decree: '“Take the helmet of salvation.” Protect your mind from anxiety and despair. Your salvation is sealed by grace.',
      req: 'Complete a Sunday Sermon Workshop with Paul'
    },
    sword_of_the_spirit: {
      name: 'Sword of the Spirit',
      decree: '“Take the sword of the Spirit, which is the word of God.” The living Word is sharper than any double-edged sword.',
      req: 'Complete 10 Bible chapters and 5 Apostle chats'
    }
  },
  es: {
    belt_of_truth: {
      name: 'Cinturón de la Verdad',
      decree: '“Manténganse firmes, ceñidos con el cinturón de la verdad.” Ahora que tienes esto, llévalo con orgullo sagrado: la verdad sostiene cada pensamiento.',
      req: 'Inicia tu primera conversación con un Apóstol'
    },
    breastplate_of_righteousness: {
      name: 'Coraza de Justicia',
      decree: '“Protegidos por la coraza de justicia.” Guarda tu corazón con diligencia; tu justicia viene de Cristo.',
      req: 'Lee 3 capítulos de las Sagradas Escrituras'
    },
    sandals_of_peace: {
      name: 'Calzado del Evangelio de la Paz',
      decree: '“Calzados los pies con el celo por anunciar el evangelio de la paz.” Camina con pies dispuestos llevando reconciliación.',
      req: 'Mantén una racha de devoción de 3 días'
    },
    shield_of_faith: {
      name: 'Escudo de la Fe',
      decree: '“Tomen el escudo de la fe, con el que pueden apagar todas las flechas encendidas del maligno.”',
      req: 'Pasa 5 minutos en profunda reflexión con Simón Pedro'
    },
    helmet_of_salvation: {
      name: 'Casco de la Salvación',
      decree: '“Tomen el casco de la salvación.” Protege tu mente de la duda y la ansiedad; tu salvación está sellada por la gracia.',
      req: 'Completa un Taller de Sermón Dominical con Pablo'
    },
    sword_of_the_spirit: {
      name: 'Espada del Espíritu',
      decree: '“Tomen la espada del Espíritu, que es la palabra de Dios.” La Palabra viva es más cortante que toda espada de dos filos.',
      req: 'Completa 10 capítulos de la Biblia y 5 charlas con los Apóstoles'
    }
  },
  fr: {
    belt_of_truth: {
      name: 'Ceinture de la Vérité',
      decree: '« Tenez donc ferme : ayez à vos reins la vérité pour ceinture. » Portez-la avec dignité sacrée.',
      req: 'Commencez votre première conversation avec un Apôtre'
    },
    breastplate_of_righteousness: {
      name: 'Cuirasse de la Justice',
      decree: '« Revêtez la cuirasse de la justice. » Gardez votre cœur avec diligence, car votre justice vient du Christ.',
      req: 'Lisez 3 chapitres des Saintes Écritures'
    },
    sandals_of_peace: {
      name: 'Chaussures de l’Évangile de Paix',
      decree: '« Mettez pour chaussures à vos pieds le zèle que donne l’Évangile de paix. »',
      req: 'Maintenez une marche de dévotion de 3 jours'
    },
    shield_of_faith: {
      name: 'Bouclier de la Foi',
      decree: '« Prenez par-dessus tout cela le bouclier de la foi, avec lequel vous pourrez éteindre tous les traits enflammés du malin. »',
      req: 'Passez 5 minutes en réflexion avec Simon Pierre'
    },
    helmet_of_salvation: {
      name: 'Casque du Salut',
      decree: '« Prenez aussi le casque du salut. » Protégez votre esprit par l’espérance éternelle.',
      req: 'Complétez un atelier de prédication avec Paul'
    },
    sword_of_the_spirit: {
      name: 'Épée de l’Esprit',
      decree: '« Prenez l’épée de l’Esprit, qui est la parole de Dieu. » La Parole vivante est vivante et efficace.',
      req: 'Lisez 10 chapitres et discutez 5 fois avec les Apôtres'
    }
  },
  pt: {
    belt_of_truth: {
      name: 'Cinto da Verdade',
      decree: '“Fiquem firmes, cingindo-se com o cinto da verdade.” Vista-o com zelo sagrado.',
      req: 'Inicie sua primeira conversa com um Apóstolo'
    },
    breastplate_of_righteousness: {
      name: 'Couraça da Justiça',
      decree: '“Vestindo a couraça da justiça.” Guarde o seu coração; sua justiça provém de Cristo.',
      req: 'Leia 3 capítulos das Sagradas Escrituras'
    },
    sandals_of_peace: {
      name: 'Calçados do Evangelho da Paz',
      decree: '“Calçando os pés com a prontidão do evangelho da paz.” Leve esperança aos corações cansados.',
      req: 'Mantenha 3 dias de devoção contínua'
    },
    shield_of_faith: {
      name: 'Escudo da Fé',
      decree: '“Embraçando sempre o escudo da fé, com o qual podereis apagar todos os dardos inflamados do maligno.”',
      req: 'Passe 5 minutos em oração com Simão Pedro'
    },
    helmet_of_salvation: {
      name: 'Capacete da Salvação',
      decree: '“Tomai também o capacete da salvação.” Proteja a sua mente com a graça eterna.',
      req: 'Complete a Oficina de Sermão com Paulo'
    },
    sword_of_the_spirit: {
      name: 'Espada do Espírito',
      decree: '“E a espada do Espírito, que é a palavra de Deus.”',
      req: 'Complete 10 capítulos da Bíblia e 5 conversas'
    }
  },
  tw: {
    belt_of_truth: {
      name: 'Nokware Abɔso',
      decree: '“Enti munnyina pintinn na mommɔ nokware abɔso.” Fa ahobraseɛ ne anigyeɛ bɔ wo asene daa.',
      req: 'Di nkɔmmɔ a ɛdi kan ne Asomafoɔ no mu baako'
    },
    breastplate_of_righteousness: {
      name: 'Tenenee Dade Akatabo',
      decree: '“Monhyɛ tenenee dade akatabo.” Kora wo koma so yie, na wo tenenee firi Kristo.',
      req: 'Kenkan Kyerɛwsronkron ti mmiɛnsa'
    },
    sandals_of_peace: {
      name: 'Asomdwoe Asɛmpa Mpaboa',
      decree: '“Momfa asomdwoe asɛmpa no ahosiesie nhyɛ mo nan mu.” Kɔ baabiara kɔka asomdwoe ho asɛm.',
      req: 'Yɛ mpaebɔ nnafua mmiɛnsa a ɛtoatoa so'
    },
    shield_of_faith: {
      name: 'Gyidi Kyɛm',
      decree: '“Montoaso mfa gyidi kyɛm a mobɛtumi de adum ɔbɔnefoɔ no agyan a ɛredɛw nyinaa.”',
      req: 'Di simma 5 nkɔmmɔ kɔkɔɔkɔ ne Simon Petro'
    },
    helmet_of_salvation: {
      name: 'Nkwagye Dade Kyɛw',
      decree: '“Monnye nkwagye dade kyɛw no.” Bɔ w’adwene ho ban firi awerɛhoo ne ehu mu.',
      req: 'Wie Asɛnka Dwumadie ne Paulo'
    },
    sword_of_the_spirit: {
      name: 'Honhom no Nkrante',
      decree: '“Monnye Honhom no nkrante a ɛne Onyankopɔn asɛm no.”',
      req: 'Kenkan Kyerɛwsronkron ti 10 na kasa kyerɛ Asomafoɔ no mprɛn 5'
    }
  },
  sw: {
    belt_of_truth: {
      name: 'Mshipi wa Kweli',
      decree: '“Basi simameni, huku mmejifunga kweli viunoni.” Vaa kweli kwa unyenyekevu na heshima.',
      req: 'Anza mazungumzo yako ya kwanza na Mtume'
    },
    breastplate_of_righteousness: {
      name: 'Dirii ya Haki',
      decree: '“Mmevaa dirii ya haki kifuani.” Linda moyo wako kwa maana haki yako inatoka kwa Kristo.',
      req: 'Soma sura 3 za Maandiko Matakatifu'
    },
    sandals_of_peace: {
      name: 'Viatu vya Injili ya Amani',
      decree: '“Mkiwa mmevaa miguuni utayari wa Injili ya amani.” Enenda kwa furaha ukileta amani.',
      req: 'Dumisha siku 3 za matembezi ya kiroho'
    },
    shield_of_faith: {
      name: 'Ngao ya Imani',
      decree: '“Zaidi ya yote, mkiitwaa ngao ya imani, ambayo kwa hiyo mtaweza kuizima mishale yote yenye moto ya yule mwovu.”',
      req: 'Tumia dakika 5 katika tafakuri nzito na Simoni Petro'
    },
    helmet_of_salvation: {
      name: 'Chapeo ya Wokovu',
      decree: '“Tena ipokeeni chapeo ya wokovu.” Linda mawazo yako kwa matumaini ya uzima wa milele.',
      req: 'Kamilisha Semina ya Mahubiri ya Jumapili na Paulo'
    },
    sword_of_the_spirit: {
      name: 'Upanga wa Roho',
      decree: '“Na upanga wa Roho ambao ni neno la Mungu.” Neno la Mungu ni hai tena lina nguvu.',
      req: 'Kamilisha sura 10 za Biblia na mazungumzo 5 na Mitume'
    }
  }
};

export const getLocalizedArmorPieces = (lang: SupportedLanguage = 'en'): ArmorPiece[] => {
  const dictionary = LOCALIZED_ARMOR[lang] || LOCALIZED_ARMOR.en;

  return [
    {
      id: 'belt_of_truth',
      name: dictionary.belt_of_truth.name,
      scriptureRef: 'Ephesians 6:14',
      category: 'armor',
      iconName: 'ribbon-outline',
      color: '#3B82F6',
      isEquipped: true,
      isUnlocked: true,
      lessonDecree: dictionary.belt_of_truth.decree,
      requirement: dictionary.belt_of_truth.req,
      progress: 1,
      maxProgress: 1,
      xpValue: 80
    },
    {
      id: 'breastplate_of_righteousness',
      name: dictionary.breastplate_of_righteousness.name,
      scriptureRef: 'Ephesians 6:14',
      category: 'armor',
      iconName: 'shield-outline',
      color: '#E11D48',
      isEquipped: true,
      isUnlocked: true,
      lessonDecree: dictionary.breastplate_of_righteousness.decree,
      requirement: dictionary.breastplate_of_righteousness.req,
      progress: 3,
      maxProgress: 3,
      xpValue: 100
    },
    {
      id: 'sandals_of_peace',
      name: dictionary.sandals_of_peace.name,
      scriptureRef: 'Ephesians 6:15',
      category: 'armor',
      iconName: 'footsteps-outline',
      color: '#059669',
      isEquipped: true,
      isUnlocked: true,
      lessonDecree: dictionary.sandals_of_peace.decree,
      requirement: dictionary.sandals_of_peace.req,
      progress: 3,
      maxProgress: 3,
      xpValue: 90
    },
    {
      id: 'shield_of_faith',
      name: dictionary.shield_of_faith.name,
      scriptureRef: 'Ephesians 6:16',
      category: 'armor',
      iconName: 'shield-checkmark-outline',
      color: '#D97706',
      isEquipped: false,
      isUnlocked: false,
      lessonDecree: dictionary.shield_of_faith.decree,
      requirement: dictionary.shield_of_faith.req,
      progress: 3,
      maxProgress: 5,
      xpValue: 120
    },
    {
      id: 'helmet_of_salvation',
      name: dictionary.helmet_of_salvation.name,
      scriptureRef: 'Ephesians 6:17',
      category: 'armor',
      iconName: 'construct-outline',
      color: '#7C3AED',
      isEquipped: false,
      isUnlocked: false,
      lessonDecree: dictionary.helmet_of_salvation.decree,
      requirement: dictionary.helmet_of_salvation.req,
      progress: 1,
      maxProgress: 2,
      xpValue: 150
    },
    {
      id: 'sword_of_the_spirit',
      name: dictionary.sword_of_the_spirit.name,
      scriptureRef: 'Ephesians 6:17',
      category: 'armor',
      iconName: 'flash-outline',
      color: '#0284C7',
      isEquipped: false,
      isUnlocked: false,
      lessonDecree: dictionary.sword_of_the_spirit.decree,
      requirement: dictionary.sword_of_the_spirit.req,
      progress: 4,
      maxProgress: 10,
      xpValue: 200
    }
  ];
};

export const ARMOR_PIECES = getLocalizedArmorPieces('en');

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
