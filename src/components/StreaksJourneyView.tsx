import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { SpiritualGrowthProfile } from '../services/gamificationService';
import { MascotAssets } from '../services/mascotAssets';

interface StreaksJourneyViewProps {
  growthProfile: SpiritualGrowthProfile;
  onSelectApostle?: () => void;
  onOpenBible?: () => void;
}

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const COLLECTIBLES = [
  { id: 'scroll', name: 'Scroll of Isaiah', desc: 'Ancient Hebrew prophecies studied by the Apostles', icon: 'book', color: '#D97706', isUnlocked: true },
  { id: 'net', name: 'Galilean Net', desc: 'Memorial of leaving everything to follow the Master', icon: 'boat', color: '#2563EB', isUnlocked: true },
  { id: 'lantern', name: 'Damascus Lantern', desc: 'Symbol of the blinding grace that transformed Paul', icon: 'flashlight', color: '#7C3AED', isUnlocked: true },
  { id: 'alabaster', name: 'Alabaster Jar', desc: 'Fragrance of total devotion and heartfelt prayer', icon: 'water', color: '#EC4899', isUnlocked: false },
  { id: 'crown', name: 'Crown of Righteousness', desc: 'Promised to all who love His appearing (2 Tim 4:8)', icon: 'trophy', color: '#F59E0B', isUnlocked: false }
];

export const StreaksJourneyView: React.FC<StreaksJourneyViewProps> = ({
  growthProfile,
  onSelectApostle,
  onOpenBible
}) => {
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <View style={styles.container}>
      {/* 7-Day Walking Path Stepper */}
      <View style={styles.pathCard}>
        {/* Static Faith Mascot on Journey Path */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Image
            source={MascotAssets.bread}
            style={{ width: 64, height: 64, borderRadius: 16 }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.pathHeader}>
          <Text style={styles.pathTitle}>7-Day Walk Path</Text>
          <Text style={styles.pathStreakBadge}>
            {growthProfile.streakDays} {growthProfile.streakDays === 1 ? 'Day' : 'Days'} Strong 🔥
          </Text>
        </View>

        <View style={styles.daysRow}>
          {WEEK_DAYS.map((day, idx) => {
            const isCompleted = growthProfile.currentWeekActiveDays && growthProfile.currentWeekActiveDays[idx];
            const isToday = idx === currentDayIndex;

            return (
              <View key={idx} style={styles.dayItem}>
                <View
                  style={[
                    styles.dayCircle,
                    isCompleted && styles.dayCircleCompleted,
                    isToday && styles.dayCircleToday
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="flame" size={18} color="#111111" />
                  ) : (
                    <Text style={[styles.dayCircleText, isToday && styles.dayCircleTextToday]}>{day}</Text>
                  )}
                </View>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Daily Spiritual Habit Quests */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Daily Faith Habits</Text>

        {/* 1. Morning Scripture Reflection */}
        <TouchableOpacity
          style={styles.questCard}
          onPress={onOpenBible}
          activeOpacity={0.75}
        >
          <View style={styles.questIconWrap}>
            <Ionicons
              name={growthProfile.habitsStatus?.morningScripture ? 'checkmark-circle' : 'book-outline'}
              size={22}
              color="#111111"
            />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>Daily Scripture Reflection</Text>
            <Text style={styles.questSubtitle}>
              {growthProfile.habitsStatus?.morningScripture ? 'Completed for today' : 'Read today\'s verse & reflect'}
            </Text>
          </View>
          <View style={[styles.questRewardPill, growthProfile.habitsStatus?.morningScripture && styles.questRewardPillDone]}>
            <Text style={[styles.questRewardText, growthProfile.habitsStatus?.morningScripture && styles.questRewardTextDone]}>
              {growthProfile.habitsStatus?.morningScripture ? 'Done' : '+15 XP'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 2. Apostolic Fellowship */}
        <TouchableOpacity
          style={styles.questCard}
          onPress={onSelectApostle}
          activeOpacity={0.75}
        >
          <View style={styles.questIconWrap}>
            <Ionicons
              name={growthProfile.habitsStatus?.apostleChat ? 'checkmark-circle' : 'chatbubbles-outline'}
              size={22}
              color="#111111"
            />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>Apostolic Fellowship</Text>
            <Text style={styles.questSubtitle}>
              {growthProfile.habitsStatus?.apostleChat ? 'Completed for today' : 'Share a prayer or question in chat'}
            </Text>
          </View>
          <View style={[styles.questRewardPill, growthProfile.habitsStatus?.apostleChat && styles.questRewardPillDone]}>
            <Text style={[styles.questRewardText, growthProfile.habitsStatus?.apostleChat && styles.questRewardTextDone]}>
              {growthProfile.habitsStatus?.apostleChat ? 'Done' : '+20 XP'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 3. Kingdom Deed */}
        <View style={styles.questCard}>
          <View style={styles.questIconWrap}>
            <Ionicons
              name={growthProfile.habitsStatus?.kingdomDeed ? 'checkmark-circle' : 'heart-outline'}
              size={22}
              color="#111111"
            />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>Kingdom Deed of Grace</Text>
            <Text style={styles.questSubtitle}>
              {growthProfile.habitsStatus?.kingdomDeed ? 'Completed for today' : 'Complete your daily act of service'}
            </Text>
          </View>
          <View style={[styles.questRewardPill, growthProfile.habitsStatus?.kingdomDeed && styles.questRewardPillDone]}>
            <Text style={[styles.questRewardText, growthProfile.habitsStatus?.kingdomDeed && styles.questRewardTextDone]}>
              {growthProfile.habitsStatus?.kingdomDeed ? 'Done' : '+25 XP'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  pathCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  pathTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
  },
  pathStreakBadge: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: '#ECECEC',
    borderWidth: 1.5,
    borderColor: '#111111',
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: '#111111',
  },
  dayCircleText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  dayCircleTextToday: {
    color: '#111111',
    fontFamily: Typography.fontSansSemiBold,
  },
  dayLabel: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#9CA3AF',
  },
  dayLabelToday: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#111111',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  questIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111827',
  },
  questSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  questRewardPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questRewardPillDone: {
    backgroundColor: '#111111',
  },
  questRewardText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: '#111111',
  },
  questRewardTextDone: {
    color: '#FFFFFF',
  }
});
