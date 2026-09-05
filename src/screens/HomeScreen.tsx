import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeOutUp, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { APOSTLE_PERSONAS } from '../services/personas';
import { getTodayScripture } from '../services/dailyScriptures';
import { getTodayApostleQuotation } from '../services/apostleQuotations';
import { ApostlePersona, BibleVerse } from '../types';
import { ApostleCard } from '../components/ApostleCard';
import { DailyScriptureCard } from '../components/DailyScriptureCard';
import { ScriptureDetailModal } from '../components/ScriptureDetailModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { DailyDeedCard } from '../components/DailyDeedCard';
import { DeedCompletionModal } from '../components/DeedCompletionModal';
import { getTodayDeedForUser, initDeedsDatabase, KingdomDeed } from '../services/deedsService';
import { getSpiritualGrowthProfile, SpiritualGrowthProfile, FaithBadge } from '../services/gamificationService';
import { MascotAssets } from '../services/mascotAssets';
import { BadgesModal } from '../components/BadgesModal';
import { BadgeDetailModal } from '../components/BadgeDetailModal';
import { CardStyles } from '../theme/cardStyles';
import { SpringConfigs } from '../theme/animations';
import { useTranslation } from '../services/localizationService';
import { HomeSkeleton } from '../components/SoftSkeleton';
import { DailyLiturgyCard } from '../components/DailyLiturgyCard';
import { DailyLiturgyModal } from '../components/DailyLiturgyModal';
import { getTodayLiturgy, isLiturgyCompletedForToday, DailyLiturgy } from '../services/liturgyService';
import { getLastReadPosition, LastReadProgress } from '../services/readingProgressService';
import { ChurchRoleModal } from '../components/ChurchRoleModal';
import { fetchUserProfile, incrementAndGetSessionCount } from '../services/database';
import { ChurchRole } from '../types';

interface HomeScreenProps {
  onSelectApostle: (
    apostle: ApostlePersona,
    initialMessage?: string,
    contextQuote?: { text: string; reference: string },
    ministryObjective?: 'sermon_prep' | 'small_group' | 'personal_reflection' | 'seeker_explore'
  ) => void;
  onOpenBible?: (book?: string, chapter?: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectApostle, onOpenBible }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'forYou' | 'disciples'>('forYou');
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [badgesModalOpen, setBadgesModalOpen] = useState(false);
  const [selectedBadgeForDetail, setSelectedBadgeForDetail] = useState<FaithBadge | null>(null);
  const [shareBannerDismissed, setShareBannerDismissed] = useState(false);
  const [sundayCardDismissed, setSundayCardDismissed] = useState(false);
  const [showChurchRoleModal, setShowChurchRoleModal] = useState(false);
  const [userChurchRole, setUserChurchRole] = useState<ChurchRole | undefined>(undefined);
  const [growthProfile, setGrowthProfile] = useState<SpiritualGrowthProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Daily Liturgy Guided Prayer State
  const [todayLiturgy, setTodayLiturgy] = useState<DailyLiturgy>(getTodayLiturgy());
  const [isLiturgyDone, setIsLiturgyDone] = useState(false);
  const [lastRead, setLastRead] = useState<LastReadProgress | null>(null);
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  // Daily Kingdom Deed Challenge State
  const [todayDeed, setTodayDeed] = useState<KingdomDeed>(getTodayDeedForUser());
  const [deedCompleted, setDeedCompleted] = useState(false);
  const [deedModalVisible, setDeedModalVisible] = useState(false);
  const [deedModalMode, setDeedModalMode] = useState<'complete' | 'scripture'>('complete');

  const todayScripture = getTodayScripture();
  const todayApostleQuote = getTodayApostleQuotation();

  const tabIndicatorOffset = useSharedValue(0);
  const tabIndicatorWidth = useSharedValue(68);

  useEffect(() => {
    Promise.all([
      initDeedsDatabase().catch(console.error),
      getSpiritualGrowthProfile().then(setGrowthProfile).catch(console.warn),
      isLiturgyCompletedForToday().then(setIsLiturgyDone).catch(console.warn),
      getLastReadPosition().then(setLastRead).catch(console.warn),
      fetchUserProfile().then(p => {
        const first = p?.fullName?.trim().split(' ')[0] || '';
        if (first) {
          setCurrentUserName(first);
          setTodayLiturgy(getTodayLiturgy(first));
        }
      }).catch(console.warn)
    ]).finally(() => {
      setTodayDeed(getTodayDeedForUser());
      setTimeout(() => setIsInitializing(false), 200);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'forYou') {
      tabIndicatorOffset.value = withSpring(0, SpringConfigs.bouncy);
      tabIndicatorWidth.value = withSpring(68, SpringConfigs.bouncy);
    } else {
      tabIndicatorOffset.value = withSpring(92, SpringConfigs.bouncy);
      tabIndicatorWidth.value = withSpring(132, SpringConfigs.bouncy);
    }
  }, [activeTab]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorOffset.value }],
    width: tabIndicatorWidth.value,
  }));

  const handleOpenVerseModal = () => {
    setSelectedVerse({
      book: todayScripture.book,
      chapter: todayScripture.chapter,
      verse: todayScripture.verse,
      text: todayScripture.quote,
      translation: 'NIV'
    });
  };

  const handleOpenApostleFromQuote = () => {
    const apostle = APOSTLE_PERSONAS.find(a => a.id === todayApostleQuote.apostleId) || APOSTLE_PERSONAS[0];
    onSelectApostle(
      apostle,
      undefined,
      { text: todayApostleQuote.quote, reference: todayApostleQuote.scriptureReference }
    );
  };

  const handleDismissSundayCard = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSundayCardDismissed(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Tabs & Notification Icon on Top-Right */}
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <Animated.View style={[styles.topRedIndicator, animatedIndicatorStyle]} />

          {/* For You Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('forYou')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'forYou' ? styles.tabTextActive : styles.tabTextInactive]}>
              {t('tab_for_you', 'For You')}
            </Text>
          </TouchableOpacity>

          {/* Companionship Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('disciples')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'disciples' ? styles.tabTextActive : styles.tabTextInactive]}>
              {t('tab_companions', 'AI Companions')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Header Action: Notification Bell */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => setNotificationsOpen(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="notifications-outline" size={21} color="#111111" />
            <View style={styles.notificationBadgeDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Content */}
      {isInitializing ? (
        <HomeSkeleton />
      ) : activeTab === 'forYou' ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Dynamic Daily Scripture Featured Card with High-Res Spiritual Imagery */}
          <DailyScriptureCard
            quote={todayScripture.quote}
            reference={todayScripture.reference}
            theme={todayScripture.theme}
            imageUrl={todayScripture.imageUrl}
            onReadMore={handleOpenVerseModal}
          />

          {/* ========================================================================= */}
          {/* 2. YOUR AI COMPANIONS (Horizontal Shelf: 3 Companions + Explore More) */}
          {/* ========================================================================= */}
          <View style={styles.companionsSectionWrap}>
            <View style={styles.companionsHeadingRow}>
              <Text style={styles.companionsHeading}>{t('your_companions', 'Your AI Companions')}</Text>
              <TouchableOpacity onPress={() => setActiveTab('disciples')} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>{t('see_all', 'See all')} ({APOSTLE_PERSONAS.length})</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.companionsScrollContent}
            >
              {APOSTLE_PERSONAS.slice(0, 3).map((apostle) => (
                <TouchableOpacity
                  key={apostle.id}
                  style={styles.companionMiniCard}
                  onPress={() => onSelectApostle(apostle)}
                  activeOpacity={0.82}
                >
                  <View style={styles.companionAvatarContainer}>
                    <Image source={apostle.avatar} style={styles.companionMiniAvatar} />
                    <View style={styles.companionOnlineBadge} />
                  </View>
                  <Text style={styles.companionMiniName} numberOfLines={1}>{apostle.name}</Text>
                  <Text style={styles.companionMiniRole} numberOfLines={1}>{apostle.subtitle}</Text>
                  <View style={styles.companionChatPill}>
                    <Ionicons name="chatbubble-ellipses-outline" size={12} color="#111111" style={{ marginRight: 3 }} />
                    <Text style={styles.companionChatPillText}>{t('converse', 'Converse')}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* 4th Card: Explore More → Switches to AI Companions Tab */}
              <TouchableOpacity
                style={styles.exploreMoreCard}
                onPress={() => setActiveTab('disciples')}
                activeOpacity={0.82}
              >
                <View style={styles.exploreMoreIconCircle}>
                  <Ionicons name="arrow-forward" size={22} color="#111111" />
                </View>
                <Text style={styles.exploreMoreTitle}>{t('explore_more', 'Explore More')}</Text>
                <Text style={styles.exploreMoreSubtitle}>{t('explore_subtitle', 'Meet all 7 Apostles & Biblical mentors')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ========================================================================= */}
          {/* 3. DAILY GUIDED AUDIO LITURGY */}
          {/* ========================================================================= */}
          <Text style={styles.moreForYouHeading}>{t('more_for_you', 'More for you')}</Text>

          {/* 1. Daily Guided Audio Liturgy (Morning / Evening) */}
          <DailyLiturgyCard
            liturgy={todayLiturgy}
            isCompleted={isLiturgyDone}
            onPress={() => setShowLiturgyModal(true)}
          />

          {/* 2. Resume Reading Card (Dynamic Last-Read Scripture Position) */}
          <TouchableOpacity
            style={styles.resumeReadingCard}
            onPress={() => onOpenBible && onOpenBible(lastRead?.book, lastRead?.chapter)}
            activeOpacity={0.85}
          >
            <View style={styles.resumeContent}>
              <View style={styles.resumeTagRow}>
                <View style={styles.resumePill}>
                  <Ionicons name="bookmark" size={11} color="#DC2626" style={{ marginRight: 4 }} />
                  <Text style={styles.resumePillText}>{t('continue_reading', 'CONTINUE READING')}</Text>
                </View>
                <Text style={styles.resumeEstTime}>
                  {lastRead?.estimatedMinutesRemaining || 4} {t('min_remaining', 'MIN REMAINING')}
                </Text>
              </View>

              <Text style={styles.resumePassageTitle}>
                {lastRead ? `${lastRead.book} ${lastRead.chapter}` : 'Romans 8'}
              </Text>

              <Text style={styles.resumeSnippetText} numberOfLines={2}>
                "{lastRead?.snippet || 'There is now no condemnation for those who are in Christ Jesus...'}"
              </Text>
            </View>

            <View style={styles.resumeActionCircle}>
              <Ionicons name="arrow-forward" size={18} color="#111111" />
            </View>
          </TouchableOpacity>

          {/* 2. Share the Bible App Banner Card */}
          {!shareBannerDismissed && (
            <View style={styles.shareBannerCard}>
              <View style={styles.shareBannerImageWrap}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80' }}
                  style={styles.shareBannerImage}
                />
              </View>
              <View style={styles.shareBannerBody}>
                <Text style={styles.shareBannerTitle}>{t('share_app_title', 'Share the Bible App')}</Text>
                <Text style={styles.shareBannerSub}>
                  {t('share_app_sub', 'Invite your friends to connect with you here, in Biblical community.')}
                </Text>
                <View style={styles.shareBannerActions}>
                  <TouchableOpacity
                    style={styles.shareNowBtn}
                    onPress={() => alert('Sharing Bible Chat App with friends')}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.shareNowText}>{t('share_now', 'Share Now')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dismissBtn}
                    onPress={() => setShareBannerDismissed(true)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.dismissText}>{t('dismiss', 'Dismiss')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 3. Badges Spotlight Card (Compact Horizontal Editorial Style) */}
          <View style={styles.badgesSpotlightCard}>
            <View style={styles.badgesSpotlightHeaderRow}>
              <Text style={styles.badgesSpotlightHeading}>Badges</Text>
              <TouchableOpacity
                onPress={() => setBadgesModalOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllBadgesInline}>View all ({growthProfile?.badges?.length || 8})</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.badgesSpotlightContentRow}
              onPress={() => setBadgesModalOpen(true)}
              activeOpacity={0.8}
            >
              <View style={styles.badgeEmblemSeal}>
                <Image source={MascotAssets.bread} style={styles.badgeSealImg} resizeMode="contain" />
                <View style={styles.badgeCountBadge}>
                  <Text style={styles.badgeCountText}>{growthProfile?.badges?.find(b => b.id === 'sower')?.level || 0}</Text>
                </View>
              </View>
              <View style={styles.badgeInfoCol}>
                <Text style={styles.badgeSpotlightTitle}>Sower of the Word</Text>
                <Text style={styles.badgeSpotlightSub}>Keep reading God's Word to earn sacred milestones</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Daily Kingdom Deed Challenge Card (Continuous G2 Squircle Luxury UI) */}
          <DailyDeedCard
            deed={todayDeed}
            isCompleted={deedCompleted}
            onBeginDeed={() => {
              setDeedModalMode('complete');
              setDeedModalVisible(true);
            }}
            onViewScripture={() => {
              setDeedModalMode('scripture');
              setDeedModalVisible(true);
            }}
          />

          {/* Daily Word of Grace from the Apostles */}
          <View style={styles.apostleQuoteCard}>
            <View style={styles.apostleQuoteHeader}>
              <View style={styles.apostleAvatarWrap}>
                <Image source={todayApostleQuote.avatar} style={styles.apostleAvatar} />
              </View>
              <View style={styles.apostleQuoteMeta}>
                <Text style={styles.apostleQuoteName}>{todayApostleQuote.apostleName}</Text>
                <Text style={styles.apostleQuoteContext}>{todayApostleQuote.contextNote}</Text>
              </View>
            </View>

            <Text style={styles.apostleQuoteBody}>
              "{todayApostleQuote.quote}"
            </Text>

            <View style={styles.apostleQuoteFooter}>
              <Text style={styles.apostleQuoteRef}>{todayApostleQuote.scriptureReference}</Text>
              <TouchableOpacity
                style={styles.replyToApostleBtn}
                onPress={handleOpenApostleFromQuote}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-outline" size={14} color="#111111" style={{ marginRight: 5 }} />
                <Text style={styles.replyToApostleText}>Reply to {todayApostleQuote.apostleName.split(' ')[0]}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Adaptive & Dismissible Sunday Ministry Preparation Card */}
          {!sundayCardDismissed && (() => {
            const role = userChurchRole || 'member';
            const roleConfig = {
              pastor: {
                badge: "SUNDAY SERMON BUILDER",
                icon: "mic-outline" as const,
                title: "Preparing this Sunday's message?",
                subtitle: "Outline your message, study original Greek & Hebrew meanings, or find powerful illustrations with Paul.",
                action: "Build Sermon with Paul",
                objective: "sermon_prep" as const
              },
              leader: {
                badge: "BIBLE STUDY BUILDER",
                icon: "people-outline" as const,
                title: "Leading your next Bible group?",
                subtitle: "Generate thoughtful discussion questions and biblical life lessons with Paul.",
                action: "Prepare Study with Paul",
                objective: "small_group" as const
              },
              member: {
                badge: "SUNDAY SERVICE PREPARATION",
                icon: "book-outline" as const,
                title: "Preparing your heart for church?",
                subtitle: "Read this week's passage early and ask questions so you arrive ready for Sunday.",
                action: "Study with Paul",
                objective: "personal_reflection" as const
              },
              seeker: {
                badge: "EXPLORE GOD'S WORD",
                icon: "compass-outline" as const,
                title: "Have questions about the Bible?",
                subtitle: "Ask Paul anything about Jesus, faith, or church in a safe and open space.",
                action: "Ask Paul Anything",
                objective: "seeker_explore" as const
              }
            }[role];

            return (
              <Animated.View
                exiting={FadeOutUp.duration(260)}
                layout={Layout.springify().damping(18).stiffness(120)}
                style={styles.sermonPrepCard}
              >
                <View style={styles.sermonCardTopBar}>
                  <View style={styles.sermonPrepHeader}>
                    <View style={styles.sermonIconBadge}>
                      <Ionicons name={roleConfig.icon} size={15} color="#FFFFFF" />
                    </View>
                    <Text style={styles.sermonPrepBadgeText}>{roleConfig.badge}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.dismissCardXBtn}
                    onPress={handleDismissSundayCard}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={17} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sermonPrepTitle}>{roleConfig.title}</Text>
                <Text style={styles.sermonPrepSubtitle}>{roleConfig.subtitle}</Text>

                <TouchableOpacity
                  style={styles.sermonActionRow}
                  onPress={() => {
                    const paul = APOSTLE_PERSONAS.find(a => a.id === 'paul') || APOSTLE_PERSONAS[0];
                    onSelectApostle(paul, undefined, undefined, roleConfig.objective);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sermonActionText}>{roleConfig.action}</Text>
                  <Ionicons name="arrow-forward" size={15} color="#111111" />
                </TouchableOpacity>
              </Animated.View>
            );
          })()}

          <View style={{ height: 24 }} />
        </ScrollView>
      ) : (
        /* Disciples Full 2-Column Grid Tab */
        <FlatList
          data={APOSTLE_PERSONAS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.disciplesListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ApostleCard
              apostle={item}
              onPress={onSelectApostle}
            />
          )}
        />
      )}

      {/* Scripture Detail Modal */}
      {selectedVerse && (
        <ScriptureDetailModal
          visible={Boolean(selectedVerse)}
          verse={selectedVerse}
          onClose={() => setSelectedVerse(null)}
        />
      )}

      {/* Notifications Modal with Live Origin Deep-Linking Navigation */}
      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpenApostle={(apostleId) => {
          const found = APOSTLE_PERSONAS.find(a => a.id === apostleId) || APOSTLE_PERSONAS[0];
          onSelectApostle(found);
        }}
        onOpenBadge={(badgeId) => {
          const badge = growthProfile?.badges.find(b => b.id === badgeId) ||
                        growthProfile?.badges[0] || null;
          if (badge) {
            setSelectedBadgeForDetail(badge);
          }
        }}
        onOpenScripture={handleOpenVerseModal}
      />

      {/* Dedicated Badge Detail Screen Modal */}
      <BadgeDetailModal
        visible={Boolean(selectedBadgeForDetail)}
        badge={selectedBadgeForDetail}
        onClose={() => setSelectedBadgeForDetail(null)}
      />

      {/* Badges Screen Modal */}
      <BadgesModal
        visible={badgesModalOpen}
        onClose={() => setBadgesModalOpen(false)}
        badges={growthProfile?.badges || []}
        onSelectBadge={(badge) => {
          setBadgesModalOpen(false);
          setSelectedBadgeForDetail(badge);
        }}
      />

      {/* Daily Deed Completion & Reflection Modal */}
      <DeedCompletionModal
        visible={deedModalVisible}
        deed={todayDeed}
        mode={deedModalMode}
        onClose={() => setDeedModalVisible(false)}
        onSuccess={() => {
          setDeedCompleted(true);
        }}
      />

      {/* Daily Guided Audio Liturgy Overlay Modal */}
      <DailyLiturgyModal
        visible={showLiturgyModal}
        onClose={() => setShowLiturgyModal(false)}
        liturgy={todayLiturgy}
        userName={currentUserName}
        isAlreadyCompleted={isLiturgyDone}
        onCompleted={() => {
          setIsLiturgyDone(true);
          getSpiritualGrowthProfile().then(setGrowthProfile).catch(console.warn);
        }}
      />
          {/* Progressive Church Role Profiling Modal */}
      <ChurchRoleModal
        visible={showChurchRoleModal}
        onClose={(selected) => {
          setShowChurchRoleModal(false);
          if (selected) setUserChurchRole(selected);
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
    width: 54,
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 4,
  },
  streakPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111111',
  },
  notificationBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  moreForYouHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111111',
    marginTop: 20,
    marginBottom: 12,
  },
  resumeReadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  resumeContent: {
    flex: 1,
    paddingRight: 14,
  },
  resumeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resumePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  resumePillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  resumeEstTime: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  resumePassageTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 18,
    color: '#111111',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  resumeSnippetText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4B5563',
  },
  resumeActionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  planCardContent: {
    flex: 1,
    paddingRight: 12,
  },
  planDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  planDayText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#111111',
  },
  planTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
    marginBottom: 4,
  },
  planSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
  planThumbnailWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  planThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  shareBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  shareBannerImageWrap: {
    width: '100%',
    height: 125,
    backgroundColor: '#E5E5EA',
  },
  shareBannerImage: {
    width: '100%',
    height: '100%',
  },
  shareBannerBody: {
    padding: 16,
  },
  shareBannerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15.5,
    color: '#111111',
    marginBottom: 4,
  },
  shareBannerSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 14,
  },
  shareBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareNowBtn: {
    paddingVertical: 4,
  },
  shareNowText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111111',
  },
  dismissBtn: {
    paddingVertical: 4,
  },
  dismissText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  badgesSpotlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  badgesSpotlightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgesSpotlightHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
  },
  viewAllBadgesInline: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#6B7280',
  },
  badgesSpotlightContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeEmblemSeal: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  badgeSealImg: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
  },
  badgeCountBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#111111',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeCountText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  badgeInfoCol: {
    flex: 1,
  },
  badgeSpotlightTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
    marginBottom: 2,
  },
  badgeSpotlightSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
  },
  apostleQuoteCard: {
    ...CardStyles.smoothCard,
    padding: 20,
    marginBottom: 20,
  },
  apostleQuoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  apostleAvatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor: '#9E9FA6',
    marginRight: 12,
  },
  apostleAvatar: {
    width: '100%',
    height: '100%',
  },
  apostleQuoteMeta: {
    flex: 1,
  },
  apostleQuoteName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 18,
    color: '#111111',
  },
  apostleQuoteContext: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#555555',
    marginTop: 1,
  },
  apostleQuoteBody: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 16.5,
    lineHeight: 26,
    color: '#1F2937',
    marginBottom: 12,
  },
  apostleQuoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  apostleQuoteRef: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#666666',
  },
  replyToApostleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  replyToApostleText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#111111',
  },
  sermonPrepCard: {
    ...CardStyles.smoothCard,
    padding: 20,
    marginBottom: 20,
  },
  sermonCardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dismissCardXBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sermonPrepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sermonIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sermonPrepBadgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111111',
  },
  sermonPrepTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: '#111111',
    marginBottom: 6,
  },
  sermonPrepSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    lineHeight: 19,
    color: '#444444',
    marginBottom: 14,
  },
  sermonActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECECF0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  sermonActionText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12.5,
    color: '#111111',
  },
  faithCompanionsSection: {
    marginHorizontal: -16,
    marginBottom: 20,
    marginTop: 6,
    overflow: 'visible',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansBold,
    fontSize: 20,
    color: '#111111',
  },
  sectionSubheading: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#777777',
  },
  mascotsScroll: {
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  mascotCompanionCard: {
    alignItems: 'center',
    width: 82,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  mascotImgWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
    marginBottom: 6,
  },
  mascotImg: {
    width: '100%',
    height: '100%',
  },
  mascotName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#111111',
    textAlign: 'center',
  },
  mascotFruit: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10,
    color: '#777777',
    marginTop: 1,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  disciplesListContent: {
    paddingTop: 16,
    paddingBottom: 110,
  },
  companionsSectionWrap: {
    marginHorizontal: -16,
    marginTop: 20,
    marginBottom: 8,
    overflow: 'visible',
  },
  companionsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  companionsHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111827',
  },
  seeAllText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  companionsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  companionMiniCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companionAvatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  companionMiniAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F3F4F6',
  },
  companionOnlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  companionMiniName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  companionMiniRole: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  companionChatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  companionChatPillText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: '#111827',
  },
  exploreMoreCard: {
    width: 140,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  exploreMoreIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exploreMoreTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  exploreMoreSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 14,
  },
});
