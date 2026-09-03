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
  Alert
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Curated spiritual preset photos for easy testing and posting
const PHOTO_PRESETS = [
  { id: 'worship', label: 'Worship', url: 'https://images.unsplash.com/photo-1519491058846-248d2eb97fa9?auto=format&fit=crop&w=1000&q=80' },
  { id: 'fellowship', label: 'Fellowship', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80' },
  { id: 'devotion', label: 'Devotion', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80' },
  { id: 'testimony', label: 'Celebration', url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1000&q=80' },
  { id: 'scripture', label: 'Scripture', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1000&q=80' }
];

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

  // Synchronize Tab Indicator
  const switchTopTab = (tab: 'community' | 'prayerWall') => {
    setActiveTopTab(tab);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (tab === 'community') {
      tabIndicatorOffset.value = withSpring(0, { damping: 22, stiffness: 220 });
      tabIndicatorWidth.value = withSpring(104, { damping: 22, stiffness: 220 });
    } else {
      tabIndicatorOffset.value = withSpring(120, { damping: 22, stiffness: 220 });
      tabIndicatorWidth.value = withSpring(112, { damping: 22, stiffness: 220 });
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
                          {post.churchTag && (
                            <View style={styles.churchBadge}>
                              <Ionicons name="location-outline" size={10} color="#4B5563" style={{ marginRight: 2 }} />
                              <Text style={styles.churchBadgeText} numberOfLines={1}>{post.churchTag}</Text>
                            </View>
                          )}
                          <Text style={styles.timeText}>Shared in fellowship</Text>
                        </View>
                      </View>

                      {/* 3-Dot Moderation & Share */}
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Community Options",
                            post.caption.slice(0, 50) + '...',
                            [
                              { text: "Share Post", onPress: () => handleShare(post.authorName, post.caption, `https://biblechatapp.com/community/${post.id}`) },
                              { text: "Report Inappropriate Content", style: "destructive", onPress: () => handleOpenReportModal(post.id, post.caption) },
                              { text: "Hide Post", onPress: () => setHiddenIds(prev => new Set(prev).add(post.id)) },
                              { text: "Cancel", style: "cancel" }
                            ]
                          );
                        }}
                        activeOpacity={0.7}
                        style={styles.moreBtn}
                      >
                        <Ionicons name="ellipsis-horizontal" size={17} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    {/* 16:9 Clean Rounded Photo */}
                    <View style={styles.photoContainer}>
                      <Image source={{ uri: post.imageUrl }} style={styles.photoMedia} resizeMode="cover" />
                    </View>

                    {/* Caption */}
                    <Text style={styles.photoCaption}>{post.caption}</Text>

                    {/* Card Footer Actions: Rejoice & Encourage */}
                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={[styles.likeHeartBtn, post.hasUserRejoiced && styles.likeHeartBtnActive]}
                        onPress={() => handleToggleRejoice(post)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={post.hasUserRejoiced ? "heart" : "heart-outline"}
                          size={17}
                          color={post.hasUserRejoiced ? "#E11D48" : "#4B5563"}
                          style={{ marginRight: 5 }}
                        />
                        <Text style={[styles.likeHeartBtnText, post.hasUserRejoiced && styles.likeHeartBtnTextActive]}>
                          {post.rejoiceCount > 0 ? `${post.rejoiceCount} Rejoice` : 'Rejoice'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.commentBtn}
                        onPress={() => handleOpenComments(post, 'post')}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="chatbubble-outline" size={15} color="#4B5563" style={{ marginRight: 5 }} />
                        <Text style={styles.commentBtnText}>
                          {post.commentsCount > 0 ? `${post.commentsCount} Encouragements` : 'Encourage'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleShare(post.authorName, post.caption, `https://biblechatapp.com/community/${post.id}`)}
                        activeOpacity={0.7}
                        style={styles.shareIconBtn}
                      >
                        <Ionicons name="share-outline" size={17} color="#6B7280" />
                      </TouchableOpacity>
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
                return (
                  <View key={req.id} style={styles.prayerCard}>
                    {/* Author Row */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.avatarCircle, { backgroundColor: req.isAnonymous ? '#F3F4F6' : emblem.bgColor }]}>
                        <Text style={styles.avatarEmoji}>{req.isAnonymous ? '🕊️' : emblem.emoji}</Text>
                      </View>
                      <View style={styles.authorMeta}>
                        <Text style={styles.authorName}>{req.authorName}</Text>
                        <View style={styles.timeTagRow}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{req.category.toUpperCase()}</Text>
                          </View>
                          <Text style={styles.timeText}>Shared in faith</Text>
                        </View>
                      </View>

                      {/* 3-Dot Card Options */}
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Prayer Options",
                            `“${req.title}”`,
                            [
                              { text: "Share Prayer", onPress: () => handleShare(req.title, req.requestText, `https://biblechatapp.com/prayer/${req.id}`) },
                              { text: "Report Content", style: "destructive", onPress: () => handleOpenReportModal(req.id, req.title) },
                              { text: "Hide from Feed", onPress: () => setHiddenIds(prev => new Set(prev).add(req.id)) },
                              { text: "Cancel", style: "cancel" }
                            ]
                          );
                        }}
                        activeOpacity={0.7}
                        style={styles.moreBtn}
                      >
                        <Ionicons name="ellipsis-horizontal" size={17} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.requestTitle}>{req.title}</Text>
                    <Text style={styles.requestBody}>{req.requestText}</Text>

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

                    {/* Prominent Mark as Answered Button */}
                    {req.isUserAuthor && !req.isAnswered && (
                      <View style={styles.answeredBtnContainer}>
                        <TouchableOpacity
                          style={styles.markAnsweredFillBtn}
                          onPress={() => {
                            setSelectedRequestForAnswer(req);
                            setShowAnsweredModal(true);
                          }}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="trophy-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.markAnsweredFillBtnText}>Mark as Answered 🙌</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Actions Footer */}
                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={[styles.likeHeartBtn, req.hasUserPrayed && styles.likeHeartBtnActive]}
                        onPress={() => handleTogglePrayed(req)}
                        activeOpacity={0.75}
                      >
                        <Ionicons
                          name={req.hasUserPrayed ? "heart" : "heart-outline"}
                          size={17}
                          color={req.hasUserPrayed ? "#E11D48" : "#4B5563"}
                          style={{ marginRight: 5 }}
                        />
                        <Text style={[styles.likeHeartBtnText, req.hasUserPrayed && styles.likeHeartBtnTextActive]}>
                          {req.prayedCount > 0 ? req.prayedCount : 'Pray'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.commentBtn}
                        onPress={() => handleOpenComments(req, 'prayer')}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="chatbubble-outline" size={15} color="#4B5563" style={{ marginRight: 5 }} />
                        <Text style={styles.commentBtnText}>
                          {req.commentsCount > 0 ? `${req.commentsCount} Encouragements` : 'Encourage'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleShare(req.title, req.requestText, `https://biblechatapp.com/prayer/${req.id}`)}
                        activeOpacity={0.7}
                        style={styles.shareIconBtn}
                      >
                        <Ionicons name="share-outline" size={17} color="#6B7280" />
                      </TouchableOpacity>
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
                color={isAnonymousPrayer ? "#8B1E1E" : "#9CA3AF"}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingTop: 4,
  },
  topRedIndicator: {
    position: 'absolute',
    top: -4,
    left: 0,
    height: 3,
    backgroundColor: '#8B1E1E',
    borderRadius: 2,
  },
  tabButton: {
    paddingVertical: 6,
    marginRight: 22,
  },
  tabText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 21,
    letterSpacing: -0.3,
  },
  tabTextActive: {
    color: '#111827',
  },
  tabTextInactive: {
    color: '#9CA3AF',
  },
  headerStrokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#111827',
    backgroundColor: 'transparent',
  },
  headerStrokeBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#111827',
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterChipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansSemiBold,
  },

  // Community Photo Card
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#111827',
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
    fontSize: 10,
    color: '#4B5563',
    maxWidth: 140,
  },
  timeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#9CA3AF',
  },
  moreBtn: {
    padding: 6,
  },
  photoContainer: {
    width: '100%',
    height: (SCREEN_WIDTH - 64) * 0.56, // Clean 16:9 ratio
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 10,
  },
  photoMedia: {
    width: '100%',
    height: '100%',
  },
  photoCaption: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    lineHeight: 19.5,
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
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentTabText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  segmentTabTextActive: {
    fontFamily: Typography.fontSansBold,
    color: '#111827',
  },

  // Prayer Card
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 9.5,
    color: '#374151',
    letterSpacing: 0.4,
  },
  requestTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15.5,
    color: '#111827',
    marginBottom: 6,
    lineHeight: 20,
  },
  requestBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    lineHeight: 19.5,
    color: '#374151',
  },
  praiseReportBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
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
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#047857',
    lineHeight: 17,
  },
  answeredBtnContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  markAnsweredFillBtn: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  markAnsweredFillBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },

  // Card Footer Actions
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  likeHeartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 8,
  },
  likeHeartBtnActive: {
    backgroundColor: '#FFE4E6',
  },
  likeHeartBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#374151',
  },
  likeHeartBtnTextActive: {
    color: '#E11D48',
    fontFamily: Typography.fontSansBold,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  commentBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#374151',
  },
  shareIconBtn: {
    marginLeft: 'auto',
    padding: 6,
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
    borderColor: '#8B1E1E',
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
