/**
 * Biblical Book Names Localization Map
 * Supports Asante/Akuapem Twi (Ghana), Spanish, French, Portuguese, Swahili, Yoruba, Igbo, and Pidgin.
 */

export interface BookLocalization {
  tw: string;    // Twi (Ghana)
  es?: string;   // Spanish
  fr?: string;   // French
  pt?: string;   // Portuguese
  sw?: string;   // Swahili
  yo?: string;   // Yoruba
  ig?: string;   // Igbo
}

export const BIBLE_BOOK_LOCALIZATIONS: Record<string, BookLocalization> = {
  // Old Testament (39)
  'Genesis': { tw: 'Mfifiesɛm', es: 'Génesis', fr: 'Genèse', pt: 'Gênesis', sw: 'Mwanzo', yo: 'Gẹnẹsisi', ig: 'Jenesis' },
  'Exodus': { tw: 'Eksodus', es: 'Éxodo', fr: 'Exode', pt: 'Êxodo', sw: 'Kutoka', yo: 'Eksodu', ig: 'Ọpụpụ' },
  'Leviticus': { tw: 'Lewitiko', es: 'Levítico', fr: 'Lévitique', pt: 'Levítico', sw: 'Mambo ya Walawi', yo: 'Lefitiku', ig: 'Levitikọs' },
  'Numbers': { tw: 'Akontabuo', es: 'Números', fr: 'Nombres', pt: 'Números', sw: 'Hesabu', yo: 'Awọn Nọmba', ig: 'Ọnụọgụgụ' },
  'Deuteronomy': { tw: 'Deuteronomium', es: 'Deuteronomio', fr: 'Deutéronome', pt: 'Deuteronômio', sw: 'Kumbukumbu la Torati', yo: 'Deuteronomi', ig: 'Diuterọnọmi' },
  'Joshua': { tw: 'Yosua', es: 'Josué', fr: 'Josué', pt: 'Josué', sw: 'Yoshua', yo: 'Joṣua', ig: 'Jọshụa' },
  'Judges': { tw: 'Atemmufoɔ', es: 'Jueces', fr: 'Juges', pt: 'Juízes', sw: 'Waamuzi', yo: 'Awọn Onidajọ', ig: 'Ndị Ikpe' },
  'Ruth': { tw: 'Rut', es: 'Rut', fr: 'Ruth', pt: 'Rute', sw: 'Ruthi', yo: 'Ruti', ig: 'Rut' },
  '1 Samuel': { tw: '1 Samuel', es: '1 Samuel', fr: '1 Samuel', pt: '1 Samuel', sw: '1 Samweli', yo: '1 Samuẹli', ig: '1 Samuel' },
  '2 Samuel': { tw: '2 Samuel', es: '2 Samuel', fr: '2 Samuel', pt: '2 Samuel', sw: '2 Samweli', yo: '2 Samuẹli', ig: '2 Samuel' },
  '1 Kings': { tw: '1 Ahemfo', es: '1 Reyes', fr: '1 Rois', pt: '1 Reis', sw: '1 Wafalme', yo: '1 Awọn Ọba', ig: '1 Ndị Eze' },
  '2 Kings': { tw: '2 Ahemfo', es: '2 Reyes', fr: '2 Rois', pt: '2 Reis', sw: '2 Wafalme', yo: '2 Awọn Ọba', ig: '2 Ndị Eze' },
  '1 Chronicles': { tw: '1 Berɛsosɛm', es: '1 Crónicas', fr: '1 Chroniques', pt: '1 Crônicas', sw: '1 Mambo ya Nyakati', yo: '1 Kronika', ig: '1 Ihe E Mere' },
  '2 Chronicles': { tw: '2 Berɛsosɛm', es: '2 Crónicas', fr: '2 Chroniques', pt: '2 Crônicas', sw: '2 Mambo ya Nyakati', yo: '2 Kronika', ig: '2 Ihe E Mere' },
  'Ezra': { tw: 'Esra', es: 'Esdras', fr: 'Esdras', pt: 'Esdras', sw: 'Ezra', yo: 'Esra', ig: 'Ezra' },
  'Nehemiah': { tw: 'Nehemia', es: 'Nehemías', fr: 'Néhémie', pt: 'Neemias', sw: 'Nehemia', yo: 'Nehemiah', ig: 'Nehemaya' },
  'Esther': { tw: 'Ester', es: 'Ester', fr: 'Esther', pt: 'Ester', sw: 'Esta', yo: 'Esteri', ig: 'Esta' },
  'Job': { tw: 'Hiob', es: 'Job', fr: 'Job', pt: 'Jó', sw: 'Ayubu', yo: 'Jobu', ig: 'Job' },
  'Psalms': { tw: 'Nnwom', es: 'Salmos', fr: 'Psaumes', pt: 'Salmos', sw: 'Zaburi', yo: 'Saamu', ig: 'Abụ Ọma' },
  'Proverbs': { tw: 'Mmɛbusɛm', es: 'Proverbios', fr: 'Proverbes', pt: 'Provérbios', sw: 'Mithali', yo: 'Owe', ig: 'Ilu' },
  'Ecclesiastes': { tw: 'Ɔsɛnkafoɔ', es: 'Eclesiastés', fr: 'Ecclésiaste', pt: 'Eclesiastes', sw: 'Mhubiri', yo: 'Oniwaasu', ig: 'Eklisiastis' },
  'Song of Solomon': { tw: 'Solomon Nnwom', es: 'Cantares', fr: 'Cantique des Cantiques', pt: 'Cânticos', sw: 'Wimbo Ulio Bora', yo: 'Orin Solomoni', ig: 'Abụ nke Solomọn' },
  'Isaiah': { tw: 'Yesaia', es: 'Isaías', fr: 'Ésaïe', pt: 'Isaías', sw: 'Isaya', yo: 'Woli Isaiah', ig: 'Aịzaya' },
  'Jeremiah': { tw: 'Yeremia', es: 'Jeremías', fr: 'Jérémie', pt: 'Jeremias', sw: 'Yeremia', yo: 'Woli Jeremiah', ig: 'Jeremaya' },
  'Lamentations': { tw: 'Kwadwom', es: 'Lamentaciones', fr: 'Lamentations', pt: 'Lamentações', sw: 'Maombolezo', yo: 'Ẹkun Jeremiah', ig: 'Kwa Akwa' },
  'Ezekiel': { tw: 'Hesekiel', es: 'Ezequiel', fr: 'Ézéchiel', pt: 'Ezequiel', sw: 'Ezekieli', yo: 'Esekieli', ig: 'Izikiel' },
  'Daniel': { tw: 'Daniel', es: 'Daniel', fr: 'Daniel', pt: 'Daniel', sw: 'Danieli', yo: 'Daniẹli', ig: 'Daniel' },
  'Hosea': { tw: 'Hosea', es: 'Oseas', fr: 'Osée', pt: 'Oséias', sw: 'Hosea', yo: 'Hosea', ig: 'Hosia' },
  'Joel': { tw: 'Yoel', es: 'Joel', fr: 'Joël', pt: 'Joel', sw: 'Yoeli', yo: 'Joẹli', ig: 'Joel' },
  'Amos': { tw: 'Amos', es: 'Amós', fr: 'Amos', pt: 'Amós', sw: 'Amosi', yo: 'Amosi', ig: 'Emọs' },
  'Obadiah': { tw: 'Obadia', es: 'Abdías', fr: 'Abdias', pt: 'Obadias', sw: 'Obadia', yo: 'Obadiah', ig: 'Obadaya' },
  'Jonah': { tw: 'Yona', es: 'Jonás', fr: 'Jonas', pt: 'Jonas', sw: 'Yona', yo: 'Jona', ig: 'Jona' },
  'Micah': { tw: 'Mika', es: 'Miqueas', fr: 'Michée', pt: 'Miquéias', sw: 'Mika', yo: 'Mika', ig: 'Maịka' },
  'Nahum': { tw: 'Nahum', es: 'Nahúm', fr: 'Nahum', pt: 'Naum', sw: 'Nahumu', yo: 'Nahumu', ig: 'Nehụm' },
  'Habakkuk': { tw: 'Habakuk', es: 'Habacuc', fr: 'Habacuc', pt: 'Habacuque', sw: 'Habakuki', yo: 'Habakkuku', ig: 'Habakọk' },
  'Zephaniah': { tw: 'Sefania', es: 'Sofonías', fr: 'Sophonie', pt: 'Sofonias', sw: 'Sefania', yo: 'Sefaniah', ig: 'Zefanaya' },
  'Haggai': { tw: 'Hagai', es: 'Hageo', fr: 'Aggée', pt: 'Ageu', sw: 'Hagai', yo: 'Haggai', ig: 'Hagaị' },
  'Zechariah': { tw: 'Sakaria', es: 'Zacarías', fr: 'Zacharie', pt: 'Zacarias', sw: 'Zekaria', yo: 'Sekariah', ig: 'Zekaraya' },
  'Malachi': { tw: 'Malaki', es: 'Malaquías', fr: 'Malachie', pt: 'Malaquias', sw: 'Malaki', yo: 'Malaki', ig: 'Malakaị' },

  // New Testament (27)
  'Matthew': { tw: 'Mateo', es: 'Mateo', fr: 'Matthieu', pt: 'Mateus', sw: 'Mathayo', yo: 'Matiu', ig: 'Matiyu' },
  'Mark': { tw: 'Marko', es: 'Marcos', fr: 'Marc', pt: 'Marcos', sw: 'Marko', yo: 'Maku', ig: 'Mak' },
  'Luke': { tw: 'Luka', es: 'Lucas', fr: 'Luc', pt: 'Lucas', sw: 'Luka', yo: 'Luku', ig: 'Luk' },
  'John': { tw: 'Yohane', es: 'Juan', fr: 'Jean', pt: 'João', sw: 'Yohana', yo: 'Jọn', ig: 'Jọn' },
  'Acts': { tw: 'Asomafoɔ Nnwuma', es: 'Hechos', fr: 'Actes', pt: 'Atos', sw: 'Matendo ya Mitume', yo: 'Iṣe Awọn Apọsteli', ig: 'Ọrụ Ndị Ozi' },
  'Romans': { tw: 'Romafoɔ', es: 'Romanos', fr: 'Romains', pt: 'Romanos', sw: 'Warumi', yo: 'Romu', ig: 'Ndị Rom' },
  '1 Corinthians': { tw: '1 Korintofoɔ', es: '1 Corintios', fr: '1 Corinthiens', pt: '1 Coríntios', sw: '1 Wakorintho', yo: '1 Kọrinti', ig: '1 Ndị Kọrint' },
  '2 Corinthians': { tw: '2 Korintofoɔ', es: '2 Corintios', fr: '2 Corinthiens', pt: '2 Coríntios', sw: '2 Wakorintho', yo: '2 Kọrinti', ig: '2 Ndị Kọrint' },
  'Galatians': { tw: 'Galatifoɔ', es: 'Gálatas', fr: 'Galates', pt: 'Gálatas', sw: 'Wagalatia', yo: 'Galatia', ig: 'Ndị Galetia' },
  'Ephesians': { tw: 'Efesofoɔ', es: 'Efesios', fr: 'Éphésiens', pt: 'Efésios', sw: 'Waefeso', yo: 'Efesu', ig: 'Ndị Efesọs' },
  'Philippians': { tw: 'Filipifoɔ', es: 'Filipenses', fr: 'Philippiens', pt: 'Filipenses', sw: 'Wafilipi', yo: 'Filipi', ig: 'Ndị Filipaị' },
  'Colossians': { tw: 'Kolosefoɔ', es: 'Colosenses', fr: 'Colossiens', pt: 'Colossenses', sw: 'Wakolosai', yo: 'Kolose', ig: 'Ndị Kọlọsi' },
  '1 Thessalonians': { tw: '1 Tesalonikafoɔ', es: '1 Tesalonicenses', fr: '1 Thessaloniciens', pt: '1 Tessalonicenses', sw: '1 Wathesalonike', yo: '1 Tẹsalonika', ig: '1 Ndị Tesalonaịka' },
  '2 Thessalonians': { tw: '2 Tesalonikafoɔ', es: '2 Tesalonicenses', fr: '2 Thessaloniciens', pt: '2 Tessalonicenses', sw: '2 Wathesalonike', yo: '2 Tẹsalonika', ig: '2 Ndị Tesalonaịka' },
  '1 Timothy': { tw: '1 Timoteo', es: '1 Timoteo', fr: '1 Timothée', pt: '1 Timóteo', sw: '1 Timotheo', yo: '1 Timoti', ig: '1 Timọti' },
  '2 Timothy': { tw: '2 Timoteo', es: '2 Timoteo', fr: '2 Timothée', pt: '2 Timóteo', sw: '2 Timotheo', yo: '2 Timoti', ig: '2 Timọti' },
  'Titus': { tw: 'Tito', es: 'Tito', fr: 'Tite', pt: 'Tito', sw: 'Tito', yo: 'Titu', ig: 'Taịtọs' },
  'Philemon': { tw: 'Filemon', es: 'Filemón', fr: 'Philémon', pt: 'Filemom', sw: 'Filemoni', yo: 'Filemoni', ig: 'Faịlimọn' },
  'Hebrews': { tw: 'Hebrifoɔ', es: 'Hebreos', fr: 'Hébreux', pt: 'Hebreus', sw: 'Waebrania', yo: 'Heberu', ig: 'Ndị Hibru' },
  'James': { tw: 'Yakobo', es: 'Santiago', fr: 'Jacques', pt: 'Tiago', sw: 'Yakobo', yo: 'Jakọbu', ig: 'Jemis' },
  '1 Peter': { tw: '1 Petro', es: '1 Pedro', fr: '1 Pierre', pt: '1 Pedro', sw: '1 Petro', yo: '1 Peteru', ig: '1 Pita' },
  '2 Peter': { tw: '2 Petro', es: '2 Pedro', fr: '2 Pierre', pt: '2 Pedro', sw: '2 Petro', yo: '2 Peteru', ig: '2 Pita' },
  '1 John': { tw: '1 Yohane', es: '1 Juan', fr: '1 Jean', pt: '1 João', sw: '1 Yohana', yo: '1 Jọn', ig: '1 Jọn' },
  '2 John': { tw: '2 Yohane', es: '2 Juan', fr: '2 Jean', pt: '2 João', sw: '2 Yohana', yo: '2 Jọn', ig: '2 Jọn' },
  '3 John': { tw: '3 Yohane', es: '3 Juan', fr: '3 Jean', pt: '3 João', sw: '3 Yohana', yo: '3 Jọn', ig: '3 Jọn' },
  'Jude': { tw: 'Yuda', es: 'Judas', fr: 'Jude', pt: 'Judas', sw: 'Yuda', yo: 'Juda', ig: 'Jud' },
  'Revelation': { tw: 'Adiyisɛm', es: 'Apocalipsis', fr: 'Apocalypse', pt: 'Apocalipse', sw: 'Ufunuo', yo: 'Ifihan', ig: 'Mkpughe' }
};

/**
 * Returns the localized book name for a given English book and target language code.
 * Defaults to English if no translation is available.
 */
export function getLocalizedBookName(englishBookName: string, languageCode: string = 'en'): string {
  const normLang = (languageCode || 'en').toLowerCase().trim();
  const bookLoc = BIBLE_BOOK_LOCALIZATIONS[englishBookName];
  if (!bookLoc) return englishBookName;

  switch (normLang) {
    case 'tw':
    case 'ak':
    case 'as':
      return bookLoc.tw || englishBookName;
    case 'es':
      return bookLoc.es || englishBookName;
    case 'fr':
      return bookLoc.fr || englishBookName;
    case 'pt':
      return bookLoc.pt || englishBookName;
    case 'sw':
      return bookLoc.sw || englishBookName;
    case 'yo':
      return bookLoc.yo || englishBookName;
    case 'ig':
      return bookLoc.ig || englishBookName;
    default:
      return englishBookName;
  }
}

export const TRANSLATION_TO_LANGUAGE: Record<string, string> = {
  // Twi
  'ASCB': 'tw',
  'AKCB': 'tw',
  // Pidgin
  'PCM': 'pcm',
  // Yoruba
  'YCB': 'yo',
  // Igbo
  'ICB': 'ig',
  // Swahili
  'SUV': 'sw',
  'NEN': 'sw',
  // Spanish
  'RVR': 'es',
  'NVI-ES': 'es',
  // French
  'LSG': 'fr',
  'BDS': 'fr',
  // Portuguese
  'ARC': 'pt',
  'NVI-PT': 'pt',
  // English
  'NIV': 'en',
  'KJV': 'en',
  'WEB': 'en',
  'ESV': 'en',
  'NLT': 'en',
  'BBE': 'en',
  'ASV': 'en',
};

/**
 * Resolves the primary language code for a given Bible translation code,
 * falling back to the UI language or 'en'.
 */
export function getLanguageForTranslation(translationCode: string = '', fallbackLanguage: string = 'en'): string {
  const code = translationCode.toUpperCase().trim();
  if (TRANSLATION_TO_LANGUAGE[code]) {
    return TRANSLATION_TO_LANGUAGE[code];
  }
  return fallbackLanguage || 'en';
}

const ENGLISH_VERSIONS = ['NIV', 'KJV', 'WEB', 'ESV', 'NLT', 'BBE', 'ASV'];

/**
 * Determines whether the active translation or language is non-English
 * (e.g. Spanish, French, Portuguese, Swahili, Yoruba, Igbo, Twi, Pidgin)
 * where English pericope headings should be suppressed to avoid language clashes.
 */
export function isVernacularVersion(translationCode: string = '', languageCode: string = ''): boolean {
  const code = translationCode.toUpperCase().trim();
  const lang = (languageCode || getLanguageForTranslation(code, 'en')).toLowerCase().trim();

  // Any non-English language is non-English
  if (lang && lang !== 'en') return true;

  // Any translation not in standard English versions is non-English
  if (code && !ENGLISH_VERSIONS.includes(code)) return true;

  return false;
}

