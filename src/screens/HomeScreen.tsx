import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
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
  const [showNotifications, setShowNotifications] = useState(false);

  const tabIndicatorOffset = useSharedValue(0);

  useEffect(() => {
    // Exact centered offset: 20px for "For You", 124px for "Disciples"
    tabIndicatorOffset.value = withSpring(activeTab === 'forYou' ? 20 : 124, SpringConfigs.bouncy);
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
      {/* Top Header with Tabs & Notification Bell Button */}
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {/* For You Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('forYou')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.tabTextActive]}>
              For You
            </Text>
          </TouchableOpacity>

          {/* Disciples Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('disciples')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'disciples' && styles.tabTextActive]}>
              Disciples
            </Text>
          </TouchableOpacity>

          {/* Gliding Compact Red Indicator */}
          <Animated.View style={[styles.activeTabIndicator, animatedIndicatorStyle]} />
        </View>

        {/* Working Notification Bell Icon */}
        <TouchableOpacity
          style={styles.notificationBellBtn}
          onPress={() => setShowNotifications(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          <View style={styles.notificationUnreadDot} />
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

          {/* Meet Your Heroes Section */}
          <Text style={styles.sectionHeading}>Meet your heroes</Text>

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
        /* Disciples 2-Column Grid Tab */
        <FlatList
          data={APOSTLE_PERSONAS}
          keyExtractor={(item) => item.id}
          numColumns={2}
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

      {/* Interactive Notifications Modal */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 4,
  },
  tabButton: {
    paddingVertical: 6,
    marginRight: 24,
  },
  tabText: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 32,
    height: 2.5,
    backgroundColor: Colors.accentRed,
    borderRadius: 2,
  },
  notificationBellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationUnreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  sectionHeading: {
    fontFamily: Typography.fontSerif,
    fontSize: 28,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  disciplesListContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 110,
  }
});
