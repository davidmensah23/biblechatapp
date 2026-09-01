import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { getDB } from './database';
import { awardGraceXp } from './gamificationService';

export interface ReferralStats {
  totalInvites: number;
  joinedFriends: number;
  graceEarned: number;
  referralCode: string;
}

export interface ReferralRecord {
  id: string;
  referralCode: string;
  referredName?: string;
  status: 'pending' | 'joined' | 'rewarded';
  createdAt: string;
}

/**
 * Generates a clean, unique referral code based on the user's name
 */
export const getReferralCodeForUser = (fullName: string = 'Pilgrim', userId?: string): string => {
  const cleanName = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = (userId || 'akorno').slice(-4).toLowerCase();
  return `${cleanName || 'pilgrim'}-${suffix}`;
};

/**
 * Builds the universal shareable invite URL
 */
export const buildInviteLink = (referralCode: string): string => {
  return `https://akorno.app/join/${referralCode}`;
};

/**
 * Initializes the SQLite referrals cache table
 */
export const initReferralsTable = async (): Promise<void> => {
  try {
    const db = await getDB();
    if (!db) return;
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_referrals (
        id TEXT PRIMARY KEY,
        referral_code TEXT NOT NULL,
        referred_user_id TEXT,
        referred_name TEXT,
        status TEXT DEFAULT 'pending',
        grace_awarded INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.warn('Failed to init local referrals table:', error);
  }
};

/**
 * Claims a referral code when a new user signs up or opens an invite link
 */
export const claimReferralCode = async (
  referralCode: string,
  newUserId?: string,
  newUserName?: string
): Promise<{ success: boolean; message: string; xpAwarded: number }> => {
  try {
    const cleanCode = referralCode.trim().toLowerCase();
    if (!cleanCode) {
      return { success: false, message: 'Invalid referral code.', xpAwarded: 0 };
    }

    const REWARD_XP = 100;

    // 1. Check in Supabase if online
    try {
      const { error } = await supabase
        .from('referrals')
        .insert({
          referral_code: cleanCode,
          referred_user_id: newUserId || null,
          referred_name: newUserName || 'Akorno Pilgrim',
          status: 'joined',
          grace_xp_awarded: REWARD_XP
        });

      if (error) {
        console.log('Supabase referral log notice:', error.message);
      }
    } catch (sbErr) {
      console.log('Supabase offline, continuing with local referral claim');
    }

    // 2. Award Grace XP to the local user profile
    await awardGraceXp(REWARD_XP, 'Fellowship: Joined via Friend Invite');

    // 3. Cache in local SQLite database
    try {
      const db = await getDB();
      if (db) {
        const recordId = `ref_${Date.now()}`;
        await db.runAsync(
          `INSERT OR REPLACE INTO user_referrals (id, referral_code, referred_user_id, referred_name, status, grace_awarded, created_at)
           VALUES (?, ?, ?, ?, 'joined', ?, ?)`,
          [recordId, cleanCode, newUserId || null, newUserName || 'Friend', REWARD_XP, new Date().toISOString()]
        );
      }
    } catch (dbErr) {
      console.warn('Local referral SQLite save notice:', dbErr);
    }

    return {
      success: true,
      message: `Welcome to the Fellowship! +${REWARD_XP} Grace XP awarded.`,
      xpAwarded: REWARD_XP
    };
  } catch (err: any) {
    console.warn('Error claiming referral code:', err);
    return { success: false, message: err?.message || 'Referral claim failed.', xpAwarded: 0 };
  }
};

/**
 * Fetches referral statistics for the user
 */
export const getUserReferralStats = async (
  userId?: string,
  fullName: string = 'Pilgrim'
): Promise<ReferralStats> => {
  const myCode = getReferralCodeForUser(fullName, userId);
  let joinedCount = 0;
  let totalGrace = 0;

  try {
    const db = await getDB();
    if (db) {
      const rows = await db.getAllAsync<{ status: string; grace_awarded: number }>(
        `SELECT status, grace_awarded FROM user_referrals WHERE status = 'joined'`
      );

      joinedCount = rows.length;
      totalGrace = rows.reduce((acc: number, r: { status: string; grace_awarded: number }) => acc + (r.grace_awarded || 0), 0);
    }
  } catch (err) {
    console.warn('Failed to load local referral stats:', err);
  }

  return {
    referralCode: myCode,
    totalInvites: joinedCount,
    joinedFriends: joinedCount,
    graceEarned: totalGrace
  };
};

/**
 * Parses deep link URLs to extract referral codes
 */
export const extractReferralFromUrl = (url: string): string | null => {
  try {
    const parsed = Linking.parse(url);
    // e.g. akorno://join/dave-7x9 or https://akorno.app/join/dave-7x9
    if (parsed.path && parsed.path.includes('join/')) {
      const parts = parsed.path.split('join/');
      if (parts[1]) {
        return parts[1].split('/')[0].split('?')[0];
      }
    }
    if (parsed.queryParams && parsed.queryParams.ref) {
      return String(parsed.queryParams.ref);
    }
  } catch (e) {
    console.warn('Error parsing referral deep link:', e);
  }
  return null;
};
