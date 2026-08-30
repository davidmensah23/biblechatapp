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
import { SpringConfigs } from '../theme/animations';

interface HomeScreenProps {
  onSelectApostle: (apostle: ApostlePersona) => void;
  onOpenChatList: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectApostle, onOpenChatList }) => {
  const [activeTab, setActiveTab] = useState<'forYou' | 'disciples'>('forYou');
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);

  const tabIndicatorOffset = useSharedValue(0);

  useEffect(() => {
    tabIndicatorOffset.value = withSpring(activeTab === 'forYou' ? 0 : 96, SpringConfigs.bouncy);
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
      {/* Top Header with Tabs & Chat Button */}
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

          {/* Gliding Red Indicator */}
          <Animated.View style={[styles.activeTabIndicator, animatedIndicatorStyle]} />
        </View>

        {/* Chats Navigation Icon */}
        <TouchableOpacity style={styles.chatListIconBtn} onPress={onOpenChatList} activeOpacity={0.7}>
          <Ionicons name="chatbubbles-outline" size={22} color={Colors.textPrimary} />
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
          contentContainerStyle={styles.disciplesGridContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ApostleCard
              apostle={item}
              onPress={onSelectApostle}
            />
          )}
        />
      )}

      {/* Scripture Reader Modal */}
      <ScriptureDetailModal
        visible={Boolean(selectedVerse)}
        verse={selectedVerse}
        onClose={() => setSelectedVerse(null)}
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
    fontSize: 22,
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 68,
    height: 2.5,
    backgroundColor: Colors.accentRed,
    borderRadius: 2,
  },
  chatListIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
  },
  disciplesGridContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 110,
  },
  sectionHeading: {
    fontFamily: Typography.fontSerif,
    fontSize: 24,
    color: Colors.textPrimary,
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
