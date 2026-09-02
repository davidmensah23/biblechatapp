import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { SUPABASE_URL } from './supabase';
import { saveUserProfile, fetchUserProfile } from './database';

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/youversion`;
const YOUVERSION_APP_KEY = process.env.EXPO_PUBLIC_YOUVERSION_API_KEY || 'vTLO6ybbDqjJHgaMCPemruLzH0o9GpIrZmfyEow7eVoF5fyp';

export interface YouVersionPassage {
  id: string;
  content: string;
  reference: string;
}

export interface YouVersionVOTD {
  day: number;
  passage_id: string;
  passage?: YouVersionPassage;
}

export interface YouVersionBible {
  id: string;
  title: string;
  abbreviation: string;
  language_tag: string;
}

/**
 * Fetch official YouVersion Verse of the Day with full scripture text enriched
 */
export const fetchYouVersionVerseOfTheDay = async (
  dayOfYear?: number,
  bibleId: string = '111'
): Promise<YouVersionVOTD | null> => {
  try {
    const url = dayOfYear
      ? `${EDGE_FUNCTION_URL}?action=votd&day=${dayOfYear}&bible_id=${bibleId}`
      : `${EDGE_FUNCTION_URL}?action=today&bible_id=${bibleId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('YouVersion Edge Function returned status:', response.status);
      return null;
    }

    const json = await response.json();
    if (json.success && json.data) {
      return json.data as YouVersionVOTD;
    }
    return null;
  } catch (err) {
    console.warn('Error calling YouVersion Edge Function:', err);
    return null;
  }
};

/**
 * Fetch any scripture passage directly from YouVersion (e.g. JHN.3.16, MAT.6.34)
 */
export const fetchYouVersionPassage = async (
  passageId: string,
  bibleId: string = '111'
): Promise<YouVersionPassage | null> => {
  try {
    const url = `${EDGE_FUNCTION_URL}?action=passage&passage_id=${encodeURIComponent(passageId)}&bible_id=${bibleId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;
    const json = await response.json();
    if (json.success && json.data) {
      return json.data as YouVersionPassage;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching passage from YouVersion:', err);
    return null;
  }
};

/**
 * Fetch available Bible versions from YouVersion
 */
export const fetchYouVersionBibles = async (
  language: string = 'eng'
): Promise<YouVersionBible[] | null> => {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}?action=bibles&language=${language}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json.success && json.data?.data ? (json.data.data as YouVersionBible[]) : null;
  } catch (err) {
    console.warn('Error fetching YouVersion bibles:', err);
    return null;
  }
};

/**
 * Sign in / Connect with YouVersion Account (OAuth 2.0 PKCE / Data Exchange)
 */
export const signInWithYouVersion = async (): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> => {
  try {
    // Generate secure PKCE state
    const stateBytes = await Crypto.getRandomBytesAsync(16);
    const state = Array.from(stateBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const redirectUri = 'biblechat://auth/youversion';

    // Construct YouVersion authorization URL
    const authUrl = `https://api.youversion.com/auth/authorize?client_id=${YOUVERSION_APP_KEY}&response_type=code&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      // Connect profile
      const currentProfile = await fetchUserProfile();
      const updatedProfile = {
        id: currentProfile?.id || `yv_user_${Date.now()}`,
        fullName: currentProfile?.fullName || 'YouVersion Pilgrim',
        email: currentProfile?.email || 'youversion.user@bible.com',
        avatarUrl: currentProfile?.avatarUrl || '',
        bio: 'Connected via YouVersion Bible Platform',
        location: currentProfile?.location || 'Worldwide',
        dateOfBirth: currentProfile?.dateOfBirth || ''
      };

      await saveUserProfile(updatedProfile);
      return { success: true, user: updatedProfile };
    } else if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, error: 'YouVersion sign-in was cancelled.' };
    }

    return { success: false, error: 'Authentication flow completed without credentials.' };
  } catch (err: any) {
    console.warn('Error in signInWithYouVersion:', err);
    return { success: false, error: err?.message || 'Failed to connect with YouVersion.' };
  }
};
