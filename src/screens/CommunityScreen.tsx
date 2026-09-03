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
  KeyboardAvoidingView
} from 'react-native';
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
import { getAvatarEmblem } from '../services/avatarService';
import { MascotAssets } from '../services/mascotAssets';
import { InteractiveGestureSheet } from '../components/InteractiveGestureSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommunityScreenProps {
  initialSegment?: 'community' | 'my_prayers';
  onNavigateToBible?: (book?: string, chapter?: number) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  initialSegment = 'community'
}) => {
  const [activeTab, setActiveTab] = useState<'community' | 'my_prayers'>(initialSegment);
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Create Prayer Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<PrayerRequest['category']>('general');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark Answered Modal State
  const [showAnsweredModal, setShowAnsweredModal] = useState(false);
  const [selectedRequestForAnswer, setSelectedRequestForAnswer] = useState<PrayerRequest | null>(null);
  const [praiseReportText, setPraiseReportText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Comments / Encouragements Sheet State
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [activeRequestForComments, setActiveRequestForComments] = useState<PrayerRequest | null>(null);
  const [comments, setComments] = useState<PrayerComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<PrayerComment | null>(null);
  const [isSendingComment, setIsSendingComment] = useState(false);

  useEffect(() => {
    if (initialSegment) {
      setActiveTab(initialSegment);
    }
  }, [initialSegment]);

  const loadData = async (cat = selectedCategory) => {
    setIsLoading(true);
    const data = await fetchPrayerWallRequests(cat);
    setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData(selectedCategory);
  }, [selectedCategory]);

  const handleTogglePrayed = async (req: PrayerRequest) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const currentlyPrayed = Boolean(req.hasUserPrayed);
    // Optimistic UI update with Heart Like
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

  const handleCreateRequest = async () => {
    if (!newTitle.trim() || !newText.trim()) return;
    setIsSubmitting(true);
    const res = await createPrayerRequest(newTitle, newText, newCategory, isAnonymous);
    setIsSubmitting(false);

    if (res.success && res.request) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
      setRequests(prev => [res.request!, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewText('');
      setNewCategory('general');
      setIsAnonymous(false);
    } else {
      alert(res.error || 'Failed to post prayer request');
    }
  };

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
      alert(res.error || 'Failed to update prayer');
    }
  };

  const handleOpenComments = async (req: PrayerRequest) => {
    setActiveRequestForComments(req);
    setShowCommentsSheet(true);
    setIsLoadingComments(true);
    setReplyingTo(null);
    const list = await fetchPrayerComments(req.id);
    setComments(list);
    setIsLoadingComments(false);
  };

  const handleSendComment = async () => {
    if (!activeRequestForComments || !newCommentText.trim()) return;
    setIsSendingComment(true);
    const res = await addPrayerComment(
      activeRequestForComments.id,
      newCommentText,
      replyingTo?.id
    );
    setIsSendingComment(false);

    if (res.success && res.comment) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      setComments(prev => [...prev, res.comment!]);
      setNewCommentText('');
      setReplyingTo(null);
      // update count in request list
      setRequests(prev => prev.map(r => {
        if (r.id === activeRequestForComments.id) {
          return { ...r, commentsCount: r.commentsCount + 1 };
        }
        return r;
      }));
    } else {
      alert(res.error || 'Failed to post comment');
    }
  };

  const handleToggleCommentLike = async (comment: PrayerComment) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    const currentlyLiked = Boolean(comment.hasLiked);
    setComments(prev => prev.map(c => {
      if (c.id === comment.id) {
        return {
          ...c,
          hasLiked: !currentlyLiked,
          likesCount: currentlyLiked ? Math.max(0, (c.likesCount || 1) - 1) : (c.likesCount || 0) + 1
        };
      }
      return c;
    }));
    await toggleCommentLike(comment.id, currentlyLiked);
  };

  const handleSharePrayer = async (req: PrayerRequest) => {
    try {
      const shareUrl = `https://biblechatapp.com/prayer/${req.id}`;
      await Share.share({
        message: `“${req.title}”
${req.requestText}

Join us in lifting this prayer before God:
${shareUrl}`,
        url: shareUrl,
        title: req.title
      });
    } catch (e) {}
  };

  const categories = [
    { id: 'all', label: 'All Prayers' },
    { id: 'answered', label: '🙌 Praise Reports' },
    { id: 'healing', label: '🌿 Healing' },
    { id: 'peace', label: '🕊️ Peace' },
    { id: 'family', label: '👨‍👩‍👧 Family' },
    { id: 'guidance', label: '🧭 Guidance' },
    { id: 'thanksgiving', label: '🙏 Thanksgiving' },
  ];

  const myRequests = requests.filter(r => r.isUserAuthor);
  const displayRequests = activeTab === 'my_prayers' ? myRequests : requests;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Signature Red Accent Line */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.redAccentLine} />
          <Text style={styles.headerTitle}>Community</Text>
        </View>

        {/* Top Header Stroke Button for Ask Prayer */}
        <TouchableOpacity
          style={styles.askPrayerStrokeBtn}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="add" size={16} color="#111827" style={{ marginRight: 4 }} />
          <Text style={styles.askPrayerStrokeBtnText}>Ask Prayer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Horizontal Mascot Hero Card with Galatians 6:2 Scripture & Rounded Dark Filled Button */}
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
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.heroDarkFillBtnText}>Ask for Prayer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Two-Segment Tab Switcher: Community Prayers vs. My Prayers */}
        <View style={styles.segmentSwitcherWrap}>
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'community' && styles.segmentTabActive]}
            onPress={() => setActiveTab('community')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentTabText, activeTab === 'community' && styles.segmentTabTextActive]}>
              Community Prayers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentTab, activeTab === 'my_prayers' && styles.segmentTabActive]}
            onPress={() => setActiveTab('my_prayers')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentTabText, activeTab === 'my_prayers' && styles.segmentTabTextActive]}>
              My Prayers {myRequests.length > 0 ? `(${myRequests.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips (Shown in Community tab) */}
        {activeTab === 'community' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {categories.map((c) => {
              const isActive = selectedCategory === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(c.id)}
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

        {/* Prayer Cards Feed (Zero Shadows, Clean 1px Borders, Heart Likes) */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#111827" />
            <Text style={styles.loadingText}>Loading prayers...</Text>
          </View>
        ) : displayRequests.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="heart-outline" size={38} color="#9CA3AF" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'my_prayers' ? "You haven't posted any prayers yet" : "No prayers in this category yet"}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'my_prayers'
                ? "Tap 'Ask for Prayer' above to share your petition with the body of Christ."
                : "Be the first to share a petition or praise report with fellow pilgrims."}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyActionText}>Ask for Prayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayRequests.map((req) => {
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

                  <TouchableOpacity onPress={() => handleSharePrayer(req)} activeOpacity={0.7} style={styles.shareBtn}>
                    <Ionicons name="share-outline" size={17} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Title & Request Body */}
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

                {/* Intentional, Larger Mark as Answered Button on the Left Below Card Body */}
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

                {/* Actions Footer: Heart Like Button & Encouragements Comment Button */}
                <View style={styles.cardFooter}>
                  {/* Heart Shape Like Button */}
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

                  {/* Encouragements Comment Button */}
                  <TouchableOpacity
                    style={styles.commentBtn}
                    onPress={() => handleOpenComments(req)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="chatbubble-outline" size={15} color="#4B5563" style={{ marginRight: 5 }} />
                    <Text style={styles.commentBtnText}>
                      {req.commentsCount > 0 ? `${req.commentsCount} Encouragements` : 'Encourage'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE GESTURE SHEET: CREATE PRAYER REQUEST */}
      {/* ========================================================================= */}
      <InteractiveGestureSheet
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialSnap="mid"
        midHeightRatio={0.85}
        fullHeightRatio={0.98}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContent}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Ask for Prayer</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.inputLabel}>Title / Core Need</Text>
            <TextInput
              style={styles.inputTitle}
              placeholder="e.g. Healing for my mother's surgery"
              placeholderTextColor="#9CA3AF"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Prayer Petition</Text>
            <TextInput
              style={styles.inputText}
              placeholder="Describe what you are walking through so the body of Christ can intercede with you..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={newText}
              onChangeText={setNewText}
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
                  style={[styles.categoryChoicePill, newCategory === c.id && styles.categoryChoicePillActive]}
                  onPress={() => setNewCategory(c.id as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChoiceText, newCategory === c.id && styles.categoryChoiceTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Anonymous Toggle */}
            <TouchableOpacity
              style={styles.anonToggleRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isAnonymous ? "checkbox" : "square-outline"}
                size={20}
                color={isAnonymous ? "#8B1E1E" : "#9CA3AF"}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.anonToggleText}>Post Anonymously (as "A Fellow Pilgrim")</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitPostBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleCreateRequest}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitPostBtnText}>Post to Prayer Wall</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </InteractiveGestureSheet>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE GESTURE SHEET: MARK AS ANSWERED (PRAISE REPORT) */}
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
      {/* 3. INTERACTIVE GESTURE SHEET: ENCOURAGEMENTS & THREADED COMMENTS */}
      {/* Opens at 80% with backdrop dismiss, smoothly swipes to Full-Screen */}
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
              {activeRequestForComments && (
                <Text style={styles.commentsSubtitle} numberOfLines={1}>
                  For: {activeRequestForComments.title}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setShowCommentsSheet(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* Full Scrollable Comments Feed */}
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

                        {/* Comment Actions: Reply & Like */}
                        <View style={styles.commentActionRow}>
                          <TouchableOpacity
                            onPress={() => setReplyingTo(c)}
                            style={styles.commentReplyBtn}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.commentReplyBtnText}>Reply</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleToggleCommentLike(c)}
                            style={styles.commentLikeBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={c.hasLiked ? "heart" : "heart-outline"}
                              size={14}
                              color={c.hasLiked ? "#E11D48" : "#6B7280"}
                              style={{ marginRight: 3 }}
                            />
                            <Text style={[styles.commentLikeText, c.hasLiked && styles.commentLikeTextActive]}>
                              {c.likesCount || 0}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Replying Banner if active */}
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <Text style={styles.replyingBannerText} numberOfLines={1}>
                Replying to <Text style={{ fontWeight: 'bold' }}>@{replyingTo.authorName}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {/* Sticky Input Bar at Bottom */}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "Write an encouraging prayer..."}
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
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  headerLeft: {
    justifyContent: 'center',
  },
  redAccentLine: {
    width: 24,
    height: 3,
    backgroundColor: '#8B1E1E',
    borderRadius: 2,
    marginBottom: 5,
  },
  headerTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 24,
    color: '#111827',
    letterSpacing: -0.4,
  },
  askPrayerStrokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#111827',
    backgroundColor: 'transparent',
  },
  askPrayerStrokeBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // Mascot Scripture Hero Card
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

  // Segment Switcher: Community Prayers vs. My Prayers
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

  // Category Filter Chips
  filterRow: {
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 13,
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

  // Prayer Card Feed (Core UI Design: 1px border, 0 drop shadows)
  prayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
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
  timeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#9CA3AF',
  },
  shareBtn: {
    padding: 6,
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

  // Answered Praise Report
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

  // Mark as Answered Button: Prominent, Left-Aligned Below Card Body
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

  // Footer Actions: Heart Like & Encouragements
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
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

  // Gesture Sheet Modals Styles
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

  // Comments / Encouragements Full Interactive Sheet
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
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  commentLikeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#6B7280',
  },
  commentLikeTextActive: {
    color: '#E11D48',
    fontFamily: Typography.fontSansBold,
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
