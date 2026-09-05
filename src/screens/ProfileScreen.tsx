import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
  SafeAreaView,
  Image,
  RefreshControl,
  Clipboard,
  ToastAndroid,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';
import { UserProfile, SavedBookmark, ApostlePersona } from '../types';
import {
  fetchUserProfile,
  saveUserProfile,
  fetchBookmarks,
  fetchMemorizedVerses,
  fetchAllHighlights,
  fetchAllVerseNotes,
  MemorizedVerse,
  VerseHighlight,
  VerseNote
} from '../services/database';
import {
  getSpiritualGrowthProfile,
  SpiritualGrowthProfile,
  FaithBadge
} from '../services/gamificationService';
import {
  getAvatarEmblem,
  getDicebearUrl,
  rollRandomDicebearAvatar,
  saveUserAvatarUrl
} from '../services/avatarService';
import { MascotBadgeCard } from '../components/MascotBadgeCard';
import { BadgeDetailModal } from '../components/BadgeDetailModal';
import { BadgesModal } from '../components/BadgesModal';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { SettingsScreen } from './SettingsScreen';
import { SavedItemsModal } from '../components/SavedItemsModal';
import { CustomConfirmationModal } from '../components/CustomConfirmationModal';
import { useTranslation } from '../services/localizationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileScreenProps {
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
  onSelectApostle?: (apostle?: ApostlePersona, initialMessage?: string, contextQuote?: { text: string; reference: string }) => void;
  onOpenBible?: () => void;
  onOpenCommunityPrayers?: (segment?: 'community' | 'my_prayers') => void;
  onOpenCommunityPosts?: () => void;
  onOpenVerseInBible?: (book: string, chapter: number) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onOpenAuthModal,
  onSelectApostle,
  onOpenBible,
  onOpenCommunityPrayers,
  onOpenCommunityPosts,
  onOpenVerseInBible,
}) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>({
    id: 'guest_user',
    email: '',
    fullName: 'David Mensah',
    bio: '',
    location: '',
    dateOfBirth: '',
  });

  const [growthProfile, setGrowthProfile] = useState<SpiritualGrowthProfile | null>(null);
  const [activeActivityFilter, setActiveActivityFilter] = useState<'all' | 'saved' | 'memorized' | 'highlights' | 'notes' | 'badges'>('all');
  const [userBookmarks, setUserBookmarks] = useState<SavedBookmark[]>([]);
  const [memorizedVerses, setMemorizedVerses] = useState<MemorizedVerse[]>([]);
  const [userHighlights, setUserHighlights] = useState<VerseHighlight[]>([]);
  const [userNotes, setUserNotes] = useState<VerseNote[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [selectedBadgeForDetail, setSelectedBadgeForDetail] = useState<FaithBadge | null>(null);

  // Activity like toggles (local state for visual delight)
  const [likedActivities, setLikedActivities] = useState<Record<string, boolean>>({});

  // Helper to parse reference string into book & chapter
  const parseBookAndChapter = (ref: string): { book: string; chapter: number } => {
    const parts = ref.trim().split(' ');
    const book = parts.slice(0, -1).join(' ') || 'Genesis';
    const ch = parseInt(parts[parts.length - 1]?.split(':')[0] || '1', 10);
    return { book, chapter: isNaN(ch) ? 1 : ch };
  };

  const handleOpenVerse = (ref: string) => {
    const { book, chapter } = parseBookAndChapter(ref);
    if (onOpenVerseInBible) {
      onOpenVerseInBible(book, chapter);
    } else if (onOpenBible) {
      onOpenBible();
    }
  };

  // 1-Tap Copy Scripture and Automatically Discuss with Apostle
  const handleSelectScriptureToDiscuss = (ref: string, text: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    const copyString = `“${text}” — ${ref}`;
    Clipboard.setString(copyString);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Scripture copied! Opening Apostle chat...', ToastAndroid.SHORT);
    }
    if (onSelectApostle) {
      onSelectApostle(
        undefined,
        `What is the deeper spiritual meaning of this scripture: “${text}” (${ref})?`,
        { text, reference: ref }
      );
    }
  };

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    icon?: any;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  const loadData = async () => {
    try {
      const [uProf, gProf, bMarks, mems, hls, nts] = await Promise.all([
        fetchUserProfile(),
        getSpiritualGrowthProfile(),
        fetchBookmarks(),
        fetchMemorizedVerses(),
        fetchAllHighlights(),
        fetchAllVerseNotes(),
      ]);

      if (uProf) setProfile(uProf);
      if (gProf) setGrowthProfile(gProf);
      setUserBookmarks(bMarks || []);
      setMemorizedVerses(mems || []);
      setUserHighlights(hls || []);
      setUserNotes(nts || []);
    } catch (e) {
      console.warn('ProfileScreen loadData error:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleToggleLikeActivity = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setLikedActivities(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Roll a new Dicebear avatar immediately
  const handleRollDiceAvatar = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    const newAvatarUrl = rollRandomDicebearAvatar('notionists');
    setProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    await saveUserAvatarUrl(newAvatarUrl);
  };

  // Share profile with a working public URL
  const handleShareProfile = async () => {
    try {
      const shareUrl = `https://biblechatapp.com/u/${profile.id || 'me'}`;
      await Share.share({
        message: `Connect with me on Bible Chat App! Walking together daily in faith and Scripture: ${shareUrl}`,
        url: shareUrl,
        title: `${profile.fullName || 'Pilgrim'}'s Faith Profile`
      });
    } catch (e) {}
  };

  // Determine avatar display
  const isHttpAvatar = Boolean(profile.avatarUrl && (profile.avatarUrl.startsWith('http://') || profile.avatarUrl.startsWith('https://')));
  const isEmblemAvatar = Boolean(profile.avatarUrl && profile.avatarUrl.startsWith('emblem:'));
  const userEmblem = isEmblemAvatar ? getAvatarEmblem(profile.avatarUrl?.replace('emblem:', '')) : getAvatarEmblem();
  const defaultDicebear = getDicebearUrl(profile.fullName || 'Pilgrim', 'notionists');
  const userInitial = (profile.fullName || 'D').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header: Share Profile + Single Clean Settings Gear */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.shareProfileBtn}
          onPress={handleShareProfile}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={16} color="#111111" style={{ marginRight: 6 }} />
          <Text style={styles.shareProfileText}>Share Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setShowSettingsModal(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="settings-outline" size={22} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
            colors={['#111827']}
          />
        }
      >
        {/* User Identity Header Block */}
        <View style={styles.profileHeaderBlock}>
          <View style={styles.profileMetaLeft}>
            <Text style={styles.profileFullName}>{profile.fullName || 'David Mensah'}</Text>
            
            {/* Real App Stats: Streak & Encouragements */}
            <View style={styles.chipsRow}>
              <View style={styles.chipPill}>
                <Ionicons name="flash" size={12} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={styles.chipText}>
                  {growthProfile?.streakDays || 1} Day Streak
                </Text>
              </View>
              <View style={styles.chipPill}>
                <Ionicons name="paper-plane" size={11} color="#4B5563" style={{ marginRight: 4 }} />
                <Text style={styles.chipText}>
                  {growthProfile?.conversationsCount || 0} Encouragements
                </Text>
              </View>
            </View>
          </View>

          {/* Large Avatar with Dice Roll Badge */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              style={[styles.avatarCircle, !isHttpAvatar && isEmblemAvatar && { backgroundColor: userEmblem.bgColor }]}
              onPress={() => setShowAvatarModal(true)}
              activeOpacity={0.8}
            >
              {isHttpAvatar ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
              ) : isEmblemAvatar ? (
                <Text style={{ fontSize: 32 }}>{userEmblem.emoji}</Text>
              ) : (
                <Image source={{ uri: defaultDicebear }} style={styles.avatarImage} resizeMode="cover" />
              )}
            </TouchableOpacity>

            {/* Quick Dice Roll Badge Button */}
            <TouchableOpacity
              style={styles.diceBadgeBtn}
              onPress={handleRollDiceAvatar}
              activeOpacity={0.8}
            >
              <Ionicons name="dice-outline" size={14} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3 Soft Action Cards: Saved, Prayer, Posts */}
        <View style={styles.actionCardsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowSavedModal(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="bookmark-outline" size={22} color="#111111" style={{ marginBottom: 6 }} />
            <Text style={styles.actionCardLabel}>{t('saved_card', 'Saved')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onOpenCommunityPrayers ? onOpenCommunityPrayers('my_prayers') : onSelectApostle?.()}
            activeOpacity={0.75}
          >
            <Ionicons name="heart-outline" size={22} color="#111111" style={{ marginBottom: 6 }} />
            <Text style={styles.actionCardLabel}>{t('prayer_card', 'Prayer')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onOpenCommunityPosts ? onOpenCommunityPosts() : onOpenCommunityPrayers?.('community')}
            activeOpacity={0.75}
          >
            <Ionicons name="images-outline" size={22} color="#111111" style={{ marginBottom: 6 }} />
            <Text style={styles.actionCardLabel}>Posts</Text>
          </TouchableOpacity>
        </View>

        {/* Badges Showcase Card (Edge-to-Edge Unclipped Scrolling) */}
        <View style={styles.badgesSectionCard}>
          <TouchableOpacity
            style={styles.badgesCardHeader}
            onPress={() => setShowBadgesModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.badgesCardTitle}>{growthProfile?.badges?.length || 8} Badges</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Horizontal Preview of Badges (All badges visible, smoothly scrollable) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesPreviewRow}
          >
            {(growthProfile?.badges || []).map((badge: FaithBadge) => (
              <MascotBadgeCard
                key={badge.id}
                badge={badge}
                size="compact"
                onPress={() => setSelectedBadgeForDetail(badge)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* ACTIVITY FEED SECTION */}
        {/* ========================================================================= */}
        <View style={styles.activitySection}>
          <Text style={styles.activityHeading}>Activity</Text>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
            {[
              { id: 'all', label: 'All', icon: undefined },
              { id: 'saved', label: 'Saved', icon: 'bookmark-outline' },
              { id: 'memorized', label: 'Memorized', icon: 'heart-outline' },
              { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
              { id: 'highlights', label: 'Highlights', icon: 'color-palette-outline' },
              { id: 'badges', label: 'Badges', icon: 'ribbon-outline' },
            ].map((f) => {
              const isActive = activeActivityFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveActivityFilter(f.id as any)}
                  activeOpacity={0.75}
                >
                  {f.icon && (
                    <Ionicons
                      name={f.icon as any}
                      size={14}
                      color={isActive ? '#FFFFFF' : '#111111'}
                      style={{ marginRight: 5 }}
                    />
                  )}
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* DYNAMIC ACTIVITY FEED */}

          {/* 1. SAVED SCRIPTURES (BOOKMARKS) FILTER */}
          {activeActivityFilter === 'saved' && (
            userBookmarks.length === 0 ? (
              <View style={styles.emptyActivityBox}>
                <Ionicons name="bookmark-outline" size={32} color="#D97706" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>No Saved Scriptures Yet</Text>
                <Text style={styles.emptyActivitySub}>Tap any verse in the Bible reader and select "Bookmark" to save it here.</Text>
              </View>
            ) : (
              userBookmarks.map((bm) => {
                const ref = bm.reference || bm.title;
                return (
                  <View key={bm.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={[styles.activityAvatarSmall, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="bookmark" size={13} color="#D97706" />
                      </View>
                      <View style={styles.activityMeta}>
                        <Text style={styles.activityTitleText}>
                          Saved <Text style={{ fontFamily: Typography.fontSansBold }}>{ref}</Text>
                        </Text>
                        <Text style={styles.activityTimeText}>Spiritual treasury</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleSelectScriptureToDiscuss(ref, bm.content)}
                    >
                      <View style={styles.quoteBlock}>
                        <View style={[styles.quoteAccentLine, { backgroundColor: '#D97706' }]} />
                        <View style={styles.quoteContent}>
                          <Text style={[styles.quoteText, { fontFamily: Typography.fontYouVersionSerif }]}>“{bm.content}”</Text>
                          <Text style={styles.quoteRef}>{ref}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.activityFooterRow}>
                      <View style={styles.activityFooterLeft}>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleToggleLikeActivity(bm.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={likedActivities[bm.id] ? "heart" : "heart-outline"}
                            size={18}
                            color={likedActivities[bm.id] ? "#E11D48" : "#6B7280"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleOpenVerse(ref)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="book-outline" size={17} color="#6B7280" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.discussApostlePillBtn}
                        onPress={() => handleSelectScriptureToDiscuss(ref, bm.content)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text style={styles.discussApostlePillText}>Ask Apostle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )
          )}

          {/* 2. MEMORIZED VERSES FILTER */}
          {activeActivityFilter === 'memorized' && (
            memorizedVerses.length === 0 ? (
              <View style={styles.emptyActivityBox}>
                <Ionicons name="heart-outline" size={32} color="#D97706" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>No Memorized Scriptures Yet</Text>
                <Text style={styles.emptyActivitySub}>Tap any verse in the Bible reader and select "Memorize" to hide God's Word in your heart.</Text>
              </View>
            ) : (
              memorizedVerses.map((mem) => (
                <View key={mem.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={[styles.activityAvatarSmall, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="heart" size={14} color="#D97706" />
                    </View>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTitleText}>
                        Memorized <Text style={{ fontFamily: Typography.fontSansBold }}>{mem.reference}</Text>
                      </Text>
                      <Text style={styles.activityTimeText}>Practiced {mem.practiceCount} {mem.practiceCount === 1 ? 'time' : 'times'}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleSelectScriptureToDiscuss(mem.reference, mem.verseText)}
                  >
                    <View style={styles.quoteBlock}>
                      <View style={[styles.quoteAccentLine, { backgroundColor: '#D97706' }]} />
                      <View style={styles.quoteContent}>
                        <Text style={[styles.quoteText, { fontFamily: Typography.fontYouVersionSerif }]}>“{mem.verseText}”</Text>
                        <Text style={styles.quoteRef}>{mem.reference} · {mem.version}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.activityFooterRow}>
                    <View style={styles.activityFooterLeft}>
                      <TouchableOpacity
                        style={styles.activityFooterBtn}
                        onPress={() => handleToggleLikeActivity(mem.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={likedActivities[mem.id] ? "heart" : "heart-outline"}
                          size={18}
                          color={likedActivities[mem.id] ? "#E11D48" : "#6B7280"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.activityFooterBtn}
                        onPress={() => handleOpenVerse(mem.reference)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="book-outline" size={17} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.discussApostlePillBtn}
                      onPress={() => handleSelectScriptureToDiscuss(mem.reference, mem.verseText)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                      <Text style={styles.discussApostlePillText}>Ask Apostle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )
          )}

          {/* 3. NOTES FILTER */}
          {activeActivityFilter === 'notes' && (
            userNotes.length === 0 ? (
              <View style={styles.emptyActivityBox}>
                <Ionicons name="document-text-outline" size={32} color="#6B7280" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>No Personal Notes Yet</Text>
                <Text style={styles.emptyActivitySub}>Tap any verse in the Bible reader and select "Add Note" to write reflections.</Text>
              </View>
            ) : (
              userNotes.map((note) => (
                <View key={note.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={[styles.activityAvatarSmall, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="document-text" size={13} color="#8B1E1E" />
                    </View>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTitleText}>
                        Note on <Text style={{ fontFamily: Typography.fontSansBold }}>{note.reference}</Text>
                      </Text>
                      <Text style={styles.activityTimeText}>Personal reflection</Text>
                    </View>
                  </View>

                  <View style={styles.quoteBlock}>
                    <View style={[styles.quoteAccentLine, { backgroundColor: '#8B1E1E' }]} />
                    <View style={styles.quoteContent}>
                      <Text style={[styles.quoteText, { fontFamily: Typography.fontYouVersionSerif }]}>“{note.verseText}”</Text>
                      <Text style={styles.noteContentText}>{note.noteText}</Text>
                      <Text style={styles.quoteRef}>{note.reference}</Text>
                    </View>
                  </View>

                  <View style={styles.activityFooterRow}>
                    <View style={styles.activityFooterLeft}>
                      <TouchableOpacity
                        style={styles.activityFooterBtn}
                        onPress={() => handleToggleLikeActivity(note.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={likedActivities[note.id] ? "heart" : "heart-outline"}
                          size={18}
                          color={likedActivities[note.id] ? "#E11D48" : "#6B7280"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.activityFooterBtn}
                        onPress={() => handleOpenVerse(note.reference)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="book-outline" size={17} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.discussApostlePillBtn}
                      onPress={() => handleSelectScriptureToDiscuss(note.reference, `${note.verseText} (My Reflection: ${note.noteText})`)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                      <Text style={styles.discussApostlePillText}>Ask Apostle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )
          )}

          {/* 4. HIGHLIGHTS FILTER */}
          {activeActivityFilter === 'highlights' && (
            userHighlights.length === 0 ? (
              <View style={styles.emptyActivityBox}>
                <Ionicons name="color-palette-outline" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>No Highlights Yet</Text>
                <Text style={styles.emptyActivitySub}>Tap any verse in the Bible reader and select a color to highlight.</Text>
              </View>
            ) : (
              userHighlights.map((hl) => {
                const ref = `${hl.book} ${hl.chapter}:${hl.verse}`;
                return (
                  <View key={hl.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={[styles.activityAvatarSmall, { backgroundColor: hl.color || '#FEF08A' }]}>
                        <Ionicons name="color-wand" size={13} color="#111111" />
                      </View>
                      <View style={styles.activityMeta}>
                        <Text style={styles.activityTitleText}>
                          Highlighted <Text style={{ fontFamily: Typography.fontSansBold }}>{ref}</Text>
                        </Text>
                        <Text style={styles.activityTimeText}>Scripture highlight</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleSelectScriptureToDiscuss(ref, hl.verseText)}
                    >
                      <View style={styles.quoteBlock}>
                        <View style={[styles.quoteAccentLine, { backgroundColor: hl.color || '#FEF08A' }]} />
                        <View style={styles.quoteContent}>
                          <Text style={[styles.quoteText, { fontFamily: Typography.fontYouVersionSerif }]}>“{hl.verseText}”</Text>
                          <Text style={styles.quoteRef}>{ref}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.activityFooterRow}>
                      <View style={styles.activityFooterLeft}>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleToggleLikeActivity(hl.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={likedActivities[hl.id] ? "heart" : "heart-outline"}
                            size={18}
                            color={likedActivities[hl.id] ? "#E11D48" : "#6B7280"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleOpenVerse(ref)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="book-outline" size={17} color="#6B7280" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.discussApostlePillBtn}
                        onPress={() => handleSelectScriptureToDiscuss(ref, hl.verseText)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text style={styles.discussApostlePillText}>Ask Apostle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )
          )}

          {/* 5. INLINE BADGES VIEW */}
          {activeActivityFilter === 'badges' && (
            <View style={styles.inlineBadgesWrap}>
              {(growthProfile?.badges || []).map((badge: FaithBadge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={styles.inlineBadgeRow}
                  onPress={() => setSelectedBadgeForDetail(badge)}
                  activeOpacity={0.8}
                >
                  <MascotBadgeCard
                    badge={badge}
                    size="compact"
                    onPress={() => setSelectedBadgeForDetail(badge)}
                  />
                  <View style={styles.inlineBadgeMeta}>
                    <Text style={styles.inlineBadgeTitle}>{badge.title}</Text>
                    <Text style={styles.inlineBadgeSubtitle} numberOfLines={2}>{badge.subtitle}</Text>
                    <Text style={styles.inlineBadgeLevel}>Level {badge.level || 1} Achieved</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 6. ALL ACTIVITIES FEED (Dynamically renders real user items) */}
          {activeActivityFilter === 'all' && (
            userBookmarks.length === 0 && memorizedVerses.length === 0 && userNotes.length === 0 ? (
              <View style={styles.emptyActivityBox}>
                <Ionicons name="sparkles-outline" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyActivityTitle}>Your Faith Activity Awaits</Text>
                <Text style={styles.emptyActivitySub}>Saved scriptures, memorized passages, and notes will appear here.</Text>
              </View>
            ) : (
              <View>
                {/* 1. All Real User Bookmarks */}
                {userBookmarks.map((bm) => {
                  const ref = bm.reference || bm.title;
                  return (
                    <View key={`all_bm_${bm.id}`} style={styles.activityCard}>
                      <View style={styles.activityHeader}>
                        <View style={[styles.activityAvatarSmall, { backgroundColor: '#FEF3C7' }]}>
                          <Ionicons name="bookmark" size={13} color="#D97706" />
                        </View>
                        <View style={styles.activityMeta}>
                          <Text style={styles.activityTitleText}>
                            You saved <Text style={{ fontFamily: Typography.fontSansBold }}>{ref}</Text>
                          </Text>
                          <Text style={styles.activityTimeText}>Saved scripture</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleSelectScriptureToDiscuss(ref, bm.content)}
                      >
                        <View style={styles.quoteBlock}>
                          <View style={[styles.quoteAccentLine, { backgroundColor: '#D97706' }]} />
                          <View style={styles.quoteContent}>
                            <Text style={[styles.quoteText, { fontFamily: Typography.fontYouVersionSerif }]}>“{bm.content}”</Text>
                            <Text style={styles.quoteRef}>{ref}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.activityFooterRow}>
                        <View style={styles.activityFooterLeft}>
                          <TouchableOpacity
                            style={styles.activityFooterBtn}
                            onPress={() => handleToggleLikeActivity(`bm_${bm.id}`)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={likedActivities[`bm_${bm.id}`] ? "heart" : "heart-outline"}
                              size={18}
                              color={likedActivities[`bm_${bm.id}`] ? "#E11D48" : "#6B7280"}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.activityFooterBtn}
                            onPress={() => handleOpenVerse(ref)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="book-outline" size={17} color="#6B7280" />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.discussApostlePillBtn}
                          onPress={() => handleSelectScriptureToDiscuss(ref, bm.content)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="chatbubble-ellipses-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                          <Text style={styles.discussApostlePillText}>Ask Apostle</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                {/* 2. All Real Memorized Verses */}
                {memorizedVerses.map((mem) => (
                  <View key={`all_mem_${mem.id}`} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={[styles.activityAvatarSmall, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="heart" size={14} color="#D97706" />
                      </View>
                      <View style={styles.activityMeta}>
                        <Text style={styles.activityTitleText}>
                          You memorized <Text style={{ fontFamily: Typography.fontSansBold }}>{mem.reference}</Text>
                        </Text>
                        <Text style={styles.activityTimeText}>Practiced {mem.practiceCount} {mem.practiceCount === 1 ? 'time' : 'times'}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleSelectScriptureToDiscuss(mem.reference, mem.verseText)}
                    >
                      <View style={styles.quoteBlock}>
                        <View style={[styles.quoteAccentLine, { backgroundColor: '#D97706' }]} />
                        <View style={styles.quoteContent}>
                          <Text style={[styles.quoteText, { fontFamily: Typography.fontYouVersionSerif }]}>“{mem.verseText}”</Text>
                          <Text style={styles.quoteRef}>{mem.reference} · {mem.version}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.activityFooterRow}>
                      <View style={styles.activityFooterLeft}>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleToggleLikeActivity(`mem_${mem.id}`)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={likedActivities[`mem_${mem.id}`] ? "heart" : "heart-outline"}
                            size={18}
                            color={likedActivities[`mem_${mem.id}`] ? "#E11D48" : "#6B7280"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleOpenVerse(mem.reference)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="book-outline" size={17} color="#6B7280" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.discussApostlePillBtn}
                        onPress={() => handleSelectScriptureToDiscuss(mem.reference, mem.verseText)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text style={styles.discussApostlePillText}>Ask Apostle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* 3. All Real User Notes */}
                {userNotes.map((note) => (
                  <View key={`all_note_${note.id}`} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={[styles.activityAvatarSmall, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="document-text" size={13} color="#8B1E1E" />
                      </View>
                      <View style={styles.activityMeta}>
                        <Text style={styles.activityTitleText}>
                          Note on <Text style={{ fontFamily: Typography.fontSansBold }}>{note.reference}</Text>
                        </Text>
                        <Text style={styles.activityTimeText}>Personal reflection</Text>
                      </View>
                    </View>

                    <View style={styles.quoteBlock}>
                      <View style={[styles.quoteAccentLine, { backgroundColor: '#8B1E1E' }]} />
                      <View style={styles.quoteContent}>
                        <Text style={[styles.quoteText, { fontFamily: Typography.fontYouVersionSerif }]}>“{note.verseText}”</Text>
                        <Text style={styles.noteContentText}>{note.noteText}</Text>
                        <Text style={styles.quoteRef}>{note.reference}</Text>
                      </View>
                    </View>

                    <View style={styles.activityFooterRow}>
                      <View style={styles.activityFooterLeft}>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleToggleLikeActivity(`note_${note.id}`)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={likedActivities[`note_${note.id}`] ? "heart" : "heart-outline"}
                            size={18}
                            color={likedActivities[`note_${note.id}`] ? "#E11D48" : "#6B7280"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.activityFooterBtn}
                          onPress={() => handleOpenVerse(note.reference)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="book-outline" size={17} color="#6B7280" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.discussApostlePillBtn}
                        onPress={() => handleSelectScriptureToDiscuss(note.reference, `${note.verseText} (My Reflection: ${note.noteText})`)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text style={styles.discussApostlePillText}>Ask Apostle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* 1. Settings Gesture Sheet */}
      <SettingsScreen
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userProfile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        onLogout={onLogout}
      />

      {/* 2. Avatar & Dicebear Picker Modal */}
      <AvatarPickerModal
        visible={showAvatarModal}
        selectedEmblemId={isEmblemAvatar ? profile.avatarUrl?.replace('emblem:', '') || 'shield' : 'shield'}
        currentAvatarUrl={profile.avatarUrl}
        userId={profile.id}
        onClose={() => setShowAvatarModal(false)}
        onSelectEmblem={(emblem) => {
          setProfile(prev => ({ ...prev, avatarUrl: `emblem:${emblem.id}` }));
        }}
        onSelectAvatarUrl={(url) => {
          setProfile(prev => ({ ...prev, avatarUrl: url }));
        }}
      />

      {/* 3. Badge Detail Modal (Interactive Gesture Sheet) */}
      <BadgeDetailModal
        visible={Boolean(selectedBadgeForDetail)}
        badge={selectedBadgeForDetail}
        onClose={() => setSelectedBadgeForDetail(null)}
      />

      {/* 4. Full Badges Showcase Modal */}
      <BadgesModal
        visible={showBadgesModal}
        badges={growthProfile?.badges || []}
        onClose={() => setShowBadgesModal(false)}
        onSelectBadge={(b) => setSelectedBadgeForDetail(b)}
      />

      {/* 5. Saved Items Modal */}
      <SavedItemsModal
        visible={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onOpenVerseInBible={(book, chapter) => {
          setShowSavedModal(false);
          if (onOpenVerseInBible) {
            onOpenVerseInBible(book, chapter);
          } else if (onOpenBible) {
            onOpenBible();
          }
        }}
      />

      {/* 6. Custom Confirmation Dialog */}
      <CustomConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        icon={confirmModal.icon}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
        onClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  shareProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  shareProfileText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111111',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  profileHeaderBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileMetaLeft: {
    flex: 1,
    marginRight: 14,
  },
  profileFullName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 24,
    color: '#111111',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#374151',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2.5,
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  diceBadgeBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  actionCardLabel: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#111111',
  },
  badgesSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 20,
  },
  badgesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  badgesCardTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: '#111111',
  },
  badgesPreviewRow: {
    paddingHorizontal: 18,
    gap: 12,
  },
  activitySection: {
    marginTop: 4,
  },
  activityHeading: {
    fontFamily: Typography.fontSansBold,
    fontSize: 18,
    color: '#111111',
    marginBottom: 12,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterChipActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  filterChipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#111111',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: Typography.fontSansSemiBold,
  },
  inlineBadgesWrap: {
    gap: 10,
  },
  inlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inlineBadgeMeta: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  inlineBadgeTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#111827',
  },
  inlineBadgeSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  inlineBadgeLevel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#D97706',
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activityAvatarText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  activityMeta: {
    flex: 1,
  },
  activityTitleText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#111111',
  },
  activityTimeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 1,
  },
  activityAgeText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#9CA3AF',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tagText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
  },
  quoteBlock: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  quoteAccentLine: {
    width: 2.5,
    backgroundColor: '#111111',
    borderRadius: 2,
    marginRight: 12,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 16.5,
    lineHeight: 25.5,
    color: '#1F2937',
    marginBottom: 6,
  },
  quoteRef: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#4B5563',
  },
  noteContentText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    marginBottom: 4,
  },
  activityFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  activityFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityFooterBtn: {
    padding: 4,
  },
  discussApostlePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discussApostlePillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  badgeActivityPreviewBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyActivityBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 4,
  },
  emptyActivityTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 4,
  },
  emptyActivitySub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  }
});
