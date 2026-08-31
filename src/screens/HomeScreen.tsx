import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { APOSTLE_PERSONAS } from '../services/personas';
import { DAILY_SCRIPTURE_FEATURED } from '../services/bibleData';
import { ApostlePersona, BibleVerse } from '../types';
import { ApostleCard } from '../components/ApostleCard';
import { DailyScriptureCard } from '../components/DailyScriptureCard';
import { ScriptureDetailModal } from '../components/ScriptureDetailModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { SpringConfigs } from '../theme/animations';

interface HomeScreenProps {
  onSelectApostle: (apostle: ApostlePersona) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectApostle }) => {
  const [activeTab, setActiveTab] = useState<'forYou' | 'disciples'>('forYou');
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const tabIndicatorOffset = useSharedValue(0);

  useEffect(() => {
    // Indicator positioned right above the text: 0 for "For You", 108px for "Disciples"
    tabIndicatorOffset.value = withSpring(activeTab === 'forYou' ? 0 : 108, SpringConfigs.bouncy);
  }, [activeTab]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorOffset.value }],
  }));

  const handleOpenVerseModal = () => {
    setSelectedVerse({
      book: DAILY_SCRIPTURE_FEATURED.book,
      chapter: DAILY_SCRIPTURE_FEATURED.chapter,
      verse: DAILY_SCRIPTURE_FEATURED.verse,
      text: DAILY_SCRIPTURE_FEATURED.quote,
      translation: 'NIV'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Tabs & Notification Icon on Top-Right */}
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {/* Gliding Top Red Line positioned Above the Active Tab */}
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
          {/* Daily Scripture Featured Card */}
          <DailyScriptureCard
            quote={DAILY_SCRIPTURE_FEATURED.quote}
            reference={DAILY_SCRIPTURE_FEATURED.reference}
            onReadMore={handleOpenVerseModal}
          />

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

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
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
    width: 60,
    height: 3,
    backgroundColor: '#D92D20',
    borderRadius: 2,
  },
  tabButton: {
    paddingRight: 24,
    paddingVertical: 4,
  },
  tabText: {
    fontFamily: Typography.fontSerif,
    fontSize: 27,
  },
  tabTextActive: {
    color: '#111111',
  },
  tabTextInactive: {
    color: '#A0A0A5',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  sectionHeading: {
    fontFamily: Typography.fontSerif,
    fontSize: 28,
    color: '#111111',
    marginTop: 22,
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
