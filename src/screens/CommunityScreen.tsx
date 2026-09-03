import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Share,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
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
  addPrayerComment
} from '../services/prayerWallService';
import { getAvatarEmblem } from '../services/avatarService';

export const CommunityScreen: React.FC = () => {
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

  // Comments Sheet State
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [activeRequestForComments, setActiveRequestForComments] = useState<PrayerRequest | null>(null);
  const [comments, setComments] = useState<PrayerComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

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
    // Optimistic UI update
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
      setSelectedRequestForAnswer(null);
      setPraiseReportText('');
    } else {
      alert(res.error || 'Failed to update prayer');
    }
  };

  const handleOpenComments = async (req: PrayerRequest) => {
    setActiveRequestForComments(req);
    setShowCommentsSheet(true);
    setIsLoadingComments(true);
    const list = await fetchPrayerComments(req.id);
    setComments(list);
    setIsLoadingComments(false);
  };

  const handleSendComment = async () => {
    if (!activeRequestForComments || !newCommentText.trim()) return;
    setIsSendingComment(true);
    const res = await addPrayerComment(activeRequestForComments.id, newCommentText);
    setIsSendingComment(false);

    if (res.success && res.comment) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      setComments(prev => [...prev, res.comment!]);
      setNewCommentText('');
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

  const handleSharePrayer = async (req: PrayerRequest) => {
    try {
      await Share.share({
        message: `Join me in praying for: "${req.title}" - ${req.requestText}\n\nPray with us on Bible Chat App!`
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSubtitle}>Bear one another's burdens · Galatians 6:2</Text>
        </View>

        <TouchableOpacity
          style={styles.askPrayerBtn}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.82}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.askPrayerBtnText}>Ask Prayer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner: Community Prayer Counter */}
        <View style={styles.statsBanner}>
          <View style={styles.statsIconBox}>
            <Text style={{ fontSize: 20 }}>🕯️</Text>
          </View>
          <View style={styles.statsMeta}>
            <Text style={styles.statsTitle}>Fellowship in Prayer</Text>
            <Text style={styles.statsSub}>
              {requests.reduce((acc, cur) => acc + cur.prayedCount, 48)} prayers lifted up across the body of Christ today
            </Text>
          </View>
        </View>

        {/* Filter Chips */}
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

        {/* Prayer List Feed */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#8B1E1E" />
            <Text style={styles.loadingText}>Loading Community Prayers...</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🕊️</Text>
            <Text style={styles.emptyTitle}>No prayers in this category yet</Text>
            <Text style={styles.emptySub}>Be the first to share a petition or praise report with the brothers and sisters.</Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyActionText}>Post First Prayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          requests.map((req) => {
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
                      <Text style={styles.timeText}>Just now</Text>
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
                      <Text style={{ fontSize: 16, marginRight: 6 }}>🙌</Text>
                      <Text style={styles.praiseTitle}>Praise Report · God Answered!</Text>
                    </View>
                    <Text style={styles.praiseText}>“{req.praiseReport}”</Text>
                  </View>
                )}

                {/* Actions Footer */}
                <View style={styles.cardFooter}>
                  {/* I Prayed for You Button */}
                  <TouchableOpacity
                    style={[styles.prayedBtn, req.hasUserPrayed && styles.prayedBtnActive]}
                    onPress={() => handleTogglePrayed(req)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={req.hasUserPrayed ? "checkmark-circle" : "heart-outline"}
                      size={16}
                      color={req.hasUserPrayed ? "#B45309" : "#374151"}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.prayedBtnText, req.hasUserPrayed && styles.prayedBtnTextActive]}>
                      {req.hasUserPrayed ? "Prayed" : "I Prayed"} ({req.prayedCount})
                    </Text>
                  </TouchableOpacity>

                  {/* Encouragements Button */}
                  <TouchableOpacity
                    style={styles.commentBtn}
                    onPress={() => handleOpenComments(req)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="chatbubble-outline" size={15} color="#374151" style={{ marginRight: 5 }} />
                    <Text style={styles.commentBtnText}>
                      {req.commentsCount > 0 ? `${req.commentsCount} Encouragements` : 'Encourage'}
                    </Text>
                  </TouchableOpacity>

                  {/* Author Option: Mark as Answered */}
                  {req.isUserAuthor && !req.isAnswered && (
                    <TouchableOpacity
                      style={styles.answeredBtn}
                      onPress={() => {
                        setSelectedRequestForAnswer(req);
                        setShowAnsweredModal(true);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.answeredBtnText}>Mark Answered 🙌</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. CREATE PRAYER REQUEST MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View style={styles.modalGrabBar} />
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>Ask for Prayer</Text>
                    <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.modalCloseBtn}>
                      <Ionicons name="close" size={20} color="#111111" />
                    </TouchableOpacity>
                  </View>

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
                    placeholder="Describe what you are going through so the body of Christ can intercede with you..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    value={newText}
                    onChangeText={setNewText}
                  />

                  {/* Category Pills */}
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
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MARK AS ANSWERED (PRAISE REPORT) MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showAnsweredModal} transparent animationType="slide" onRequestClose={() => setShowAnsweredModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowAnsweredModal(false)}>
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View style={styles.modalGrabBar} />
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>Share Your Praise Report! 🙌</Text>
                    <TouchableOpacity onPress={() => setShowAnsweredModal(false)} style={styles.modalCloseBtn}>
                      <Ionicons name="close" size={20} color="#111111" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.answeredSub}>
                    Give glory to God and encourage everyone who interceded with you.
                  </Text>

                  <TextInput
                    style={styles.inputText}
                    placeholder="Describe how God answered this prayer..."
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
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. ENCOURAGEMENT COMMENTS BOTTOM SHEET */}
      {/* ========================================================================= */}
      <Modal visible={showCommentsSheet} transparent animationType="slide" onRequestClose={() => setShowCommentsSheet(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCommentsSheet(false)}>
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContainer, { maxHeight: '80%' }]}>
                  <View style={styles.modalGrabBar} />
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>Encouragements</Text>
                    <TouchableOpacity onPress={() => setShowCommentsSheet(false)} style={styles.modalCloseBtn}>
                      <Ionicons name="close" size={20} color="#111111" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 260, marginBottom: 12 }}>
                    {isLoadingComments ? (
                      <ActivityIndicator size="small" color="#8B1E1E" style={{ marginTop: 20 }} />
                    ) : comments.length === 0 ? (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Text style={{ fontSize: 24, marginBottom: 6 }}>🕊️</Text>
                        <Text style={styles.noCommentsText}>No written encouragements yet.</Text>
                        <Text style={styles.noCommentsSub}>Leave a scripture or short prayer to uplift this soul.</Text>
                      </View>
                    ) : (
                      comments.map((c) => {
                        const emblem = getAvatarEmblem(c.authorAvatar);
                        return (
                          <View key={c.id} style={styles.commentItemRow}>
                            <View style={[styles.commentAvatarCircle, { backgroundColor: emblem.bgColor }]}>
                              <Text style={{ fontSize: 14 }}>{emblem.emoji}</Text>
                            </View>
                            <View style={styles.commentBubble}>
                              <Text style={styles.commentAuthorName}>{c.authorName}</Text>
                              <Text style={styles.commentContent}>{c.commentText}</Text>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>

                  {/* Input row */}
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Write an encouraging prayer..."
                      placeholderTextColor="#9CA3AF"
                      value={newCommentText}
                      onChangeText={setNewCommentText}
                    />
                    <TouchableOpacity
                      style={[styles.sendCommentBtn, isSendingComment && { opacity: 0.6 }]}
                      onPress={handleSendComment}
                      disabled={isSendingComment}
                      activeOpacity={0.8}
                    >
                      {isSendingComment ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="send" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  headerTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 24,
    color: '#111827',
  },
  headerSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  askPrayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  askPrayerBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statsIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statsMeta: {
    flex: 1,
  },
  statsTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#92400E',
  },
  statsSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 2,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterChipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
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
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyActionBtn: {
    marginTop: 18,
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  emptyActionText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  prayerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111827',
  },
  timeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  categoryBadgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 9,
    color: '#4B5563',
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
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
    marginBottom: 6,
  },
  requestBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  praiseReportBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  praiseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  praiseTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#92400E',
  },
  praiseText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 10,
  },
  prayedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
  },
  prayedBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  prayedBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#374151',
  },
  prayedBtnTextActive: {
    color: '#92400E',
    fontFamily: Typography.fontSansSemiBold,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
  },
  commentBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#374151',
  },
  answeredBtn: {
    marginLeft: 'auto',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingHorizontal: 9,
    paddingVertical: 5.5,
  },
  answeredBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#991B1B',
  },
  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  modalGrabBar: {
    width: 38,
    height: 4.5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111827',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 6,
  },
  inputTitle: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Typography.fontSansRegular,
    color: '#111827',
    marginBottom: 14,
  },
  inputText: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    fontFamily: Typography.fontSansRegular,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  categoryPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChoicePill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryChoicePillActive: {
    backgroundColor: '#111827',
  },
  categoryChoiceText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#374151',
  },
  categoryChoiceTextActive: {
    color: '#FFFFFF',
  },
  anonToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  anonToggleText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#374151',
  },
  submitPostBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPostBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  answeredSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  // Comments
  noCommentsText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
  },
  noCommentsSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  commentItemRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentAuthorName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#111827',
    marginBottom: 2,
  },
  commentContent: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    fontFamily: Typography.fontSansRegular,
    color: '#111827',
  },
  sendCommentBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
