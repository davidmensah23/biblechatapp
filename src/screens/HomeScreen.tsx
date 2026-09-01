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
import { CardStyles } from '../theme/cardStyles';
import { SpringConfigs } from '../theme/animations';

interface HomeScreenProps {
  onSelectApostle: (apostle: ApostlePersona) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectApostle }) => {
  const [activeTab, setActiveTab] = useState<'forYou' | 'disciples'>('forYou');
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Daily Kingdom Deed Challenge State
  const [todayDeed, setTodayDeed] = useState<KingdomDeed>(getTodayDeedForUser());
  const [deedCompleted, setDeedCompleted] = useState(false);
  const [deedModalVisible, setDeedModalVisible] = useState(false);
  const [deedModalMode, setDeedModalMode] = useState<'complete' | 'scripture'>('complete');

  const todayScripture = getTodayScripture();
  const todayApostleQuote = getTodayApostleQuotation();

  const tabIndicatorOffset = useSharedValue(0);

  useEffect(() => {
    initDeedsDatabase().catch(console.error);
    setTodayDeed(getTodayDeedForUser());
  }, []);

  useEffect(() => {
    tabIndicatorOffset.value = withSpring(activeTab === 'forYou' ? 0 : 108, SpringConfigs.bouncy);
  }, [activeTab]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorOffset.value }],
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
              For You
            </Text>
          </TouchableOpacity>

          {/* Disciples Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('disciples')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'disciples' ? styles.tabTextActive : styles.tabTextInactive]}>
              Disciples
            </Text>
          </TouchableOpacity>
        </View>

        {/* Working Notification Bell on Top Right Corner */}
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => setNotificationsOpen(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={23} color="#111111" />
          <View style={styles.notificationBadgeDot} />
        </TouchableOpacity>
      </View>

      {/* Main Tab Content */}
      {activeTab === 'forYou' ? (
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
              <Ionicons name="arrow-forward" size={15} color="#2563EB" />
            </View>
          </TouchableOpacity>

          {/* Meet Your Heroes Section Heading */}
          <Text style={styles.sectionHeading}>Meet your heroes</Text>

          {/* 2-Column Grid Rows */}
          <View style={styles.gridRow}>
            {APOSTLE_PERSONAS.slice(0, 2).map((apostle) => (
              <ApostleCard
                key={apostle.id}
                apostle={apostle}
                onPress={onSelectApostle}
              />
            ))}
          </View>

          <View style={styles.gridRow}>
            {APOSTLE_PERSONAS.slice(2, 4).map((apostle) => (
              <ApostleCard
                key={apostle.id}
                apostle={apostle}
                onPress={onSelectApostle}
              />
            ))}
          </View>
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

      {/* Notifications Modal with Live Navigation */}
      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpenApostle={(apostleId) => {
          const found = APOSTLE_PERSONAS.find(a => a.id === apostleId) || APOSTLE_PERSONAS[0];
          onSelectApostle(found);
        }}
        onOpenScripture={handleOpenVerseModal}
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
    width: 68,
    height: 3.5,
    backgroundColor: '#D92D20',
    borderRadius: 2,
  },
  tabButton: {
    paddingRight: 28,
    paddingVertical: 4,
  },
  tabText: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 32,
    letterSpacing: -1.2,
  },
  tabTextActive: {
    color: '#111111',
  },
  tabTextInactive: {
    color: '#A8A8B0',
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6E6EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    fontSize: 22,
    letterSpacing: -0.6,
    color: '#111111',
  },
  apostleQuoteContext: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#284682',
    marginTop: 1,
  },
  apostleQuoteBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    lineHeight: 20,
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
    color: '#2563EB',
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
    color: '#2563EB',
  },
  sectionHeading: {
    fontFamily: Typography.fontSerif,
    fontSize: 28,
    color: '#111111',
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
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
});
