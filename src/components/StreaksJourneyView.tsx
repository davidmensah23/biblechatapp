import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { SpiritualGrowthProfile } from '../services/gamificationService';

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
        <View style={styles.pathHeader}>
          <Text style={styles.pathTitle}>7-Day Walk Path</Text>
          <Text style={styles.pathStreakBadge}>{growthProfile.streakDays} Days Strong</Text>
        </View>

        <View style={styles.daysRow}>
          {WEEK_DAYS.map((day, idx) => {
            const isCompleted = idx <= (growthProfile.streakDays % 7);
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
                    <Ionicons name="flame" size={18} color="#F59E0B" />
                  ) : (
                    <Text style={styles.dayCircleText}>{day}</Text>
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

        <View style={styles.questCard}>
          <View style={[styles.questIconWrap, { backgroundColor: '#DEF7EC' }]}>
            <Ionicons name="sunny-outline" size={20} color="#059669" />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>Morning Scripture Reflection</Text>
            <Text style={styles.questSubtitle}>Read today's verse & reflect with Peter</Text>
          </View>
          <View style={styles.questRewardPill}>
            <Text style={styles.questRewardText}>+15 XP</Text>
          </View>
        </View>

        <View style={styles.questCard}>
          <View style={[styles.questIconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="chatbubbles-outline" size={20} color="#2563EB" />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>Apostolic Fellowship</Text>
            <Text style={styles.questSubtitle}>Share a prayer or question in chat</Text>
          </View>
          <View style={styles.questRewardPill}>
            <Text style={styles.questRewardText}>+20 XP</Text>
          </View>
        </View>

        <View style={styles.questCard}>
          <View style={[styles.questIconWrap, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="book-outline" size={20} color="#7C3AED" />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>Bible Chapter Study</Text>
            <Text style={styles.questSubtitle}>Complete 1 full chapter in the Bible reader</Text>
          </View>
          <View style={styles.questRewardPill}>
            <Text style={styles.questRewardText}>+25 XP</Text>
          </View>
        </View>
      </View>

      {/* Spiritual Collectibles & Relics Shelf */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Faith Artifacts & Relics</Text>
        <Text style={styles.sectionSub}>Unlock sacred relics through study and devotion</Text>

        <View style={styles.collectiblesGrid}>
          {COLLECTIBLES.map((c) => (
            <View key={c.id} style={[styles.collectibleCard, !c.isUnlocked && styles.collectibleCardLocked]}>
              <View style={[styles.collectibleIconWrap, { backgroundColor: c.isUnlocked ? `${c.color}15` : '#E5E7EB' }]}>
                <Ionicons
                  name={c.icon as any}
                  size={24}
                  color={c.isUnlocked ? c.color : '#9CA3AF'}
                />
              </View>
              <Text style={[styles.collectibleName, !c.isUnlocked && styles.collectibleNameLocked]} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.collectibleDesc} numberOfLines={2}>
                {c.desc}
              </Text>
            </View>
          ))}
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
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  dayCircleText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  dayLabel: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#9CA3AF',
  },
  dayLabelToday: {
    fontFamily: Typography.fontSansSemiBold,
    color: '#2563EB',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    marginBottom: 10,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  questIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111827',
  },
  questSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
  },
  questRewardPill: {
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  questRewardText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#7C3AED',
  },
  collectiblesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  collectibleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    textAlign: 'center',
  },
  collectibleCardLocked: {
    opacity: 0.55,
    backgroundColor: '#FAFAFA',
  },
  collectibleIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  collectibleName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 3,
  },
  collectibleNameLocked: {
    color: '#6B7280',
  },
  collectibleDesc: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 15,
  }
});
