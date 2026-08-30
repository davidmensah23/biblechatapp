import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kciyviyjxtghhslvmzlp.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gN8nbQlIkgpsfehQeHpjsg_cEgaG9Yj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Kofi Amartey James',
  email: 'ko.james@gmail.com',
  bio: 'I am an INFP with multiple interest. Introverted and artistic seeker of Christ.',
  location: 'Ghana, Accra',
  dateOfBirth: '28th, June, 2025'
};
