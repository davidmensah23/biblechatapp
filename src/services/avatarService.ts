import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { saveUserProfile, fetchUserProfile } from './database';

export interface SacredAvatarEmblem {
  id: string;
  name: string;
  emoji: string;
  meaning: string;
  bgColor: string;
  textColor: string;
}

export const SACRED_AVATAR_EMBLEMS: SacredAvatarEmblem[] = [
  { id: 'dove', name: 'Gentle Dove', emoji: '🕊️', meaning: 'Holy Spirit & Peace', bgColor: '#F1F5F9', textColor: '#475569' },
  { id: 'olive', name: 'Olive Branch', emoji: '🌿', meaning: 'Reconciliation & Life', bgColor: '#ECFDF5', textColor: '#047857' },
  { id: 'lamp', name: 'Lampstand', emoji: '🕯️', meaning: 'Light of the World', bgColor: '#FEF3C7', textColor: '#B45309' },
  { id: 'shield', name: 'Shield of Faith', emoji: '🛡️', meaning: 'Divine Protection', bgColor: '#F3F4F6', textColor: '#374151' },
  { id: 'bread', name: 'Daily Manna', emoji: '🍞', meaning: 'Living Bread & Truth', bgColor: '#FEF9C3', textColor: '#A16207' },
  { id: 'water', name: 'Living Water', emoji: '💧', meaning: 'Grace & Cleansing', bgColor: '#E0F2FE', textColor: '#0369A1' },
  { id: 'crown', name: 'Kingdom Crown', emoji: '👑', meaning: 'Royal Priesthood', bgColor: '#FDF4FF', textColor: '#86198F' },
  { id: 'flame', name: 'Holy Fire', emoji: '🔥', meaning: 'Zeal & Pentecost', bgColor: '#FFEDD5', textColor: '#C2410C' },
  { id: 'cross', name: 'Sacred Cross', emoji: '✝️', meaning: 'Redemption & Hope', bgColor: '#FEE2E2', textColor: '#991B1B' },
];

const AVATAR_STORAGE_KEY = '@biblechat_user_avatar_emblem';

export const getAvatarEmblem = (emblemId?: string): SacredAvatarEmblem => {
  if (!emblemId) return SACRED_AVATAR_EMBLEMS[0];
  const found = SACRED_AVATAR_EMBLEMS.find(e => e.id === emblemId);
  return found || SACRED_AVATAR_EMBLEMS[0];
};

export const getUserAvatarEmblem = async (): Promise<SacredAvatarEmblem> => {
  try {
    const saved = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
    if (saved) return getAvatarEmblem(saved);

    // Fallback check database
    const profile = await fetchUserProfile();
    if (profile?.avatarUrl && profile.avatarUrl.startsWith('emblem:')) {
      const emblemId = profile.avatarUrl.replace('emblem:', '');
      return getAvatarEmblem(emblemId);
    }
  } catch (e) {
    console.warn('getUserAvatarEmblem error:', e);
  }
  return SACRED_AVATAR_EMBLEMS[0];
};

export const setUserAvatarEmblem = async (emblemId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AVATAR_STORAGE_KEY, emblemId);

    // Save to local SQLite
    const profile = await fetchUserProfile();
    if (profile) {
      await saveUserProfile({
        ...profile,
        avatarUrl: `emblem:${emblemId}`
      });
    }

    // Sync to Supabase if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ avatar_url: `emblem:${emblemId}` })
        .eq('id', user.id);
    }
  } catch (e) {
    console.warn('setUserAvatarEmblem error:', e);
  }
};
