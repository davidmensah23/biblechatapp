import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getDB } from './database';

export type AppLanguage = 'en' | 'es' | 'fr' | 'pt' | 'tw' | 'sw';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'tw', name: 'Twi (Akan)', nativeName: 'Twi', flag: '🇬🇭' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' }
];

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_fellowship: 'Fellowship',
    nav_bible: 'Bible',
    nav_profile: 'Profile',

    // Home
    tab_for_you: 'For You',
    tab_disciples: 'Disciples',
    today_scripture: "Today's Scripture",
    read_more: 'Read more',
    begin_deed: 'Begin Deed',
    deed_sealed: 'Deed Sealed',
    scripture_btn: 'Scripture',
    daily_word_grace: 'Daily Word of Grace',
    sermon_prep_title: 'Prepare Sunday Sermon',
    sermon_prep_subtitle: 'Collaborate with the apostles to craft sermons, exegetical notes, and homilies.',
    start_writing: 'Start Writing',
    fellowship_companions: 'Spiritual Companions',

    // Chat / Fellowship
    fellowship_title: 'Fellowship',
    tab_one_on_one: '1-on-1 Apostles',
    tab_councils: 'Councils',
    new_council: 'New Council',
    search_placeholder: 'Search disciples or prayers...',
    type_message: 'Type a prayer or reflection...',
    tap_to_speak: 'Tap to speak with Apostle',
    apostle_speaking: 'Apostle Speaking',
    listening_user: 'Listening to You',
    consulting_scripture: 'Consulting Scripture...',
    slide_to_end: 'Slide to end call',
    end_call: 'End Call',

    // Bible
    bible_title: 'Holy Bible',
    select_book: 'Select Book',
    select_version: 'Select Translation',
    search_bible: 'Search translation or chapter...',
    loading_scripture: 'Loading Scripture...',
    previous_chapter: 'Previous',
    next_chapter: 'Next',
    language_label: 'Language',

    // Profile & Settings
    profile_title: 'Profile',
    settings_title: 'Settings',
    account_settings: 'Account Settings',
    spiritual_journey: 'Spiritual Journey',
    language_setting: 'Language',
    plain_language: 'Plain Language Mode',
    sign_out: 'Sign Out',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
    about_app: 'About Akorno',

    // Onboarding & Auth
    get_started: 'Get Started',
    continue_as_guest: 'Continue as Guest',
    welcome_headline: 'Walk with the Apostles',
    welcome_sub: 'Experience deep theological companionship, interactive scriptures, and spiritual guidance.'
  },

  es: {
    // Navigation
    nav_home: 'Inicio',
    nav_fellowship: 'Comunión',
    nav_bible: 'Biblia',
    nav_profile: 'Perfil',

    // Home
    tab_for_you: 'Para Ti',
    tab_disciples: 'Discípulos',
    today_scripture: 'Escritura de Hoy',
    read_more: 'Leer más',
    begin_deed: 'Comenzar Acción',
    deed_sealed: 'Acción Cumplida',
    scripture_btn: 'Escritura',
    daily_word_grace: 'Palabra Diaria de Gracia',
    sermon_prep_title: 'Preparar Sermón Dominical',
    sermon_prep_subtitle: 'Colabora con los apóstoles para crear sermones y notas exegéticas.',
    start_writing: 'Comenzar a Escribir',
    fellowship_companions: 'Compañeros Espirituales',

    // Chat / Fellowship
    fellowship_title: 'Comunión',
    tab_one_on_one: 'Apóstoles 1 a 1',
    tab_councils: 'Concilios',
    new_council: 'Nuevo Concilio',
    search_placeholder: 'Buscar discípulos u oraciones...',
    type_message: 'Escribe una oración o reflexión...',
    tap_to_speak: 'Toca para hablar con el Apóstol',
    apostle_speaking: 'Apóstol Hablando',
    listening_user: 'Escuchándote',
    consulting_scripture: 'Consultando las Escrituras...',
    slide_to_end: 'Desliza para terminar',
    end_call: 'Terminar Llamada',

    // Bible
    bible_title: 'Santa Biblia',
    select_book: 'Seleccionar Libro',
    select_version: 'Seleccionar Traducción',
    search_bible: 'Buscar traducción o capítulo...',
    loading_scripture: 'Cargando Escrituras...',
    previous_chapter: 'Anterior',
    next_chapter: 'Siguiente',
    language_label: 'Idioma',

    // Profile & Settings
    profile_title: 'Perfil',
    settings_title: 'Ajustes',
    account_settings: 'Ajustes de Cuenta',
    spiritual_journey: 'Camino Espiritual',
    language_setting: 'Idioma',
    plain_language: 'Modo Lenguaje Sencillo',
    sign_out: 'Cerrar Sesión',
    privacy_policy: 'Política de Privacidad',
    terms_of_service: 'Términos de Servicio',
    about_app: 'Acerca de Akorno',

    // Onboarding & Auth
    get_started: 'Comenzar',
    continue_as_guest: 'Continuar como Invitado',
    welcome_headline: 'Camina con los Apóstoles',
    welcome_sub: 'Experimenta compañerismo teológico profundo, escrituras interactivas y guía espiritual.'
  },

  fr: {
    // Navigation
    nav_home: 'Accueil',
    nav_fellowship: 'Communion',
    nav_bible: 'Bible',
    nav_profile: 'Profil',

    // Home
    tab_for_you: 'Pour Vous',
    tab_disciples: 'Disciples',
    today_scripture: "Écriture d'Aujourd'hui",
    read_more: 'Lire la suite',
    begin_deed: 'Commencer l’Action',
    deed_sealed: 'Action Scellée',
    scripture_btn: 'Écriture',
    daily_word_grace: 'Parole Quotidienne de Grâce',
    sermon_prep_title: 'Préparer le Sermon du Dimanche',
    sermon_prep_subtitle: 'Collaborez avec les apôtres pour préparer vos sermons et études bibliques.',
    start_writing: 'Commencer à Écrire',
    fellowship_companions: 'Compagnons Spirituels',

    // Chat / Fellowship
    fellowship_title: 'Communion',
    tab_one_on_one: 'Apôtres 1-à-1',
    tab_councils: 'Conciles',
    new_council: 'Nouveau Concile',
    search_placeholder: 'Rechercher des apôtres ou prières...',
    type_message: 'Écrivez une prière ou réflexion...',
    tap_to_speak: "Appuyez pour parler à l'Apôtre",
    apostle_speaking: "L'Apôtre Parle",
    listening_user: 'À votre écoute',
    consulting_scripture: 'Consultation des Écritures...',
    slide_to_end: 'Glisser pour raccrocher',
    end_call: 'Terminer l’Appel',

    // Bible
    bible_title: 'Sainte Bible',
    select_book: 'Choisir le Livre',
    select_version: 'Choisir la Traduction',
    search_bible: 'Rechercher une version ou chapitre...',
    loading_scripture: 'Chargement des Écritures...',
    previous_chapter: 'Précédent',
    next_chapter: 'Suivant',
    language_label: 'Langue',

    // Profile & Settings
    profile_title: 'Profil',
    settings_title: 'Paramètres',
    account_settings: 'Paramètres du Compte',
    spiritual_journey: 'Parcours Spirituel',
    language_setting: 'Langue',
    plain_language: 'Mode Langage Simple',
    sign_out: 'Se Déconnecter',
    privacy_policy: 'Politique de Confidentialité',
    terms_of_service: "Conditions d'Utilisation",
    about_app: 'À propos de Akorno',

    // Onboarding & Auth
    get_started: 'Commencer',
    continue_as_guest: 'Continuer en tant qu’Invité',
    welcome_headline: 'Marchez avec les Apôtres',
    welcome_sub: 'Vivez une communion théologique profonde, des écritures vivantes et des conseils spirituels.'
  },

  pt: {
    // Navigation
    nav_home: 'Início',
    nav_fellowship: 'Comunhão',
    nav_bible: 'Bíblia',
    nav_profile: 'Perfil',

    // Home
    tab_for_you: 'Para Você',
    tab_disciples: 'Discípulos',
    today_scripture: 'Escritura de Hoje',
    read_more: 'Ler mais',
    begin_deed: 'Iniciar Ação',
    deed_sealed: 'Ação Selada',
    scripture_btn: 'Escritura',
    daily_word_grace: 'Palavra Diária de Graça',
    sermon_prep_title: 'Preparar Sermão de Domingo',
    sermon_prep_subtitle: 'Colabore com os apóstolos para criar sermões e estudos exegéticos.',
    start_writing: 'Começar a Escrever',
    fellowship_companions: 'Companheiros Espirituais',

    // Chat / Fellowship
    fellowship_title: 'Comunhão',
    tab_one_on_one: 'Apóstolos 1 a 1',
    tab_councils: 'Concílios',
    new_council: 'Novo Concílio',
    search_placeholder: 'Buscar discípulos ou orações...',
    type_message: 'Digite uma oração ou reflexão...',
    tap_to_speak: 'Toque para falar com o Apóstolo',
    apostle_speaking: 'Apóstolo Falando',
    listening_user: 'Ouvindo Você',
    consulting_scripture: 'Consultando as Escrituras...',
    slide_to_end: 'Deslize para encerrar',
    end_call: 'Encerrar Chamada',

    // Bible
    bible_title: 'Bíblia Sagrada',
    select_book: 'Selecionar Livro',
    select_version: 'Selecionar Tradução',
    search_bible: 'Buscar tradução ou capítulo...',
    loading_scripture: 'Carregando Escrituras...',
    previous_chapter: 'Anterior',
    next_chapter: 'Próximo',
    language_label: 'Idioma',

    // Profile & Settings
    profile_title: 'Perfil',
    settings_title: 'Configurações',
    account_settings: 'Configurações de Conta',
    spiritual_journey: 'Jornada Espiritual',
    language_setting: 'Idioma',
    plain_language: 'Modo Linguagem Simples',
    sign_out: 'Sair da Conta',
    privacy_policy: 'Política de Privacidade',
    terms_of_service: 'Termos de Serviço',
    about_app: 'Sobre o Akorno',

    // Onboarding & Auth
    get_started: 'Começar',
    continue_as_guest: 'Continuar como Convidado',
    welcome_headline: 'Caminhe com os Apóstolos',
    welcome_sub: 'Experimente profunda comunhão teológica, escrituras interativas e orientação espiritual.'
  },

  tw: {
    // Navigation
    nav_home: 'Fie',
    nav_fellowship: 'Nkabom',
    nav_bible: 'Twerɛ Kronkron',
    nav_profile: 'Me Nkyerɛwee',

    // Home
    tab_for_you: 'Wo Deɛ',
    tab_disciples: 'Asomafoɔ',
    today_scripture: 'Ɛnnɛ Twerɛ Kronkron',
    read_more: 'Kenkan pii',
    begin_deed: 'Hyɛ Adwuma no ase',
    deed_sealed: 'Adwuma no wie pɛpɛɛpɛ',
    scripture_btn: 'Twerɛ Kronkron',
    daily_word_grace: 'Da biara Adom Asɛm',
    sermon_prep_title: 'Siesie Kwasida Asɛnka',
    sermon_prep_subtitle: 'Ne asomafoɔ no nkabom siesie Nyame asɛm ne afotuo.',
    start_writing: 'Hyɛ aseɛ twerɛ',
    fellowship_companions: 'Honhom mu Nnamfonom',

    // Chat / Fellowship
    fellowship_title: 'Nkabom',
    tab_one_on_one: 'Asomafoɔ baako-baako',
    tab_councils: 'Badwam Nhyiamu',
    new_council: 'Badwam Foforɔ',
    search_placeholder: 'Hwehwɛ asomafoɔ anaa mpaebɔ...',
    type_message: 'Twerɛ mpaebɔ anaa adwene...',
    tap_to_speak: 'Mía so ne Ɔsomafoɔ no nkasa',
    apostle_speaking: 'Ɔsomafoɔ no rekasa',
    listening_user: 'Meretie wo...',
    consulting_scripture: 'Merehwehwɛ Twerɛ Kronkron mu...',
    slide_to_end: 'Twee so de wie frɛ no',
    end_call: 'Wie Frɛ no',

    // Bible
    bible_title: 'Twerɛ Kronkron',
    select_book: 'Paw Nwoma',
    select_version: 'Paw Nkyerɛaseɛ',
    search_bible: 'Hwehwɛ nkyerɛaseɛ anaa ti...',
    loading_scripture: 'Twerɛ Kronkron no reba...',
    previous_chapter: 'Nea etwa to',
    next_chapter: 'Nea edi hɔ',
    language_label: 'Kasa',

    // Profile & Settings
    profile_title: 'Me Nkyerɛwee',
    settings_title: 'Nhyehyeɛ',
    account_settings: 'Akontaabu Nhyehyeɛ',
    spiritual_journey: 'Honhom mu Akwantuo',
    language_setting: 'Kasa',
    plain_language: 'Kasa a ɛyɛ mmerɛ',
    sign_out: 'Firi Mu',
    privacy_policy: 'Kokoamsɛm Nhyehyeɛ',
    terms_of_service: 'Ɛho Nhyehyeɛ',
    about_app: 'Akorno ho asɛm',

    // Onboarding & Auth
    get_started: 'Hyɛ Aseɛ',
    continue_as_guest: 'Toa so sɛ Ɔhɔhoɔ',
    welcome_headline: 'Nante ne Asomafoɔ no',
    welcome_sub: 'Nya honhom mu nteaseɛ kɛseɛ, Twerɛ Kronkron ne akwankyerɛ.'
  },

  sw: {
    // Navigation
    nav_home: 'Nyumbani',
    nav_fellowship: 'Ushirika',
    nav_bible: 'Biblia Takatifu',
    nav_profile: 'Wasifu',

    // Home
    tab_for_you: 'Kwa Ajili Yako',
    tab_disciples: 'Wanafunzi',
    today_scripture: 'Maandiko ya Leo',
    read_more: 'Soma zaidi',
    begin_deed: 'Anza Tendo',
    deed_sealed: 'Tendo Limetimizwa',
    scripture_btn: 'Maandiko',
    daily_word_grace: 'Neno la Neema la Kila Siku',
    sermon_prep_title: 'Andaa Mahubiri ya Jumapili',
    sermon_prep_subtitle: 'Shirikiana na mitume kuandaa mahubiri na mafunzo ya Biblia.',
    start_writing: 'Anza Kuandika',
    fellowship_companions: 'Wenzako wa Kiroho',

    // Chat / Fellowship
    fellowship_title: 'Ushirika',
    tab_one_on_one: 'Mitume 1 kwa 1',
    tab_councils: 'Mabaraza',
    new_council: 'Baraza Jipya',
    search_placeholder: 'Tafuta wanafunzi au maombi...',
    type_message: 'Andika ombi au tafakari...',
    tap_to_speak: 'Gusa ili kuongea na Mtume',
    apostle_speaking: 'Mtume Anaongea',
    listening_user: 'Ninakusikiliza',
    consulting_scripture: 'Kutafuta Maandiko...',
    slide_to_end: 'Telezesha kukata simu',
    end_call: 'Kata Simu',

    // Bible
    bible_title: 'Biblia Takatifu',
    select_book: 'Chagua Kitabu',
    select_version: 'Chagua Tafsiri',
    search_bible: 'Tafuta tafsiri au sura...',
    loading_scripture: 'Inapakia Maandiko...',
    previous_chapter: 'Iliyotangulia',
    next_chapter: 'Inayofuata',
    language_label: 'Lugha',

    // Profile & Settings
    profile_title: 'Wasifu',
    settings_title: 'Mipangilio',
    account_settings: 'Mipangilio ya Akaunti',
    spiritual_journey: 'Safari ya Kiroho',
    language_setting: 'Lugha',
    plain_language: 'Hali ya Lugha Rahisi',
    sign_out: 'Toka kwenye Akaunti',
    privacy_policy: 'Sera ya Faragha',
    terms_of_service: 'Masharti ya Huduma',
    about_app: 'Kuhusu Akorno',

    // Onboarding & Auth
    get_started: 'Anza Sasa',
    continue_as_guest: 'Endelea kama Mgeni',
    welcome_headline: 'Tembea na Mitume',
    welcome_sub: 'Pata ushirika wa kina wa theolojia, maandiko ya kipekee na mwongozo wa kiroho.'
  }
};

const LANGUAGE_STORAGE_KEY = 'akorno_app_language_pref_v2';
let currentLanguage: AppLanguage = 'en';
const listeners: Array<(lang: AppLanguage) => void> = [];

export const getAppLanguage = (): AppLanguage => currentLanguage;

export const setAppLanguage = async (lang: AppLanguage): Promise<void> => {
  currentLanguage = lang;
  listeners.forEach(cb => cb(lang));

  // 1. SecureStore / LocalStorage persistence
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } else {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, lang);
    }
  } catch (e) {}

  // 2. SQLite persistence
  const db = await getDB();
  if (db) {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      await db.runAsync(
        `INSERT INTO app_settings (key, value) VALUES ('language', ?)
         ON CONFLICT(key) DO UPDATE SET value = ?;`,
        [lang, lang]
      );
    } catch (e) {}
  }
};

export const subscribeLanguageChange = (cb: (lang: AppLanguage) => void) => {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const initializeLanguagePreference = async (): Promise<AppLanguage> => {
  // 1. Check SecureStore
  try {
    let saved: string | null = null;
    if (Platform.OS === 'web') {
      saved = typeof localStorage !== 'undefined' ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
    } else {
      saved = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
    }
    if (saved && ['en', 'es', 'fr', 'pt', 'tw', 'sw'].includes(saved)) {
      currentLanguage = saved as AppLanguage;
      listeners.forEach(cb => cb(currentLanguage));
      return currentLanguage;
    }
  } catch (e) {}

  // 2. Check SQLite
  const db = await getDB();
  if (db) {
    try {
      const row = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = 'language';"
      );
      if (row?.value && ['en', 'es', 'fr', 'pt', 'tw', 'sw'].includes(row.value)) {
        currentLanguage = row.value as AppLanguage;
        listeners.forEach(cb => cb(currentLanguage));
      }
    } catch (e) {}
  }
  return currentLanguage;
};

/**
 * Universal Translation Helper: t(key)
 */
export const t = (key: string, fallback?: string): string => {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || fallback || key;
};

/**
 * React Hook for Reactive Multi-Language Localization
 */
export const useTranslation = () => {
  const [lang, setLang] = useState<AppLanguage>(currentLanguage);

  useEffect(() => {
    const unsubscribe = subscribeLanguageChange((newLang) => {
      setLang(newLang);
    });
    return unsubscribe;
  }, []);

  const translate = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || fallback || key;
  };

  return {
    t: translate,
    currentLanguage: lang,
    setLanguage: setAppLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
};
