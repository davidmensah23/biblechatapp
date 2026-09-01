import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { FaithBadge } from '../services/gamificationService';

let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {}

interface HoldToExplodeBadgeProps {
  badge: FaithBadge;
  onExplode: (badge: FaithBadge) => void;
}

const PARTICLE_COUNT = 16;
const PARTICLE_COLORS = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];

export const HoldToExplodeBadge: React.FC<HoldToExplodeBadgeProps> = ({ badge, onExplode }) => {
  const [isCharging, setIsCharging] = useState(false);
  const [hasExploded, setHasExploded] = useState(false);

  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const chargeProgress = useSharedValue(0);
  const explosionRadius = useSharedValue(0);
  const explosionOpacity = useSharedValue(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (!badge.isUnlocked) return;
    setIsCharging(true);

    // Growing scale & vibration physics
    scale.value = withTiming(1.12, { duration: 900, easing: Easing.out(Easing.quad) });
    shakeX.value = withSequence(
      withTiming(-3, { duration: 60 }),
      withTiming(3, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(4, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );

    chargeProgress.value = withTiming(1, { duration: 900, easing: Easing.linear });

    // Haptic pulses ramping up
    if (Haptics && Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      hapticIntervalRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 200);
    }

    timerRef.current = setTimeout(() => {
      triggerExplosion();
    }, 900);
  };

  const endHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);

    if (isCharging && !hasExploded) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      chargeProgress.value = withTiming(0, { duration: 250 });
      setIsCharging(false);
    }
  };

  const triggerExplosion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);

    setHasExploded(true);
    setIsCharging(false);

    if (Haptics && Haptics.notificationAsync) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Explosion animation
    scale.value = withSequence(
      withTiming(1.28, { duration: 120 }),
      withSpring(1, { damping: 10, stiffness: 180 })
    );

    explosionRadius.value = withTiming(90, { duration: 600, easing: Easing.out(Easing.cubic) });
    explosionOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 500 })
    );

    setTimeout(() => {
      onExplode(badge);
      setHasExploded(false);
      explosionRadius.value = 0;
    }, 450);
  };

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: shakeX.value }
    ]
  }));

  const particleArray = Array.from({ length: PARTICLE_COUNT });

  return (
    <Pressable
      onPressIn={startHold}
      onPressOut={endHold}
      style={styles.pressableWrap}
    >
      <Animated.View style={[styles.badgeCard, !badge.isUnlocked && styles.badgeCardLocked, badgeAnimatedStyle]}>
        {/* Particle Shockwave Blast */}
        {hasExploded && (
          <View style={styles.particleContainer}>
            {particleArray.map((_, i) => {
              const angle = (i * (360 / PARTICLE_COUNT) * Math.PI) / 180;
              const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.particleDot,
                    {
                      backgroundColor: color,
                      transform: [
                        { translateX: Math.cos(angle) * 45 },
                        { translateY: Math.sin(angle) * 45 }
                      ]
                    }
                  ]}
                />
              );
            })}
          </View>
        )}

        <View style={[styles.badgeIconWrap, { backgroundColor: badge.isUnlocked ? `${badge.iconColor}15` : '#E5E7EB' }]}>
          <Ionicons
            name={badge.iconName as any}
            size={24}
            color={badge.isUnlocked ? badge.iconColor : '#9CA3AF'}
          />
        </View>

        <View style={styles.badgeInfo}>
          <View style={styles.badgeTitleRow}>
            <Text style={[styles.badgeTitle, !badge.isUnlocked && styles.badgeTitleLocked]}>
              {badge.title}
            </Text>
            {badge.isUnlocked ? (
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
            ) : (
              <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
            )}
          </View>
          <Text style={styles.badgeSubtitle} numberOfLines={2}>
            {badge.subtitle}
          </Text>

          <View style={styles.badgeFooter}>
            <Text style={styles.badgeRewardText}>+{badge.xpReward} Grace XP</Text>
            {badge.isUnlocked && (
              <Text style={styles.holdHintText}>
                {isCharging ? '⚡ Release to Celebrate!' : 'Hold to celebrate'}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressableWrap: {
    marginBottom: 10,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeCardLocked: {
    opacity: 0.6,
    backgroundColor: '#FAFAFA',
  },
  badgeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  badgeTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
  },
  badgeTitleLocked: {
    color: '#6B7280',
  },
  badgeSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 17,
    marginBottom: 5,
  },
  badgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRewardText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: '#7C3AED',
  },
  holdHintText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    color: '#2563EB',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  particleDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  }
});
