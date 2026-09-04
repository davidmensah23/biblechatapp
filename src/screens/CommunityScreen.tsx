import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Platform,
  SafeAreaView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  RefreshControl,
  Alert,
  LayoutChangeEvent
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';
import { SpringConfigs } from '../theme/animations';
import {
  PrayerRequest,
  PrayerComment,
  fetchPrayerWallRequests,
  createPrayerRequest,
  togglePrayedForRequest,
  markPrayerAsAnswered,
  fetchPrayerComments,
  addPrayerComment,
  toggleCommentLike
} from '../services/prayerWallService';
import {
  CommunityPost,
  CommunityPostComment,
  fetchCommunityPosts,
  createCommunityPost,
  toggleRejoiceForPost,
  fetchPostComments,
  addPostComment
} from '../services/communityPostsService';
import { getAvatarEmblem } from '../services/avatarService';
import { MascotAssets } from '../services/mascotAssets';
import { InteractiveGestureSheet } from '../components/InteractiveGestureSheet';
import { CustomConfirmationModal } from '../components/CustomConfirmationModal';
import { CustomActionMenuModal, ActionMenuItem } from '../components/CustomActionMenuModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Curated spiritual preset photos for easy testing and posting
const PHOTO_PRESETS = [
  { id: 'worship', label: 'Worship', url: 'https://images.unsplash.com/photo-1519491058846-248d2eb97fa9?auto=format&fit=crop&w=1000&q=80' },
  { id: 'fellowship', label: 'Fellowship', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80' },
  { id: 'devotion', label: 'Devotion', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80' },
  { id: 'testimony', label: 'Celebration', url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1000&q=80' },
  { id: 'scripture', label: 'Scripture', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1000&q=80' }
];

// Relative Time Formatter (Compact e.g. 41w, 2h, Just now)
const getRelativeTime = (isoString?: string): string => {
  if (!isoString) return '';
  const now = Date.now();
  const date = new Date(isoString).getTime();
  if (isNaN(date)) return '';
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w`;
};

interface CommunityScreenProps {
  initialSegment?: 'community' | 'my_prayers';
  onNavigateToBible?: (book?: string, chapter?: number) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  initialSegment = 'community'
}) => {
  // Top-Level Twin Tabs (Matching HomeScreen For You / AI Companions)
  const [activeTopTab, setActiveTopTab] = useState<'community' | 'prayerWall'>(
    initialSegment === 'my_prayers' ? 'prayerWall' : 'community'
  );

  // Prayer Wall Sub-Segment ('community' prayers vs 'my_prayers')
  const [prayerSubSegment, setPrayerSubSegment] = useState<'community' | 'my_prayers'>(
    initialSegment === 'my_prayers' ? 'my_prayers' : 'community'
  );

  // Reanimated Tab Indicator
  const tabIndicatorOffset = useSharedValue(activeTopTab === 'community' ? 0 : 124);
  const tabIndicatorWidth = useSharedValue(activeTopTab === 'community' ? 104 : 110);

  // Community Posts Feed State
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPostCategory, setSelectedPostCategory] = useState<string>('all');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Prayer Wall Feed State
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(true);
  const [selectedPrayerCategory, setSelectedPrayerCategory] = useState<string>('all');

  // Universal Refresh & Moderation State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportedItemTitle, setReportedItemTitle] = useState('');
  const [reportedItemId, setReportedItemId] = useState('');

  // 3-Dot Options Action Menu State
  const [actionMenuState, setActionMenuState] = useState<{
    visible: boolean;
    title: string;
    subtitle?: string;
    options: ActionMenuItem[];
  }>({
    visible: false,
    title: '',
    options: []
  });

  // Create Community Post Modal State
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostImage, setNewPostImage] = useState(PHOTO_PRESETS[0].url);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CommunityPost['category']>('fellowship');
  const [newPostChurchTag, setNewPostChurchTag] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Create Prayer Request Modal State
  const [showCreatePrayerModal, setShowCreatePrayerModal] = useState(false);
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerText, setNewPrayerText] = useState('');
  const [newPrayerCategory, setNewPrayerCategory] = useState<PrayerRequest['category']>('general');
  const [isAnonymousPrayer, setIsAnonymousPrayer] = useState(false);
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState(false);

  // Mark Answered Modal State
  const [showAnsweredModal, setShowAnsweredModal] = useState(false);
  const [selectedRequestForAnswer, setSelectedRequestForAnswer] = useState<PrayerRequest | null>(null);
  const [praiseReportText, setPraiseReportText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Encouragements / Comments Sheet State
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [activeCommentsTarget, setActiveCommentsTarget] = useState<{
    id: string;
    type: 'prayer' | 'post';
    title: string;
  } | null>(null);
  const [comments, setComments] = useState<Array<PrayerComment | CommunityPostComment>>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToName, setReplyingToName] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Tab Layouts for Dynamic Indicator Tracking (Matching HomeScreen)
  const [tabLayouts, setTabLayouts] = useState<{
    community?: { x: number; width: number };
    prayerWall?: { x: number; width: number };
  }>({});

  const handleTabLayout = (tab: 'community' | 'prayerWall', e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    const indicatorW = Math.max(30, width - 20);
    setTabLayouts(prev => {
      const updated = { ...prev, [tab]: { x, width: indicatorW } };
      if (tab === activeTopTab) {
        tabIndicatorOffset.value = withSpring(x, SpringConfigs.bouncy);
        tabIndicatorWidth.value = withSpring(indicatorW, SpringConfigs.bouncy);
      }
      return updated;
    });
  };

  // Synchronize Tab Indicator
  const switchTopTab = (tab: 'community' | 'prayerWall') => {
    setActiveTopTab(tab);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    const layout = tabLayouts[tab];
    if (layout) {
      tabIndicatorOffset.value = withSpring(layout.x, SpringConfigs.bouncy);
      tabIndicatorWidth.value = withSpring(layout.width, SpringConfigs.bouncy);
    } else {
      if (tab === 'community') {
        tabIndicatorOffset.value = withSpring(0, SpringConfigs.bouncy);
        tabIndicatorWidth.value = withSpring(104, SpringConfigs.bouncy);
      } else {
        tabIndicatorOffset.value = withSpring(124, SpringConfigs.bouncy);
        tabIndicatorWidth.value = withSpring(110, SpringConfigs.bouncy);
      }
    }
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorOffset.value }],
    width: tabIndicatorWidth.value,
  }));

  // Initial Load & Category Loaders
  const loadPosts = async (cat = selectedPostCategory) => {
    setIsLoadingPosts(true);
    const data = await fetchCommunityPosts(cat);
    setPosts(data);
    setIsLoadingPosts(false);
  };

  const loadPrayers = async (cat = selectedPrayerCategory) => {
    setIsLoadingPrayers(true);
    const data = await fetchPrayerWallRequests(cat);
    setRequests(data);
    setIsLoadingPrayers(false);
  };

  useEffect(() => {
    loadPosts(selectedPostCategory);
  }, [selectedPostCategory]);

  useEffect(() => {
    loadPrayers(selectedPrayerCategory);
  }, [selectedPrayerCategory]);

  useEffect(() => {
    if (initialSegment === 'my_prayers') {
      switchTopTab('prayerWall');
      setPrayerSubSegment('my_prayers');
    }
  }, [initialSegment]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    await Promise.all([
      loadPosts(selectedPostCategory),
      loadPrayers(selectedPrayerCategory)
    ]);
    setIsRefreshing(false);
  };

  // Community Post Rejoice / Like
  const handleToggleRejoice = async (post: CommunityPost) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const currentlyRejoiced = Boolean(post.hasUserRejoiced);
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          hasUserRejoiced: !currentlyRejoiced,
          rejoiceCount: currentlyRejoiced ? Math.max(0, p.rejoiceCount - 1) : p.rejoiceCount + 1
        };
      }
      return p;
    }));

    await toggleRejoiceForPost(post.id, currentlyRejoiced);
  };

  // Prayer Wall Heart Like
  const handleTogglePrayed = async (req: PrayerRequest) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const currentlyPrayed = Boolean(req.hasUserPrayed);
    setRequests(prev => prev.map(r => {
      if (r.id === req.id) {
        return {
          ...r,
          hasUserPrayed: !currentlyPrayed,
          prayedCount: currentlyPrayed ? Math.max(0, r.prayedCount - 1) : r.prayedCount + 1
        };
      }
      return r;
    }));

    await togglePrayedForRequest(req.id, currentlyPrayed);
  };

  // Create Post
  const handleCreatePost = async () => {
    if (!newPostCaption.trim()) {
      Alert.alert("Caption Required", "Please share a short testimony or reflection.");
      return;
    }
    setIsSubmittingPost(true);
    const res = await createCommunityPost(
      newPostImage,
      newPostCaption,
      newPostCategory,
      newPostChurchTag.trim() || undefined
    );
    setIsSubmittingPost(false);

    if (res.success && res.post) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
      setPosts(prev => [res.post!, ...prev]);
      setShowCreatePostModal(false);
      setNewPostCaption('');
      setNewPostChurchTag('');
    } else {
      Alert.alert("Error", res.error || "Failed to publish post.");
    }
  };

  // Create Prayer Request
  const handleCreatePrayer = async () => {
    if (!newPrayerTitle.trim() || !newPrayerText.trim()) return;
    setIsSubmittingPrayer(true);
    const res = await createPrayerRequest(newPrayerTitle, newPrayerText, newPrayerCategory, isAnonymousPrayer);
    setIsSubmittingPrayer(false);

    if (res.success && res.request) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
      setRequests(prev => [res.request!, ...prev]);
      setShowCreatePrayerModal(false);
      setNewPrayerTitle('');
      setNewPrayerText('');
      setNewPrayerCategory('general');
      setIsAnonymousPrayer(false);
    } else {
      Alert.alert("Error", res.error || "Failed to post prayer request.");
    }
  };

  // Mark Prayer Answered
  const handleMarkAsAnswered = async () => {
    if (!selectedRequestForAnswer || !praiseReportText.trim()) return;
    setIsSubmittingAnswer(true);
    const res = await markPrayerAsAnswered(selectedRequestForAnswer.id, praiseReportText);
    setIsSubmittingAnswer(false);

    if (res.success) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
      setRequests(prev => prev.map(r => {
        if (r.id === selectedRequestForAnswer.id) {
          return {
            ...r,
            isAnswered: true,
            praiseReport: praiseReportText,
            answeredAt: new Date().toISOString()
          };
        }
        return r;
      }));
      setShowAnsweredModal(false);
      setPraiseReportText('');
      setSelectedRequestForAnswer(null);
    } else {
      Alert.alert("Error", res.error || "Failed to update prayer.");
    }
  };

  // Open Comments
  const handleOpenComments = async (item: PrayerRequest | CommunityPost, type: 'prayer' | 'post') => {
    const title = type === 'prayer' ? (item as PrayerRequest).title : ((item as CommunityPost).caption || 'Post');
    setActiveCommentsTarget({ id: item.id, type, title });
    setShowCommentsSheet(true);
    setIsLoadingComments(true);
    setReplyingToName(null);
    setReplyingToId(null);

    if (type === 'prayer') {
      const list = await fetchPrayerComments(item.id);
      setComments(list);
    } else {
      const list = await fetchPostComments(item.id);
      setComments(list);
    }
    setIsLoadingComments(false);
  };

  const handleSendComment = async () => {
    if (!activeCommentsTarget || !newCommentText.trim()) return;
    setIsSendingComment(true);

    if (activeCommentsTarget.type === 'prayer') {
      const res = await addPrayerComment(activeCommentsTarget.id, newCommentText, replyingToId || undefined);
      setIsSendingComment(false);
      if (res.success && res.comment) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
        setComments(prev => [...prev, res.comment!]);
        setNewCommentText('');
        setReplyingToName(null);
        setReplyingToId(null);
        setRequests(prev => prev.map(r => r.id === activeCommentsTarget.id ? { ...r, commentsCount: r.commentsCount + 1 } : r));
      }
    } else {
      const res = await addPostComment(activeCommentsTarget.id, newCommentText, replyingToId || undefined);
      setIsSendingComment(false);
      if (res.success && res.comment) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
        setComments(prev => [...prev, res.comment!]);
        setNewCommentText('');
        setReplyingToName(null);
        setReplyingToId(null);
        setPosts(prev => prev.map(p => p.id === activeCommentsTarget.id ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      }
    }
  };

  // Moderation & Reporting
  const handleOpenReportModal = (id: string, title: string) => {
    setReportedItemId(id);
    setReportedItemTitle(title);
    setReportModalVisible(true);
  };

  const handleConfirmReport = () => {
    if (reportedItemId) {
      setHiddenIds(prev => new Set(prev).add(reportedItemId));
      setReportModalVisible(false);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
      Alert.alert(
        "Content Reported",
        "Thank you for keeping our community sacred. This post has been hidden from your feed and flagged for moderation review."
      );
    }
  };

  const handleShare = async (title: string, text: string, url: string) => {
    try {
      await Share.share({
        message: `“${title}”
${text}

Join us on Bible Chat App:
${url}`,
        url,
        title
      });
    } catch (e) {}
  };

  // Category Filter Pills Definitions
  const communityCategories = [
    { id: 'all', label: 'All Moments' },
    { id: 'church', label: '⛪ Church Life' },
    { id: 'testimonies', label: '🕊️ Testimonies' },
    { id: 'gratitude', label: '🙌 Gratitude' },
    { id: 'fellowship', label: '🤝 Fellowship' },
    { id: 'daily_walk', label: '🌿 Daily Walk' },
  ];

  const prayerCategories = [
    { id: 'all', label: 'All Prayers' },
    { id: 'answered', label: '🙌 Praise Reports' },
    { id: 'healing', label: '🌿 Healing' },
    { id: 'peace', label: '🕊️ Peace' },
    { id: 'family', label: '👨‍👩‍👧 Family' },
    { id: 'guidance', label: '🧭 Guidance' },
    { id: 'thanksgiving', label: '🙏 Thanksgiving' },
  ];

  // Filtered Requests
  const visiblePosts = posts.filter(p => !hiddenIds.has(p.id));
  const visiblePrayers = requests.filter(r => !hiddenIds.has(r.id));
  const myPrayers = visiblePrayers.filter(r => r.isUserAuthor);
  const displayPrayers = prayerSubSegment === 'my_prayers' ? myPrayers : visiblePrayers;

  return (
    <SafeAreaView style={styles.container}>
      {/* ========================================================================= */}
      {/* TOP HEADER WITH TWIN TABS & SLIDING RED INDICATOR (Matching HomeScreen) */}
      {/* ========================================================================= */}
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {/* Animated Red Accent Line on Top */}
          <Animated.View style={[styles.topRedIndicator, animatedIndicatorStyle]} />

          {/* Tab 1: Community */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => switchTopTab('community')}
            onLayout={(e) => handleTabLayout('community', e)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTopTab === 'community' ? styles.tabTextActive : styles.tabTextInactive]}>
              Community
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Prayer Wall */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => switchTopTab('prayerWall')}
            onLayout={(e) => handleTabLayout('prayerWall', e)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTopTab === 'prayerWall' ? styles.tabTextActive : styles.tabTextInactive]}>
              Prayer Wall
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Header Action Button */}
        {activeTopTab === 'community' ? (
          <TouchableOpacity
            style={styles.headerStrokeBtn}
            onPress={() => setShowCreatePostModal(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="camera-outline" size={15} color="#111827" style={{ marginRight: 4 }} />
            <Text style={styles.headerStrokeBtnText}>Share</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerStrokeBtn}
            onPress={() => setShowCreatePrayerModal(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={15} color="#111827" style={{ marginRight: 3 }} />
            <Text style={styles.headerStrokeBtnText}>Ask Prayer</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
            colors={['#111827']}
          />
        }
      >
        {/* ========================================================================= */}
        {/* TAB 1: COMMUNITY FAITH LIFE & PHOTO FEED */}
        {/* ========================================================================= */}
        {activeTopTab === 'community' && (
          <>
            {/* Scrollable Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {communityCategories.map((c) => {
                const isActive = selectedPostCategory === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setSelectedPostCategory(c.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Posts Feed */}
            {isLoadingPosts ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#111827" />
                <Text style={styles.loadingText}>Loading community fellowship...</Text>
              </View>
            ) : visiblePosts.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="images-outline" size={38} color="#9CA3AF" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No community moments yet</Text>
                <Text style={styles.emptySub}>Share a photo of your church fellowship, answered prayer, or daily walk with Christ.</Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setShowCreatePostModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionText}>Share First Moment</Text>
                </TouchableOpacity>
              </View>
            ) : (
              visiblePosts.map((post) => {
                const emblem = getAvatarEmblem(post.authorAvatar);
                const relTime = getRelativeTime(post.createdAt);

                return (
                  <View key={post.id} style={styles.photoCard}>
                    {/* Author & Church Tag Row */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.avatarCircle, { backgroundColor: emblem.bgColor }]}>
                        <Text style={styles.avatarEmoji}>{emblem.emoji}</Text>
                      </View>
                      <View style={styles.authorMeta}>
                        <Text style={styles.authorName}>{post.authorName}</Text>
                        <View style={styles.timeTagRow}>
                          {post.churchTag ? (
                            <View style={styles.churchBadge}>
                              <Ionicons name="location-outline" size={10} color="#4B5563" style={{ marginRight: 2 }} />
                              <Text style={styles.churchBadgeText} numberOfLines={1}>{post.churchTag}</Text>
                            </View>
                          ) : (
                            <Text style={styles.timeText}>Shared in fellowship</Text>
                          )}
                        </View>
                      </View>

                      {/* Header Right: Relative Time & 3-Dot Moderation Menu */}
                      <View style={styles.headerRightActions}>
                        {relTime ? <Text style={styles.relTimeText}>{relTime}</Text> : null}
                        <TouchableOpacity
                          onPress={() => {
                            setActionMenuState({
                              visible: true,
                              title: "Community Options",
                              subtitle: post.caption?.slice(0, 60) + '...',
                              options: [
                                {
                                  label: "Share Post",
                                  icon: "share-social-outline",
                                  onPress: () => handleShare(post.authorName, post.caption, `https://biblechatapp.com/community/${post.id}`)
                                },
                                {
                                  label: "Hide Post",
                                  icon: "eye-off-outline",
                                  onPress: () => setHiddenIds(prev => new Set(prev).add(post.id))
                                },
                                {
                                  label: "Report Inappropriate Content",
                                  icon: "flag-outline",
                                  isDestructive: true,
                                  onPress: () => handleOpenReportModal(post.id, post.caption)
                                }
                              ]
                            });
                          }}
                          activeOpacity={0.7}
                          style={styles.moreBtn}
                        >
                          <Ionicons name="ellipsis-horizontal" size={17} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* 16:9 Clean Rounded Photo */}
                    <View style={styles.photoContainer}>
                      <Image source={{ uri: post.imageUrl }} style={styles.photoMedia} resizeMode="cover" />
                    </View>

                    {/* Caption */}
                    <Text style={styles.photoCaption}>{post.caption}</Text>

                    {/* Card Footer Actions */}
                    <View style={styles.cardFooter}>
                      <View style={styles.footerLeftActions}>
                        <TouchableOpacity
                          style={styles.footerIconBtn}
                          onPress={() => handleToggleRejoice(post)}
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name={post.hasUserRejoiced ? "heart" : "heart-outline"}
                            size={21}
                            color={post.hasUserRejoiced ? "#E11D48" : "#222222"}
                          />
                          {post.rejoiceCount > 0 && (
                            <Text style={[styles.footerCountText, post.hasUserRejoiced && styles.footerCountTextActive]}>
                              {post.rejoiceCount}
                            </Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.footerIconBtn}
                          onPress={() => handleOpenComments(post, 'post')}
                          activeOpacity={0.75}
                        >
                          <Ionicons name="chatbubble-outline" size={19} color="#222222" />
                          {post.commentsCount > 0 && (
                            <Text style={styles.footerCountText}>{post.commentsCount}</Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleShare(post.authorName, post.caption, `https://biblechatapp.com/community/${post.id}`)}
                          activeOpacity={0.7}
                          style={styles.footerIconBtn}
                        >
                          <Ionicons name="share-outline" size={19} color="#222222" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.footerRightAction}>
                        <TouchableOpacity
                          style={[styles.bottomRightBtn, post.hasUserRejoiced && styles.bottomRightBtnActive]}
                          onPress={() => handleToggleRejoice(post)}
                          activeOpacity={0.85}
                        >
                          <Ionicons
                            name={post.hasUserRejoiced ? "heart" : "heart-outline"}
                            size={14}
                            color={post.hasUserRejoiced ? "#E11D48" : "#111111"}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={[styles.bottomRightBtnText, post.hasUserRejoiced && styles.bottomRightBtnTextActive]}>
                            {post.hasUserRejoiced ? 'Rejoiced' : 'Rejoice'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRAYER WALL FEED (Our Complete Sacred Experience) */}
        {/* ========================================================================= */}
        {activeTopTab === 'prayerWall' && (
          <>
            {/* Mascot Scripture Hero Card */}
            <View style={styles.mascotHeroCard}>
              <Image source={MascotAssets.group} style={styles.mascotHeroBgImage} resizeMode="cover" />
              <View style={styles.mascotHeroOverlay} />
              <View style={styles.mascotHeroContent}>
                <View style={styles.mascotVerseTag}>
                  <Text style={styles.mascotVerseTagText}>GALATIANS 6:2</Text>
                </View>
                <Text style={styles.mascotVerseQuote}>
                  “Bear one another’s burdens, and so fulfill the law of Christ.”
                </Text>
                <TouchableOpacity
                  style={styles.heroDarkFillBtn}
                  onPress={() => setShowCreatePrayerModal(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="heart" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.heroDarkFillBtnText}>Ask for Prayer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Two-Segment Switcher: Community Prayers vs. My Prayers */}
            <View style={styles.segmentSwitcherWrap}>
              <TouchableOpacity
                style={[styles.segmentTab, prayerSubSegment === 'community' && styles.segmentTabActive]}
                onPress={() => setPrayerSubSegment('community')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentTabText, prayerSubSegment === 'community' && styles.segmentTabTextActive]}>
                  Community Prayers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentTab, prayerSubSegment === 'my_prayers' && styles.segmentTabActive]}
                onPress={() => setPrayerSubSegment('my_prayers')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentTabText, prayerSubSegment === 'my_prayers' && styles.segmentTabTextActive]}>
                  My Prayers {myPrayers.length > 0 ? `(${myPrayers.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter Chips for Prayers */}
            {prayerSubSegment === 'community' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {prayerCategories.map((c) => {
                  const isActive = selectedPrayerCategory === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                      onPress={() => setSelectedPrayerCategory(c.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Prayers List */}
            {isLoadingPrayers ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#111827" />
                <Text style={styles.loadingText}>Loading prayers...</Text>
              </View>
            ) : displayPrayers.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="heart-outline" size={38} color="#9CA3AF" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>
                  {prayerSubSegment === 'my_prayers' ? "You haven't posted any prayers yet" : "No prayers in this category yet"}
                </Text>
                <Text style={styles.emptySub}>
                  {prayerSubSegment === 'my_prayers'
                    ? "Tap 'Ask for Prayer' above to share your petition with the body of Christ."
                    : "Be the first to share a petition or praise report with fellow pilgrims."}
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setShowCreatePrayerModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionText}>Ask for Prayer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              displayPrayers.map((req) => {
                const emblem = getAvatarEmblem(req.authorAvatar);
                const relTime = getRelativeTime(req.createdAt);
                const initial = req.isAnonymous ? 'P' : (req.authorName?.trim()?.charAt(0) || 'U').toUpperCase();

                return (
                  <View key={req.id} style={styles.prayerCard}>
                    {/* Header Row: Circular Avatar, Author & Category Tag, Time & Options */}
                    <View style={styles.cardHeader}>
                      <View style={[
                        styles.avatarCircle,
                        req.isAnonymous ? styles.avatarCircleAnon : { backgroundColor: emblem.bgColor }
                      ]}>
                        {req.isAnonymous ? (
                          <Text style={styles.avatarInitialText}>P</Text>
                        ) : emblem.emoji ? (
                          <Text style={styles.avatarEmoji}>{emblem.emoji}</Text>
                        ) : (
                          <Text style={styles.avatarInitialText}>{initial}</Text>
                        )}
                      </View>
                      <View style={styles.authorMeta}>
                        <Text style={styles.authorName}>
                          {req.isUserAuthor ? 'You' : req.authorName}
                        </Text>
                        <View style={styles.timeTagRow}>
                          <View style={styles.tagPillInline}>
                            <Ionicons name="pricetag-outline" size={10} color="#6B7280" style={{ marginRight: 3 }} />
                            <Text style={styles.tagPillInlineText}>{req.category.toLowerCase()}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Header Right: Relative Time & 3-Dot Options */}
                      <View style={styles.headerRightActions}>
                        {relTime ? <Text style={styles.relTimeText}>{relTime}</Text> : null}
                        <TouchableOpacity
                          onPress={() => {
                            setActionMenuState({
                              visible: true,
                              title: "Prayer Options",
                              subtitle: `“${req.title}”`,
                              options: [
                                {
                                  label: "Share Prayer",
                                  icon: "share-social-outline",
                                  onPress: () => handleShare(req.title, req.requestText, `https://biblechatapp.com/prayer/${req.id}`)
                                },
                                {
                                  label: "Hide from Feed",
                                  icon: "eye-off-outline",
                                  onPress: () => setHiddenIds(prev => new Set(prev).add(req.id))
                                },
                                {
                                  label: "Report Content",
                                  icon: "flag-outline",
                                  isDestructive: true,
                                  onPress: () => handleOpenReportModal(req.id, req.title)
                                }
                              ]
                            });
                          }}
                          activeOpacity={0.7}
                          style={styles.moreBtn}
                        >
                          <Ionicons name="ellipsis-horizontal" size={17} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Sacred Callout Quote Block (Matching Saved Card reference media_1788558153062.jpg) */}
                    <View style={styles.calloutBlock}>
                      <View style={styles.calloutAccentLine} />
                      <View style={styles.calloutContent}>
                        {req.title ? (
                          <Text style={styles.calloutTitle}>{req.title}</Text>
                        ) : null}
                        <Text style={styles.calloutSerifText}>{req.requestText}</Text>
                      </View>
                    </View>

                    {/* Praise Report Banner if Answered */}
                    {req.isAnswered && req.praiseReport && (
                      <View style={styles.praiseReportBox}>
                        <View style={styles.praiseHeaderRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
                          <Text style={styles.praiseTitle}>Praise Report · God Answered!</Text>
                        </View>
                        <Text style={styles.praiseText}>“{req.praiseReport}”</Text>
                      </View>
                    )}

                    {/* Card Actions Footer: Left Outline Icons + Bottom-Right Action Button */}
                    <View style={styles.cardFooter}>
                      <View style={styles.footerLeftActions}>
                        <TouchableOpacity
                          style={styles.footerIconBtn}
                          onPress={() => handleTogglePrayed(req)}
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name={req.hasUserPrayed ? "heart" : "heart-outline"}
                            size={21}
                            color={req.hasUserPrayed ? "#E11D48" : "#222222"}
                          />
                          {req.prayedCount > 0 && (
                            <Text style={[styles.footerCountText, req.hasUserPrayed && styles.footerCountTextActive]}>
                              {req.prayedCount}
                            </Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.footerIconBtn}
                          onPress={() => handleOpenComments(req, 'prayer')}
                          activeOpacity={0.75}
                        >
                          <Ionicons name="chatbubble-outline" size={19} color="#222222" />
                          {req.commentsCount > 0 && (
                            <Text style={styles.footerCountText}>{req.commentsCount}</Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleShare(req.title, req.requestText, `https://biblechatapp.com/prayer/${req.id}`)}
                          activeOpacity={0.7}
                          style={styles.footerIconBtn}
                        >
                          <Ionicons name="share-outline" size={19} color="#222222" />
                        </TouchableOpacity>
                      </View>

                      {/* Right Action Button at Bottom Right Corner */}
                      <View style={styles.footerRightAction}>
                        {req.isUserAuthor && !req.isAnswered ? (
                          <TouchableOpacity
                            style={styles.bottomRightBtnDark}
                            onPress={() => {
                              setSelectedRequestForAnswer(req);
                              setShowAnsweredModal(true);
                            }}
                            activeOpacity={0.85}
                          >
                            <Ionicons name="trophy-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <Text style={styles.bottomRightBtnDarkText}>Mark Answered 🙌</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.bottomRightBtn, req.hasUserPrayed && styles.bottomRightBtnActive]}
                            onPress={() => handleTogglePrayed(req)}
                            activeOpacity={0.85}
                          >
                            <Ionicons
                              name={req.hasUserPrayed ? "heart" : "heart-outline"}
                              size={13}
                              color={req.hasUserPrayed ? "#E11D48" : "#111111"}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.bottomRightBtnText, req.hasUserPrayed && styles.bottomRightBtnTextActive]}>
                              {req.hasUserPrayed ? 'Prayed' : 'Pray'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. GESTURE SHEET: CREATE COMMUNITY POST */}
      {/* ========================================================================= */}
      <InteractiveGestureSheet
        visible={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        initialSnap="mid"
        midHeightRatio={0.88}
        fullHeightRatio={0.98}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContent}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Share a Faith Moment</Text>
            <TouchableOpacity onPress={() => setShowCreatePostModal(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Category Choice */}
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryPillRow}>
              {[
                { id: 'fellowship', label: '🤝 Fellowship' },
                { id: 'church', label: '⛪ Church Life' },
                { id: 'testimonies', label: '🕊️ Testimony' },
                { id: 'gratitude', label: '🙌 Gratitude' },
                { id: 'daily_walk', label: '🌿 Daily Walk' }
              ].map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryChoicePill, newPostCategory === c.id && styles.categoryChoicePillActive]}
                  onPress={() => setNewPostCategory(c.id as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChoiceText, newPostCategory === c.id && styles.categoryChoiceTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Spiritual Photo Preset Selection */}
            <Text style={styles.inputLabel}>Select Photo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {PHOTO_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.presetThumbWrap, newPostImage === p.url && styles.presetThumbWrapActive]}
                  onPress={() => setNewPostImage(p.url)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: p.url }} style={styles.presetThumb} />
                  <View style={styles.presetThumbOverlay}>
                    <Text style={styles.presetThumbLabel}>{p.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Church / Fellowship Tag */}
            <Text style={styles.inputLabel}>Church or Fellowship (Optional)</Text>
            <TextInput
              style={styles.inputTitle}
              placeholder="e.g. Grace Cathedral, Small Group, Home"
              placeholderTextColor="#9CA3AF"
              value={newPostChurchTag}
              onChangeText={setNewPostChurchTag}
            />

            {/* Caption */}
            <Text style={styles.inputLabel}>Your Testimony / Reflection</Text>
            <TextInput
              style={styles.inputText}
              placeholder="Share what God did, a word of encouragement, or a moment of thanksgiving..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={newPostCaption}
              onChangeText={setNewPostCaption}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitPostBtn, isSubmittingPost && { opacity: 0.7 }]}
              onPress={handleCreatePost}
              disabled={isSubmittingPost}
              activeOpacity={0.85}
            >
              {isSubmittingPost ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitPostBtnText}>Post to Community</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </InteractiveGestureSheet>

      {/* ========================================================================= */}
      {/* 2. GESTURE SHEET: CREATE PRAYER REQUEST */}
      {/* ========================================================================= */}
      <InteractiveGestureSheet
        visible={showCreatePrayerModal}
        onClose={() => setShowCreatePrayerModal(false)}
        initialSnap="mid"
        midHeightRatio={0.85}
        fullHeightRatio={0.98}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContent}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Ask for Prayer</Text>
            <TouchableOpacity onPress={() => setShowCreatePrayerModal(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.inputLabel}>Title / Core Need</Text>
            <TextInput
              style={styles.inputTitle}
              placeholder="e.g. Healing for my mother's surgery"
              placeholderTextColor="#9CA3AF"
              value={newPrayerTitle}
              onChangeText={setNewPrayerTitle}
            />

            <Text style={styles.inputLabel}>Prayer Petition</Text>
            <TextInput
              style={styles.inputText}
              placeholder="Describe what you are walking through so the body of Christ can intercede with you..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={newPrayerText}
              onChangeText={setNewPrayerText}
            />

            {/* Category Choices */}
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryPillRow}>
              {[
                { id: 'general', label: 'General' },
                { id: 'healing', label: '🌿 Healing' },
                { id: 'peace', label: '🕊️ Peace' },
                { id: 'family', label: '👨‍👩‍👧 Family' },
                { id: 'guidance', label: '🧭 Guidance' },
                { id: 'thanksgiving', label: '🙏 Praise' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryChoicePill, newPrayerCategory === c.id && styles.categoryChoicePillActive]}
                  onPress={() => setNewPrayerCategory(c.id as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChoiceText, newPrayerCategory === c.id && styles.categoryChoiceTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Anonymous Toggle */}
            <TouchableOpacity
              style={styles.anonToggleRow}
              onPress={() => setIsAnonymousPrayer(!isAnonymousPrayer)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isAnonymousPrayer ? "checkbox" : "square-outline"}
                size={20}
                color={isAnonymousPrayer ? "#DC2626" : "#9CA3AF"}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.anonToggleText}>Post Anonymously (as "A Fellow Pilgrim")</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitPostBtn, isSubmittingPrayer && { opacity: 0.7 }]}
              onPress={handleCreatePrayer}
              disabled={isSubmittingPrayer}
              activeOpacity={0.85}
            >
              {isSubmittingPrayer ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitPostBtnText}>Post to Prayer Wall</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </InteractiveGestureSheet>

      {/* ========================================================================= */}
      {/* 3. GESTURE SHEET: MARK AS ANSWERED */}
      {/* ========================================================================= */}
      <InteractiveGestureSheet
        visible={showAnsweredModal}
        onClose={() => setShowAnsweredModal(false)}
        initialSnap="mid"
        midHeightRatio={0.70}
        fullHeightRatio={0.95}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContent}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Share Praise Report 🙌</Text>
            <TouchableOpacity onPress={() => setShowAnsweredModal(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          <Text style={styles.answeredSub}>
            Give glory to God and encourage everyone who interceded with you.
          </Text>

          <TextInput
            style={styles.inputText}
            placeholder="Describe how God moved and answered this prayer..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={praiseReportText}
            onChangeText={setPraiseReportText}
          />

          <TouchableOpacity
            style={[styles.submitPostBtn, isSubmittingAnswer && { opacity: 0.7 }]}
            onPress={handleMarkAsAnswered}
            disabled={isSubmittingAnswer}
            activeOpacity={0.85}
          >
            {isSubmittingAnswer ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitPostBtnText}>Publish Praise Report 🙌</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </InteractiveGestureSheet>

      {/* ========================================================================= */}
      {/* 4. GESTURE SHEET: COMMENTS & ENCOURAGEMENTS */}
      {/* ========================================================================= */}
      <InteractiveGestureSheet
        visible={showCommentsSheet}
        onClose={() => setShowCommentsSheet(false)}
        initialSnap="mid"
        midHeightRatio={0.80}
        fullHeightRatio={0.98}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContent}>
          <View style={styles.modalHeaderRow}>
            <View>
              <Text style={styles.modalTitle}>Encouragements</Text>
              {activeCommentsTarget && (
                <Text style={styles.commentsSubtitle} numberOfLines={1}>
                  For: {activeCommentsTarget.title}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowCommentsSheet(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.commentsScrollArea}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoadingComments ? (
              <ActivityIndicator size="small" color="#111111" style={{ marginTop: 24 }} />
            ) : comments.length === 0 ? (
              <View style={styles.noCommentsWrap}>
                <Ionicons name="heart-outline" size={32} color="#9CA3AF" style={{ marginBottom: 6 }} />
                <Text style={styles.noCommentsText}>No written encouragements yet.</Text>
                <Text style={styles.noCommentsSub}>Leave a scripture, blessing, or short prayer to uplift this soul.</Text>
              </View>
            ) : (
              comments.map((c) => {
                const emblem = getAvatarEmblem(c.authorAvatar);
                return (
                  <View key={c.id} style={styles.commentItemCard}>
                    <View style={styles.commentItemRow}>
                      <View style={[styles.commentAvatarCircle, { backgroundColor: emblem.bgColor }]}>
                        <Text style={{ fontSize: 13 }}>{emblem.emoji}</Text>
                      </View>
                      <View style={styles.commentBubble}>
                        <View style={styles.commentHeaderRow}>
                          <Text style={styles.commentAuthorName}>{c.authorName}</Text>
                          <Text style={styles.commentTime}>Just now</Text>
                        </View>
                        <Text style={styles.commentContent}>{c.commentText}</Text>

                        <View style={styles.commentActionRow}>
                          <TouchableOpacity
                            onPress={() => {
                              setReplyingToName(c.authorName);
                              setReplyingToId(c.id);
                            }}
                            style={styles.commentReplyBtn}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.commentReplyBtnText}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {replyingToName && (
            <View style={styles.replyingBanner}>
              <Text style={styles.replyingBannerText} numberOfLines={1}>
                Replying to <Text style={{ fontWeight: 'bold' }}>@{replyingToName}</Text>
              </Text>
              <TouchableOpacity onPress={() => { setReplyingToName(null); setReplyingToId(null); }} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder={replyingToName ? `Reply to ${replyingToName}...` : "Write an encouraging prayer..."}
              placeholderTextColor="#9CA3AF"
              value={newCommentText}
              onChangeText={setNewCommentText}
            />
            <TouchableOpacity
              style={[styles.sendCommentBtn, isSendingComment && { opacity: 0.6 }]}
              onPress={handleSendComment}
              disabled={isSendingComment}
              activeOpacity={0.85}
            >
              {isSendingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </InteractiveGestureSheet>

      {/* UGC Moderation Modal */}
      <CustomConfirmationModal
        visible={reportModalVisible}
        title="Report Content"
        message={`Would you like to report "${reportedItemTitle.slice(0, 40)}..." for moderation review and hide it from your feed?`}
        confirmText="Report & Hide"
        cancelText="Cancel"
        confirmStyle="destructive"
        icon="flag-outline"
        onConfirm={handleConfirmReport}
        onCancel={() => setReportModalVisible(false)}
        onClose={() => setReportModalVisible(false)}
      />

      {/* 3-Dot Custom Action Menu Modal */}
      <CustomActionMenuModal
        visible={actionMenuState.visible}
        title={actionMenuState.title}
        subtitle={actionMenuState.subtitle}
        options={actionMenuState.options}
        onClose={() => setActionMenuState(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F3F5',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 10,
  },
  topRedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  tabButton: {
    paddingRight: 20,
    paddingVertical: 4,
  },
  tabText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  tabTextActive: {
    color: '#111111',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
  headerStrokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  headerStrokeBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111111',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // Scrollable Category Filter Chips
  filterRow: {
    paddingBottom: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterChipActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  filterChipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#111111',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansSemiBold,
  },

  // Community Photo Card
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarCircleAnon: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#111111',
  },
  avatarInitialText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#111111',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14.5,
    color: '#111111',
  },
  timeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  churchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  churchBadgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#4B5563',
    maxWidth: 140,
  },
  timeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#9CA3AF',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  relTimeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
  },
  moreBtn: {
    padding: 4,
  },
  photoContainer: {
    width: '100%',
    height: (SCREEN_WIDTH - 68) * 0.56, // Clean 16:9 ratio
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  photoMedia: {
    width: '100%',
    height: '100%',
  },
  photoCaption: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    lineHeight: 21,
    color: '#1F2937',
    marginBottom: 6,
  },

  // Prayer Wall Hero Card
  mascotHeroCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111827',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 155,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  mascotHeroBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  mascotHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  mascotHeroContent: {
    padding: 18,
    zIndex: 2,
  },
  mascotVerseTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  mascotVerseTagText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  mascotVerseQuote: {
    fontFamily: Typography.fontSerifMedium,
    fontSize: 15.5,
    lineHeight: 22,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  heroDarkFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroDarkFillBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Sub Segment Switcher
  segmentSwitcherWrap: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentTabText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  segmentTabTextActive: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111111',
  },

  // Prayer Card (Matching Profile Saved Card reference)
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  tagPillInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPillInlineText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
  calloutBlock: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 8,
    alignItems: 'stretch',
  },
  calloutAccentLine: {
    width: 3.5,
    backgroundColor: '#111111',
    borderRadius: 2,
    marginRight: 12,
  },
  calloutContent: {
    flex: 1,
  },
  calloutTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15.5,
    color: '#111111',
    marginBottom: 4,
    lineHeight: 20,
  },
  calloutSerifText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 15.5,
    lineHeight: 23,
    color: '#111111',
  },
  praiseReportBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  praiseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  praiseTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12.5,
    color: '#065F46',
  },
  praiseText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 13.5,
    color: '#047857',
    lineHeight: 19,
  },

  // Card Footer Actions
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 5,
  },
  footerCountText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#4B5563',
  },
  footerCountTextActive: {
    color: '#E11D48',
    fontFamily: Typography.fontSansBold,
  },
  footerRightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 14,
  },
  bottomRightBtnActive: {
    backgroundColor: '#FFE4E6',
  },
  bottomRightBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#111111',
  },
  bottomRightBtnTextActive: {
    color: '#E11D48',
  },
  bottomRightBtnDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 14,
  },
  bottomRightBtnDarkText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Empty & Loading states
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 10,
  },
  emptyWrap: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyActionText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Gesture Sheet Styles
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 17,
    color: '#111827',
  },
  commentsSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  inputLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#374151',
    marginTop: 10,
    marginBottom: 5,
  },
  inputTitle: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  inputText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 88,
  },
  categoryPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChoicePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChoicePillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  categoryChoiceText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#4B5563',
  },
  categoryChoiceTextActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansBold,
  },
  presetThumbWrap: {
    width: 90,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetThumbWrapActive: {
    borderColor: '#DC2626',
  },
  presetThumb: {
    width: '100%',
    height: '100%',
  },
  presetThumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetThumbLabel: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansBold,
    fontSize: 10.5,
  },
  anonToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  anonToggleText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#4B5563',
  },
  submitPostBtn: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  submitPostBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  answeredSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },

  // Comments Area
  commentsScrollArea: {
    flex: 1,
  },
  commentsListContent: {
    paddingBottom: 20,
  },
  noCommentsWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#374151',
  },
  noCommentsSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  commentItemCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    marginTop: 2,
  },
  commentBubble: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentAuthorName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12.5,
    color: '#111827',
  },
  commentTime: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: '#9CA3AF',
  },
  commentContent: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
  },
  commentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 5,
  },
  commentReplyBtn: {
    paddingVertical: 2,
  },
  commentReplyBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#6B7280',
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 6,
  },
  replyingBannerText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#4B5563',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    color: '#111827',
  },
  sendCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
