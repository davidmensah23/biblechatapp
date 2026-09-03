import { supabase } from './supabase';
import { getUserAvatarEmblem } from './avatarService';

export interface CommunityPostComment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  commentText: string;
  parentCommentId?: string;
  likesCount?: number;
  hasLiked?: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  category: 'church' | 'testimonies' | 'gratitude' | 'fellowship' | 'daily_walk';
  imageUrl: string;
  caption: string;
  churchTag?: string;
  rejoiceCount: number;
  commentsCount: number;
  createdAt: string;
  hasUserRejoiced?: boolean;
  isUserAuthor?: boolean;
}

// Curated authentic community posts (graceful fallback if table is brand new or offline)
const FALLBACK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'seed-post-1',
    userId: 'seed-user-1',
    authorName: 'Grace Mensah',
    authorAvatar: 'dove',
    category: 'church',
    imageUrl: 'https://images.unsplash.com/photo-1519491058846-248d2eb97fa9?auto=format&fit=crop&w=1000&q=80',
    caption: 'Sunday fellowship at Accra Grace Cathedral! Grateful for our worship choir and the message on Psalm 23. If anyone is in the area and needs a church home, come sit with us next Sunday! 🙌',
    churchTag: 'Grace Chapel · Accra',
    rejoiceCount: 34,
    commentsCount: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    hasUserRejoiced: false,
    isUserAuthor: false,
  },
  {
    id: 'seed-post-2',
    userId: 'seed-user-2',
    authorName: 'Emmanuel Asante',
    authorAvatar: 'flame',
    category: 'testimonies',
    imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1000&q=80',
    caption: 'God answered our 3-month prayer for my brother’s visa and medical clearance! We gathered as a family to sing praises tonight. Never give up on prayer!',
    churchTag: 'Family Circle · Kumasi',
    rejoiceCount: 52,
    commentsCount: 11,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    hasUserRejoiced: false,
    isUserAuthor: false,
  },
  {
    id: 'seed-post-3',
    userId: 'seed-user-3',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'blossom',
    category: 'daily_walk',
    imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80',
    caption: '“The heavens declare the glory of God; the skies proclaim the work of his hands.” - Psalm 19:1. Peaceful morning prayer walk before work.',
    churchTag: 'Morning Devotion',
    rejoiceCount: 28,
    commentsCount: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    hasUserRejoiced: false,
    isUserAuthor: false,
  },
  {
    id: 'seed-post-4',
    userId: 'seed-user-4',
    authorName: 'Kwabena Osei',
    authorAvatar: 'anchor',
    category: 'fellowship',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
    caption: 'Youth & Young Adult discipleship group meeting over hot tea and Romans 8. God is raising a faithful generation. Iron sharpens iron! ⚔️',
    churchTag: 'Calvary Fellowship',
    rejoiceCount: 41,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    hasUserRejoiced: false,
    isUserAuthor: false,
  }
];

export const fetchCommunityPosts = async (category?: string): Promise<CommunityPost[]> => {
  try {
    let query = supabase
      .from('community_posts')
      .select('*, community_post_comments(count)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (category && category !== 'all') {
        return FALLBACK_COMMUNITY_POSTS.filter(p => p.category === category);
      }
      return FALLBACK_COMMUNITY_POSTS;
    }

    // Check interactions for current user if logged in
    const { data: { user } } = await supabase.auth.getUser();
    let userRejoices = new Set<string>();

    if (user) {
      const { data: interactions } = await supabase
        .from('community_post_interactions')
        .select('post_id')
        .eq('user_id', user.id);

      if (interactions) {
        userRejoices = new Set(interactions.map(i => i.post_id));
      }
    }

    const remotePosts: CommunityPost[] = data.map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      authorName: p.author_name || 'Fellow Pilgrim',
      authorAvatar: p.author_avatar,
      category: p.category,
      imageUrl: p.image_url,
      caption: p.caption || '',
      churchTag: p.church_tag,
      rejoiceCount: p.rejoice_count || 0,
      commentsCount: p.community_post_comments?.[0]?.count || 0,
      createdAt: p.created_at,
      hasUserRejoiced: userRejoices.has(p.id),
      isUserAuthor: user ? user.id === p.user_id : false,
    }));

    return remotePosts;
  } catch (e) {
    console.warn('fetchCommunityPosts fallback:', e);
    if (category && category !== 'all') {
      return FALLBACK_COMMUNITY_POSTS.filter(p => p.category === category);
    }
    return FALLBACK_COMMUNITY_POSTS;
  }
};

export const createCommunityPost = async (
  imageUrl: string,
  caption: string,
  category: string = 'fellowship',
  churchTag?: string
): Promise<{ success: boolean; post?: CommunityPost; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Please sign in to share with the community.' };
    }

    const authorName = user.user_metadata?.full_name || 'Fellow Pilgrim';
    const userEmblem = await getUserAvatarEmblem();

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        author_name: authorName,
        author_avatar: userEmblem.id,
        category,
        image_url: imageUrl,
        caption,
        church_tag: churchTag,
        rejoice_count: 0,
        comments_count: 0
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Could not publish post.' };
    }

    return {
      success: true,
      post: {
        id: data.id,
        userId: data.user_id,
        authorName,
        authorAvatar: userEmblem.id,
        category: data.category,
        imageUrl: data.image_url,
        caption: data.caption,
        churchTag: data.church_tag,
        rejoiceCount: 0,
        commentsCount: 0,
        createdAt: data.created_at,
        hasUserRejoiced: false,
        isUserAuthor: true,
      }
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error' };
  }
};

export const toggleRejoiceForPost = async (
  postId: string,
  currentlyRejoiced: boolean
): Promise<{ success: boolean; newCountDelta: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, newCountDelta: 0 };

    if (currentlyRejoiced) {
      await supabase
        .from('community_post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      return { success: true, newCountDelta: -1 };
    } else {
      await supabase
        .from('community_post_interactions')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      return { success: true, newCountDelta: 1 };
    }
  } catch (e) {
    console.warn('toggleRejoiceForPost error:', e);
    return { success: false, newCountDelta: 0 };
  }
};

export const fetchPostComments = async (postId: string): Promise<CommunityPostComment[]> => {
  try {
    const { data, error } = await supabase
      .from('community_post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      postId: c.post_id,
      userId: c.user_id,
      authorName: c.author_name,
      authorAvatar: c.author_avatar,
      commentText: c.comment_text,
      parentCommentId: c.parent_comment_id,
      createdAt: c.created_at
    }));
  } catch (e) {
    console.warn('fetchPostComments error:', e);
    return [];
  }
};

export const addPostComment = async (
  postId: string,
  commentText: string,
  parentCommentId?: string
): Promise<{ success: boolean; comment?: CommunityPostComment; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Please sign in to leave encouragement.' };

    const authorName = user.user_metadata?.full_name || 'Fellow Pilgrim';
    const userEmblem = await getUserAvatarEmblem();

    const insertPayload: any = {
      post_id: postId,
      user_id: user.id,
      author_name: authorName,
      author_avatar: userEmblem.id,
      comment_text: commentText
    };
    if (parentCommentId) {
      insertPayload.parent_comment_id = parentCommentId;
    }

    const { data, error } = await supabase
      .from('community_post_comments')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !data) return { success: false, error: error?.message || 'Could not post' };

    return {
      success: true,
      comment: {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        authorName: data.author_name,
        authorAvatar: data.author_avatar,
        commentText: data.comment_text,
        parentCommentId: data.parent_comment_id || parentCommentId,
        createdAt: data.created_at,
        likesCount: 0,
        hasLiked: false
      }
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error' };
  }
};
