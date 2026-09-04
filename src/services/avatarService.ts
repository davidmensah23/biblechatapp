import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
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

export const DICEBEAR_STYLES = [
  { id: 'notionists', label: 'Notionist' },
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'bottts', label: 'Companion' },
  { id: 'thumbs', label: 'Playful' },
  { id: 'lorelei', label: 'Classic' }
];

const AVATAR_STORAGE_KEY = 'biblechat_avatar_emblem';

export const getDicebearUrl = (seed: string, style: string = 'notionists'): string => {
  return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}`;
};

export const rollRandomDicebearAvatar = (style: string = 'notionists'): string => {
  const randomSeed = `pilgrim_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  return getDicebearUrl(randomSeed, style);
};

export const getAvatarEmblem = (emblemId?: string): SacredAvatarEmblem => {
  if (!emblemId) return SACRED_AVATAR_EMBLEMS[0];
  const found = SACRED_AVATAR_EMBLEMS.find(e => e.id === emblemId);
  return found || SACRED_AVATAR_EMBLEMS[0];
};

export const getUserAvatarEmblem = async (): Promise<SacredAvatarEmblem> => {
  try {
    let saved: string | null = null;
    if (Platform.OS === 'web') {
      try {
        saved = typeof localStorage !== 'undefined' ? localStorage.getItem(AVATAR_STORAGE_KEY) : null;
      } catch (e) {}
    } else {
      saved = await SecureStore.getItemAsync(AVATAR_STORAGE_KEY);
    }
    if (saved) return getAvatarEmblem(saved);

    // Fallback check SQLite database
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
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(AVATAR_STORAGE_KEY, emblemId);
      } catch (e) {}
    } else {
      await SecureStore.setItemAsync(AVATAR_STORAGE_KEY, emblemId);
    }

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

export const saveUserAvatarUrl = async (avatarUrl: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(AVATAR_STORAGE_KEY, avatarUrl);
      } catch (e) {}
    } else {
      await SecureStore.setItemAsync(AVATAR_STORAGE_KEY, avatarUrl);
    }

    // Save to local SQLite
    const profile = await fetchUserProfile();
    if (profile) {
      await saveUserProfile({
        ...profile,
        avatarUrl
      });
    }

    // Sync to Supabase if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
    }
  } catch (e) {
    console.warn('saveUserAvatarUrl error:', e);
  }
};

/**
 * Uploads a local image file to Supabase Storage bucket 'avatars' under '{userId}/avatar_{timestamp}.png'
 */
export const uploadProfileAvatar = async (
  userId: string,
  localUri: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const fileName = `avatar_${Date.now()}.png`;
    const filePath = `${userId}/${fileName}`;

    if (Platform.OS === 'web') {
      const response = await fetch(localUri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }
    } else {
      // Read file as base64 using expo-file-system
      const base64Data = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to binary buffer
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, byteArray, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;
    await saveUserAvatarUrl(publicUrl);

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error('uploadProfileAvatar error:', err);
    return { success: false, error: err.message || 'Failed to upload photo' };
  }
};
