import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
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

interface HomeScreenProps {
  onSelectApostle: (apostle: ApostlePersona) => void;
  onOpenBible?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectApostle, onOpenBible }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'forYou' | 'disciples'>('forYou');
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [badgesModalOpen, setBadgesModalOpen] = useState(false);
  const [selectedBadgeForDetail, setSelectedBadgeForDetail] = useState<FaithBadge | null>(null);
  const [shareBannerDismissed, setShareBannerDismissed] = useState(false);
  const [growthProfile, setGrowthProfile] = useState<SpiritualGrowthProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Daily Liturgy Guided Prayer State
  const [todayLiturgy, setTodayLiturgy] = useState<DailyLiturgy>(getTodayLiturgy());
  const [isLiturgyDone, setIsLiturgyDone] = useState(false);
  const [showLiturgyModal, setShowLiturgyModal] = useState(false);

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
      isLiturgyCompletedForToday().then(setIsLiturgyDone).catch(console.warn)
    ]).finally(() => {
      setTodayDeed(getTodayDeedForUser());
      setTodayLiturgy(getTodayLiturgy());
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
    onSelectApostle(apostle);
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
              AI Companions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Header Actions: Streak Pill & Notification Bell */}
        <View style={styles.headerRightActions}>
          <View style={styles.streakPill}>
            <Ionicons name="flash" size={14} color="#111111" />
            <Text style={styles.streakPillText}>{growthProfile?.streakDays || 1}</Text>
          </View>

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
              <Text style={styles.companionsHeading}>Your AI Companions</Text>
              <TouchableOpacity onPress={() => setActiveTab('disciples')} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all ({APOSTLE_PERSONAS.length})</Text>
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
                    <Text style={styles.companionChatPillText}>Converse</Text>
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
                <Text style={styles.exploreMoreTitle}>Explore More</Text>
                <Text style={styles.exploreMoreSubtitle}>Meet all 7 Apostles & Biblical mentors</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ========================================================================= */}
          {/* 3. DAILY GUIDED AUDIO LITURGY */}
          {/* ========================================================================= */}
          <Text style={styles.moreForYouHeading}>More for you</Text>

          {/* 1. Daily Guided Audio Liturgy (Morning / Evening) */}
          <DailyLiturgyCard
            liturgy={todayLiturgy}
            isCompleted={isLiturgyDone}
            onPress={() => setShowLiturgyModal(true)}
          />

          {/* 2. Daily Reading Plan Card */}
          <TouchableOpacity
            style={styles.planCard}
            onPress={onOpenBible}
            activeOpacity={0.85}
          >
            <View style={styles.planCardContent}>
              <View style={styles.planDayBadge}>
                <Ionicons name="checkbox-outline" size={15} color="#111111" />
                <Text style={styles.planDayText}>Day 5</Text>
              </View>
              <Text style={styles.planTitle}>The Ruthless Elimination Of Hurry</Text>
              <Text style={styles.planSubtitle}>A 5-Day Reading Plan from John Mark Comer</Text>
            </View>

            <View style={styles.planThumbnailWrap}>
              <Image source={MascotAssets.bread} style={styles.planThumbnailImage} />
              <View style={styles.planThumbnailOverlay}>
                <Text style={styles.planThumbTitle}>The Ruthless Elimination</Text>
              </View>
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
                <Text style={styles.shareBannerTitle}>Share the Bible App</Text>
                <Text style={styles.shareBannerSub}>
                  Invite your friends to connect with you here, in Biblical community.
                </Text>
                <View style={styles.shareBannerActions}>
                  <TouchableOpacity
                    style={styles.shareNowBtn}
                    onPress={() => alert('Sharing Bible Chat App with friends')}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.shareNowText}>Share Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dismissBtn}
                    onPress={() => setShareBannerDismissed(true)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.dismissText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 3. Badges Spotlight Card */}
          <View style={styles.badgesSpotlightCard}>
            <Text style={styles.badgesSpotlightHeading}>Badges</Text>
            <View style={styles.badgesSpotlightContent}>
              <View style={styles.badgeEmblemSeal}>
                <Image source={MascotAssets.bread} style={styles.badgeSealImg} />
                <View style={styles.badgeCountBadge}>
                  <Text style={styles.badgeCountText}>{growthProfile?.badges?.find(b => b.id === 'sower')?.level || 0}</Text>
                </View>
              </View>
              <Text style={styles.badgeSpotlightTitle}>Sower</Text>
              <TouchableOpacity onPress={() => setBadgesModalOpen(true)} activeOpacity={0.7}>
                <Text style={styles.badgeSpotlightLearnMore}>Learn More</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.viewAllBadgesBtn}
              onPress={() => setBadgesModalOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllBadgesText}>View All</Text>
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

          {/* Interactive Sunday Sermon Preparation Hub */}
          <TouchableOpacity
            style={styles.sermonPrepCard}
            onPress={() => {
              const paul = APOSTLE_PERSONAS.find(a => a.id === 'paul') || APOSTLE_PERSONAS[0];
              onSelectApostle(paul);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.sermonPrepHeader}>
              <View style={styles.sermonIconBadge}>
                <Ionicons name="book-outline" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.sermonPrepBadgeText}>Sunday Sermon Workshop</Text>
            </View>
            <Text style={styles.sermonPrepTitle}>Preparing a message to feed the flock?</Text>
            <Text style={styles.sermonPrepSubtitle}>
              Collaborate step-by-step with the Apostles or generate a complete, Scripture-anchored sermon manuscript.
            </Text>
            <View style={styles.sermonActionRow}>
              <Text style={styles.sermonActionText}>Start Sermon Prep with Paul</Text>
              <Ionicons name="arrow-forward" size={15} color="#111111" />
            </View>
          </TouchableOpacity>

          {/* Faith Companions & Fruits of the Spirit Showcase */}
          <View style={styles.faithCompanionsSection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeading}>Faith Companions</Text>
              <Text style={styles.sectionSubheading}>Fruits of the Spirit</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mascotsScroll}>
              {[
                { id: 'cloud', name: 'Cotton Cloud', fruit: 'Peace', img: MascotAssets.cloud },
                { id: 'bread', name: 'Daily Manna', fruit: 'Truth', img: MascotAssets.bread },
                { id: 'flame', name: 'Holy Flame', fruit: 'Zeal', img: MascotAssets.flame },
                { id: 'dewdrop', name: 'Living Dew', fruit: 'Grace', img: MascotAssets.dewdrop },
                { id: 'rock', name: 'Cornerstone', fruit: 'Faith', img: MascotAssets.rock },
                { id: 'cedar', name: 'Cedar', fruit: 'Strength', img: MascotAssets.cedar },
                { id: 'blossom', name: 'Lily', fruit: 'Joy', img: MascotAssets.blossom },
                { id: 'group', name: 'Fellowship', fruit: 'Love', img: MascotAssets.group },
              ].map((m) => (
                <View key={m.id} style={styles.mascotCompanionCard}>
                  <View style={styles.mascotImgWrapper}>
                    <Image source={m.img} style={styles.mascotImg} />
                  </View>
                  <Text style={styles.mascotName}>{m.name}</Text>
                  <Text style={styles.mascotFruit}>{m.fruit}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

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
        isAlreadyCompleted={isLiturgyDone}
        onCompleted={() => {
          setIsLiturgyDone(true);
          getSpiritualGrowthProfile().then(setGrowthProfile).catch(console.warn);
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
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#C53030',
  },
  planThumbnailImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  planThumbnailOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
  },
  planThumbTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 8.5,
    color: '#FFFFFF',
    textAlign: 'center',
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
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  badgesSpotlightHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111111',
    marginBottom: 12,
  },
  badgesSpotlightContent: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  badgeEmblemSeal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#3A7D63',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  badgeSealImg: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  badgeCountBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#111111',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeCountText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  badgeSpotlightTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
    marginBottom: 3,
  },
  badgeSpotlightLearnMore: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },
  viewAllBadgesBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllBadgesText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111111',
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
    fontFamily: Typography.fontSerifBold,
    fontSize: 21,
    letterSpacing: -0.5,
    color: '#111111',
  },
  apostleQuoteContext: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#555555',
    marginTop: 1,
  },
  apostleQuoteBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15.5,
    lineHeight: 23,
    color: '#222222',
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
    fontFamily: Typography.fontSerifBold,
    fontSize: 23,
    letterSpacing: -0.6,
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
    marginBottom: 20,
    marginTop: 6,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionHeading: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#111111',
  },
  sectionSubheading: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#777777',
  },
  mascotsScroll: {
    gap: 12,
    paddingHorizontal: 4,
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
    marginTop: 20,
    marginBottom: 8,
  },
  companionsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
