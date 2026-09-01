import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { UserProfile } from '../types';

// Complete auth session if web browser redirect is active
WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kciyviyjxtghhslvmzlp.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gN8nbQlIkgpsfehQeHpjsg_cEgaG9Yj';

// SecureStore adapter for persisting auth tokens on mobile
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      } catch (e) {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore getItem error:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      } catch (e) {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('SecureStore setItem error:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      } catch (e) {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore removeItem error:', e);
    }
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Seeker',
  email: 'seeker@akorno.app',
  bio: 'Seeker of Christ and student of the Word.',
  location: 'Faith Journey',
  dateOfBirth: '2025'
};

// Google OAuth Sign In using Expo WebBrowser & AuthSession
export const signInWithGoogle = async (): Promise<{ user: any | null; error: Error | null }> => {
  try {
    const redirectUrl = makeRedirectUri({
      scheme: 'akorno',
      path: 'auth/callback'
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true
      }
    });

    if (error || !data?.url) {
      throw error || new Error('Failed to obtain Google OAuth URL');
    }

    const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (authResult.type === 'success' && authResult.url) {
      const parsedUrl = new URL(authResult.url);
      let hash = parsedUrl.hash;
      if (hash.startsWith('#')) hash = hash.substring(1);

      const params = new URLSearchParams(hash || parsedUrl.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionErr) throw sessionErr;
        return { user: sessionData.user, error: null };
      }

      const code = params.get('code');
      if (code) {
        const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) throw exchangeErr;
        return { user: exchangeData.user, error: null };
      }
    }

    if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
      return { user: null, error: null };
    }

    return { user: null, error: null };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    return { user: null, error: err };
  }
};

// Email & Password Sign In
export const signInWithEmail = async (email: string, pass: string): Promise<{ user: any | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err };
  }
};

// Email & Password Sign Up
export const signUpWithEmail = async (
  email: string,
  pass: string,
  fullName?: string
): Promise<{ user: any | null; session: any | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: {
          full_name: fullName || splitEmailToName(email)
        }
      }
    });
    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    return { user: null, session: null, error: err };
  }
};

// Verify 6-digit OTP Code (signup, recovery, email, magiclink)
export const verifyEmailOtp = async (
  email: string,
  token: string,
  type: 'signup' | 'recovery' | 'magiclink' | 'email' = 'signup'
): Promise<{ session: any | null; user: any | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type
    });
    if (error) throw error;
    return { session: data.session, user: data.user, error: null };
  } catch (err: any) {
    return { session: null, user: null, error: err };
  }
};

// Send Password Reset OTP / Link
export const sendPasswordReset = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: makeRedirectUri({
        scheme: 'akorno',
        path: 'auth/callback'
      })
    });
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
};

// Update User Password (after recovery OTP or in settings with optional current password)
export const updateUserPassword = async (
  newPassword: string,
  currentPassword?: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser(
      { password: newPassword },
      currentPassword ? { currentPassword } : undefined
    );
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
};

// Resend OTP / Verification Email
export const resendVerificationEmail = async (
  email: string,
  type: 'signup' | 'email_change' = 'signup'
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resend({
      type,
      email: email.trim()
    });
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
};

// Handle incoming deep links (1-click email links, OAuth callbacks)
export const handleAuthDeepLink = async (url: string | null): Promise<void> => {
  if (!url) return;
  try {
    const parsed = new URL(url);
    let hash = parsed.hash;
    if (hash.startsWith('#')) hash = hash.substring(1);
    const params = new URLSearchParams(hash || parsed.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      return;
    }

    const code = params.get('code');
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  } catch (e) {
    console.warn('handleAuthDeepLink note:', e);
  }
};

// Sign Out
export const signOutUser = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
};

// Fetch User Profile from Supabase `public.profiles` table
export const fetchRemoteProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('fetchRemoteProfile error:', error.message);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        fullName: data.full_name || 'Seeker',
        email: data.email || '',
        bio: data.bio || DEFAULT_PROFILE.bio,
        location: data.location || '',
        dateOfBirth: data.date_of_birth || '',
        avatarUrl: data.avatar_url || undefined
      };
    }
    return null;
  } catch (e) {
    console.warn('Error fetching profile from Supabase:', e);
    return null;
  }
};

// Update User Profile in Supabase `public.profiles` table
export const updateRemoteProfile = async (userId: string, profile: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: profile.fullName,
        email: profile.email,
        bio: profile.bio,
        location: profile.location,
        date_of_birth: profile.dateOfBirth,
        avatar_url: profile.avatarUrl,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('updateRemoteProfile error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Error updating profile in Supabase:', e);
    return false;
  }
};

// Check current user auth provider (Google vs Email vs Guest)
export const getUserAuthProvider = async (): Promise<{ provider: 'google' | 'email' | 'guest'; email?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { provider: 'guest' };
    const provider = user.app_metadata?.provider || user.identities?.[0]?.provider;
    return {
      provider: provider === 'google' ? 'google' : 'email',
      email: user.email
    };
  } catch (e) {
    return { provider: 'guest' };
  }
};

// Delete User Account (Apple App Store Guideline 5.1.1(v))
export const deleteUserAccount = async (): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.signOut();
    }
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
};

const splitEmailToName = (email: string): string => {
  const parts = email.split('@')[0];
  return parts.charAt(0).toUpperCase() + parts.slice(1);
};
