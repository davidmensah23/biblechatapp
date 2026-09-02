import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Typography } from '../theme/typography';
import { FaithBadge } from '../services/gamificationService';
import { MascotAssets } from '../services/mascotAssets';

interface MascotBadgeCardProps {
  badge: FaithBadge;
  onPress?: () => void;
  size?: 'normal' | 'compact';
}

export const MascotBadgeCard: React.FC<MascotBadgeCardProps> = ({
  badge,
  onPress,
  size = 'normal'
}) => {
  const mascotImg = MascotAssets[badge.mascotKey] || MascotAssets.bread;
  const isCompact = size === 'compact';
  const progressRatio = badge.maxProgress > 0 ? Math.min(1, badge.progress / badge.maxProgress) : 0;

  if (isCompact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.compactEmblemCircle, { borderColor: badge.isUnlocked ? badge.badgeColor : '#D1D5DB' }]}>
          <Image
            source={mascotImg}
            style={[styles.compactImage, !badge.isUnlocked && styles.imageLocked]}
            resizeMode="cover"
          />
          <View style={[styles.compactLevelPill, { backgroundColor: badge.isUnlocked ? '#111111' : '#9CA3AF' }]}>
            <Text style={styles.compactLevelText}>{badge.level}</Text>
          </View>
        </View>

        <View style={styles.compactProgressBar}>
          <View
            style={[
              styles.compactProgressFill,
              { width: `${progressRatio * 100}%`, backgroundColor: badge.isUnlocked ? '#DC2626' : '#9CA3AF' }
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.shieldContainer, !badge.isUnlocked && styles.shieldLocked]}>
        <View style={[styles.emblemCircle, { borderColor: badge.isUnlocked ? badge.badgeColor : '#D1D5DB' }]}>
          <Image
            source={mascotImg}
            style={[styles.image, !badge.isUnlocked && styles.imageLocked]}
            resizeMode="cover"
          />
        </View>

        {/* Level Counter Pill */}
        <View style={[styles.levelPill, { backgroundColor: badge.isUnlocked ? '#6B7280' : '#D1D5DB' }]}>
          <Text style={styles.levelText}>{badge.level}</Text>
        </View>
      </View>

      <Text style={[styles.badgeTitle, !badge.isUnlocked && styles.titleLocked]} numberOfLines={2}>
        {badge.title}
      </Text>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressRatio * 100}%`, backgroundColor: badge.isUnlocked ? '#111111' : '#E5E7EB' }
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 24,
  },
  shieldContainer: {
    width: '100%',
    height: 112,
    backgroundColor: '#F3F3F5',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  shieldLocked: {
    opacity: 0.6,
    backgroundColor: '#FAFAFA',
  },
  emblemCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    borderWidth: 2.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLocked: {
    opacity: 0.4,
    tintColor: '#9CA3AF',
  },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  levelText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  badgeTitle: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#111111',
    textAlign: 'center',
    minHeight: 32,
    marginBottom: 6,
  },
  titleLocked: {
    color: '#9CA3AF',
  },
  progressBar: {
    width: '70%',
    height: 3.5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactCard: {
    alignItems: 'center',
    width: 66,
    marginRight: 14,
  },
  compactEmblemCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactLevelPill: {
    position: 'absolute',
    bottom: -1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },
  compactLevelText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  compactProgressBar: {
    width: 48,
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  }
});
