import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { FaithBadge } from '../services/gamificationService';
import { MascotAssets } from '../services/mascotAssets';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';

interface BadgeDetailModalProps {
  visible: boolean;
  badge: FaithBadge | null;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  visible,
  badge,
  onClose
}) => {
  if (!badge) return null;

  const mascotImg = MascotAssets[badge.mascotKey] || MascotAssets.bread;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Walking together in Faith! I have achieved the "${badge.title}" Badge on Bible Chat App. Join me daily in Scripture!`,
        title: `${badge.title} Badge`
      });
    } catch (e) {}
  };

  const currentLevel = badge.level || (badge.isUnlocked ? 1 : 0);
  const tiers = [1, 5, 10, 25, 50, 100];
  
  const nextTarget = tiers.find(t => t > currentLevel) || (currentLevel + 10);
  const remaining = Math.max(1, nextTarget - currentLevel);
  const inProgressRatio = Math.min(1, Math.max(0.1, currentLevel / nextTarget));

  const completedTiers = tiers.filter(t => t <= currentLevel).reverse();

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="mid"
      midHeightRatio={0.78}
      fullHeightRatio={0.98}
    >
      <View style={styles.sheetContent}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#111111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{badge.title}</Text>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Showcase Shield */}
          <View style={styles.showcaseSection}>
            <View style={styles.shieldContainer}>
              <View style={[styles.emblemCircle, { borderColor: badge.badgeColor || '#D99B38' }]}>
                <Image source={mascotImg} style={styles.mascotImage} resizeMode="cover" />
              </View>

              {/* Level Pill inside Shield */}
              <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>{currentLevel}</Text>
              </View>
            </View>

            {/* Description Subtitle */}
            <Text style={styles.badgeInstructionText}>
              {badge.subtitle}
            </Text>
          </View>

          {/* Hairline Divider */}
          <View style={styles.divider} />

          {/* Milestones Section */}
          <View style={styles.milestonesSection}>
            <Text style={styles.milestonesHeading}>Milestones</Text>

            {/* In-Progress Milestone Card (Next Level) */}
            <View style={styles.milestoneRow}>
              <View style={styles.milestoneBadgePill}>
                <Text style={styles.milestoneBadgeText}>{nextTarget}</Text>
              </View>

              <View style={styles.milestoneContent}>
                <Text style={styles.remainingText}>{remaining} remaining</Text>
                {/* Horizontal Progress Bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${inProgressRatio * 100}%` }
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Completed Milestone Rows (History) */}
            {completedTiers.map((tier, idx) => {
              const dateStr = idx === 0 ? 'Recently' : 'Earlier';
              return (
                <View key={tier} style={styles.milestoneRow}>
                  <View style={styles.milestoneBadgePill}>
                    <Text style={styles.milestoneBadgeText}>{tier}</Text>
                  </View>

                  <View style={styles.milestoneContent}>
                    <Text style={styles.completedText}>Completed · Level {tier}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 17,
    color: '#111111',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  showcaseSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emblemCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mascotImage: {
    width: '85%',
    height: '85%',
  },
  levelPill: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelPillText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  badgeInstructionText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  milestonesSection: {
    marginTop: 4,
  },
  milestonesHeading: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: '#111111',
    marginBottom: 16,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  milestoneBadgePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  milestoneBadgeText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#111827',
  },
  milestoneContent: {
    flex: 1,
  },
  remainingText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111827',
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  completedText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#6B7280',
  },
});
