-- =========================================================================
-- AKORNO PRODUCTION ROW LEVEL SECURITY (RLS), TENANT ISOLATION & INDEXES
-- =========================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL DEFAULT 'akorno',
  full_name TEXT NOT NULL DEFAULT 'Seeker',
  email TEXT,
  bio TEXT DEFAULT 'Seeker of Christ and student of the Word.',
  location TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  avatar_url TEXT,
  gender TEXT DEFAULT 'neutral', -- 'brother' | 'sister' | 'neutral'
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_akorno_profiles_id_app ON public.profiles (id, app_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id AND app_id = 'akorno');

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND app_id = 'akorno')
  WITH CHECK (auth.uid() = id AND app_id = 'akorno');

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND app_id = 'akorno');

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id AND app_id = 'akorno');


-- 2. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL DEFAULT 'akorno',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  persona_id TEXT NOT NULL,
  persona_name TEXT NOT NULL,
  last_message TEXT DEFAULT '',
  last_message_sender TEXT DEFAULT 'assistant',
  updated_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_akorno_conversations_user_updated ON public.conversations (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_akorno_conversations_app_user ON public.conversations (app_id, user_id);

DROP POLICY IF EXISTS "Users can only access their own conversations" ON public.conversations;
CREATE POLICY "Users can only access their own conversations"
  ON public.conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id AND app_id = 'akorno')
  WITH CHECK (auth.uid() = user_id AND app_id = 'akorno');


-- 3. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL DEFAULT 'akorno',
  conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_akorno_messages_convo_ts ON public.messages (conversation_id, timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_akorno_messages_user_ts ON public.messages (user_id, timestamp DESC);

DROP POLICY IF EXISTS "Users can only access their own chat messages" ON public.messages;
CREATE POLICY "Users can only access their own chat messages"
  ON public.messages FOR ALL
  TO authenticated
  USING (auth.uid() = user_id AND app_id = 'akorno')
  WITH CHECK (auth.uid() = user_id AND app_id = 'akorno');


-- 4. BOOKMARKS & SAVED REFLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL DEFAULT 'akorno',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'verse' | 'quote' | 'insight'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reference TEXT,
  author TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_akorno_bookmarks_user_type_ts ON public.bookmarks (user_id, type, timestamp DESC);

DROP POLICY IF EXISTS "Users can only access their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can only access their own bookmarks"
  ON public.bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id AND app_id = 'akorno')
  WITH CHECK (auth.uid() = user_id AND app_id = 'akorno');


-- 5. GAMIFICATION & SPIRITUAL GROWTH PROFILE
CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL DEFAULT 'akorno',
  streak_days INT DEFAULT 1,
  total_reflections INT DEFAULT 0,
  grace_xp INT DEFAULT 50,
  level INT DEFAULT 1,
  grace_shield_active BOOLEAN DEFAULT false,
  equipped_armor JSONB DEFAULT '[]'::jsonb,
  unlocked_achievements JSONB DEFAULT '[]'::jsonb,
  completed_deeds JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_akorno_gamification_user_app ON public.user_gamification (user_id, app_id);

DROP POLICY IF EXISTS "Users can only access their own gamification profile" ON public.user_gamification;
CREATE POLICY "Users can only access their own gamification profile"
  ON public.user_gamification FOR ALL
  TO authenticated
  USING (auth.uid() = user_id AND app_id = 'akorno')
  WITH CHECK (auth.uid() = user_id AND app_id = 'akorno');


-- 6. REFERRALS & FELLOWSHIP TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'akorno',
  referral_code TEXT NOT NULL,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_name TEXT,
  status TEXT DEFAULT 'joined', -- 'pending' | 'joined' | 'rewarded'
  grace_xp_awarded INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_akorno_referrals_code ON public.referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_akorno_referrals_inviter ON public.referrals (inviter_id, status);
CREATE INDEX IF NOT EXISTS idx_akorno_referrals_referred ON public.referrals (referred_user_id);

DROP POLICY IF EXISTS "Users can view referrals where they are inviter or referred" ON public.referrals;
CREATE POLICY "Users can view referrals where they are inviter or referred"
  ON public.referrals FOR SELECT
  TO authenticated
  USING ((auth.uid() = inviter_id OR auth.uid() = referred_user_id) AND app_id = 'akorno');

DROP POLICY IF EXISTS "Authenticated users can record referral join" ON public.referrals;
CREATE POLICY "Authenticated users can record referral join"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = referred_user_id OR referred_user_id IS NULL) AND app_id = 'akorno');


-- 7. PUSH NOTIFICATION DEVICE TOKENS
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL DEFAULT 'akorno',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL, -- 'ios' | 'android' | 'web'
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_akorno_device_tokens_user_active ON public.device_tokens (user_id, is_active);

DROP POLICY IF EXISTS "Users can manage their own device tokens" ON public.device_tokens;
CREATE POLICY "Users can manage their own device tokens"
  ON public.device_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id AND app_id = 'akorno')
  WITH CHECK (auth.uid() = user_id AND app_id = 'akorno');


-- 8. AUTOMATIC PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, app_id, full_name, email, gender)
  VALUES (
    NEW.id,
    'akorno',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gender', 'neutral')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      gender = EXCLUDED.gender;

  INSERT INTO public.user_gamification (user_id, app_id, grace_xp, streak_days, level)
  VALUES (NEW.id, 'akorno', 50, 1, 1)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
