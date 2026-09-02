import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { FaithBadge } from '../services/gamificationService';
import { MascotAssets } from '../services/mascotAssets';

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#111111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{badge.title}</Text>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={22} color="#111111" />
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

          {/* Milestones Section matching Reference Image 2 */}
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
              const dateStr = idx === 0 ? 'Apr 28, 2024' : idx === 1 ? 'Apr 7, 2024' : 'Mar 29, 2024';
              return (
                <View key={tier} style={styles.milestoneRow}>
                  <View style={styles.milestoneBadgePill}>
                    <Text style={styles.milestoneBadgeText}>{tier}</Text>
                  </View>

                  <View style={styles.milestoneContent}>
                    <Text style={styles.completedText}>Completed on {dateStr}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 18,
    color: '#111111',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  showcaseSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 28,
  },
  shieldContainer: {
    width: 140,
    height: 154,
    backgroundColor: '#F3F3F5',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 20,
    position: 'relative',
  },
  emblemCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  levelPill: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  levelPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  badgeInstructionText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: '#111111',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
    marginVertical: 4,
  },
  milestonesSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  milestonesHeading: {
    fontFamily: Typography.fontSansBold,
    fontSize: 17,
    color: '#111111',
    marginBottom: 20,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  milestoneBadgePill: {
    width: 44,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  milestoneBadgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#374151',
  },
  milestoneContent: {
    flex: 1,
  },
  remainingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14.5,
    color: '#111111',
    marginBottom: 8,
  },
  progressBarTrack: {
    width: 140,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#111111',
    borderRadius: 2,
  },
  completedText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    color: '#111111',
  }
});
