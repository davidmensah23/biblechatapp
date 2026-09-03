import { supabase } from './supabase';
import { getUserAvatarEmblem } from './avatarService';

export interface PrayerComment {
  id: string;
  requestId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  commentText: string;
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  category: 'general' | 'healing' | 'family' | 'guidance' | 'peace' | 'thanksgiving';
  title: string;
  requestText: string;
  prayedCount: number;
  commentsCount: number;
  isAnswered: boolean;
  answeredAt?: string;
  praiseReport?: string;
  createdAt: string;
  hasUserPrayed?: boolean;
  isUserAuthor?: boolean;
}

export const fetchPrayerWallRequests = async (
  category?: string
): Promise<PrayerRequest[]> => {
  try {
    let query = supabase
      .from('prayer_wall_requests')
      .select('*, prayer_wall_comments(count)')
      .order('created_at', { ascending: false })
      .limit(40);

    if (category && category !== 'all' && category !== 'answered') {
      query = query.eq('category', category);
    } else if (category === 'answered') {
      query = query.eq('is_answered', true);
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

    return data.map((r: any) => {
      const commentsCount = r.prayer_wall_comments?.[0]?.count || 0;
      return {
        id: r.id,
        userId: r.user_id,
        authorName: r.is_anonymous ? 'A Fellow Pilgrim' : r.author_name,
        authorAvatar: r.is_anonymous ? undefined : r.author_avatar,
        isAnonymous: r.is_anonymous,
        category: r.category,
        title: r.title,
        requestText: r.request_text,
        prayedCount: r.prayed_count || 0,
        commentsCount,
        isAnswered: Boolean(r.is_answered),
        answeredAt: r.answered_at,
        praiseReport: r.praise_report,
        createdAt: r.created_at,
        hasUserPrayed: userInteractions.has(r.id),
        isUserAuthor: user ? user.id === r.user_id : false,
      };
    });
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
    const userEmblem = await getUserAvatarEmblem();

    const { data, error } = await supabase
      .from('prayer_wall_requests')
      .insert({
        user_id: user.id,
        author_name: authorName,
        author_avatar: isAnonymous ? null : userEmblem.id,
        is_anonymous: isAnonymous,
        category,
        title,
        request_text: requestText,
        prayed_count: 0,
        is_answered: false
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
        authorAvatar: isAnonymous ? undefined : userEmblem.id,
        isAnonymous,
        category: data.category,
        title: data.title,
        requestText: data.request_text,
        prayedCount: 0,
        commentsCount: 0,
        isAnswered: false,
        createdAt: data.created_at,
        hasUserPrayed: false,
        isUserAuthor: true
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
      await supabase
        .from('prayer_wall_interactions')
        .delete()
        .eq('request_id', requestId)
        .eq('user_id', user.id);

      return { success: true, newCountDelta: -1 };
    } else {
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

export const markPrayerAsAnswered = async (
  requestId: string,
  praiseReport: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
      .from('prayer_wall_requests')
      .update({
        is_answered: true,
        answered_at: new Date().toISOString(),
        praise_report: praiseReport
      })
      .eq('id', requestId)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error updating prayer' };
  }
};

export const fetchPrayerComments = async (
  requestId: string
): Promise<PrayerComment[]> => {
  try {
    const { data, error } = await supabase
      .from('prayer_wall_comments')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      requestId: c.request_id,
      userId: c.user_id,
      authorName: c.author_name,
      authorAvatar: c.author_avatar,
      commentText: c.comment_text,
      createdAt: c.created_at
    }));
  } catch (e) {
    console.warn('fetchPrayerComments error:', e);
    return [];
  }
};

export const addPrayerComment = async (
  requestId: string,
  commentText: string
): Promise<{ success: boolean; comment?: PrayerComment; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Please sign in to post encouragement.' };

    const authorName = user.user_metadata?.full_name || 'Fellow Pilgrim';
    const userEmblem = await getUserAvatarEmblem();

    const { data, error } = await supabase
      .from('prayer_wall_comments')
      .insert({
        request_id: requestId,
        user_id: user.id,
        author_name: authorName,
        author_avatar: userEmblem.id,
        comment_text: commentText
      })
      .select()
      .single();

    if (error || !data) return { success: false, error: error?.message || 'Could not post' };

    return {
      success: true,
      comment: {
        id: data.id,
        requestId: data.request_id,
        userId: data.user_id,
        authorName: data.author_name,
        authorAvatar: data.author_avatar,
        commentText: data.comment_text,
        createdAt: data.created_at
      }
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error' };
  }
};
