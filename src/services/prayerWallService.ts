import { supabase } from './supabase';

export interface PrayerRequest {
  id: string;
  userId: string;
  authorName: string;
  isAnonymous: boolean;
  category: 'general' | 'healing' | 'family' | 'guidance' | 'peace' | 'thanksgiving';
  title: string;
  requestText: string;
  prayedCount: number;
  createdAt: string;
  hasUserPrayed?: boolean;
}

export const fetchPrayerWallRequests = async (
  category?: string
): Promise<PrayerRequest[]> => {
  try {
    let query = supabase
      .from('prayer_wall_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    // Check interactions for current user if logged in
    const { data: { user } } = await supabase.auth.getUser();
    let userInteractions = new Set<string>();

    if (user) {
      const { data: interactions } = await supabase
        .from('prayer_wall_interactions')
        .select('request_id')
        .eq('user_id', user.id);

      if (interactions) {
        userInteractions = new Set(interactions.map(i => i.request_id));
      }
    }

    return data.map(r => ({
      id: r.id,
      userId: r.user_id,
      authorName: r.is_anonymous ? 'A Fellow Pilgrim' : r.author_name,
      isAnonymous: r.is_anonymous,
      category: r.category,
      title: r.title,
      requestText: r.request_text,
      prayedCount: r.prayed_count || 0,
      createdAt: r.created_at,
      hasUserPrayed: userInteractions.has(r.id)
    }));
  } catch (e) {
    console.warn('fetchPrayerWallRequests error:', e);
    return [];
  }
};

export const createPrayerRequest = async (
  title: string,
  requestText: string,
  category: 'general' | 'healing' | 'family' | 'guidance' | 'peace' | 'thanksgiving' = 'general',
  isAnonymous: boolean = false
): Promise<{ success: boolean; request?: PrayerRequest; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Please sign in to post on the Prayer Wall.' };
    }

    const authorName = user.user_metadata?.full_name || 'Pilgrim';

    const { data, error } = await supabase
      .from('prayer_wall_requests')
      .insert({
        user_id: user.id,
        author_name: authorName,
        is_anonymous: isAnonymous,
        category,
        title,
        request_text: requestText,
        prayed_count: 0
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Could not post request.' };
    }

    return {
      success: true,
      request: {
        id: data.id,
        userId: data.user_id,
        authorName: isAnonymous ? 'A Fellow Pilgrim' : authorName,
        isAnonymous,
        category: data.category,
        title: data.title,
        requestText: data.request_text,
        prayedCount: 0,
        createdAt: data.created_at,
        hasUserPrayed: false
      }
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error' };
  }
};

export const togglePrayedForRequest = async (
  requestId: string,
  currentlyPrayed: boolean
): Promise<{ success: boolean; newCountDelta: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, newCountDelta: 0 };

    if (currentlyPrayed) {
      // Delete interaction
      await supabase
        .from('prayer_wall_interactions')
        .delete()
        .eq('request_id', requestId)
        .eq('user_id', user.id);

      return { success: true, newCountDelta: -1 };
    } else {
      // Insert interaction (Trigger on DB auto increments prayed_count!)
      await supabase
        .from('prayer_wall_interactions')
        .insert({
          request_id: requestId,
          user_id: user.id
        });

      return { success: true, newCountDelta: 1 };
    }
  } catch (e) {
    console.warn('togglePrayedForRequest error:', e);
    return { success: false, newCountDelta: 0 };
  }
};
