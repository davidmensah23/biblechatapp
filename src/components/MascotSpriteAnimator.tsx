import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { MascotAssets } from '../services/mascotAssets';

export type MascotActionType = 'welcome_wave' | 'faith_walk' | 'read_bible' | 'praise';

interface MascotSpriteAnimatorProps {
  action?: MascotActionType;
  size?: number;
  mascot?: keyof typeof MascotAssets;
}

export const MascotSpriteAnimator: React.FC<MascotSpriteAnimatorProps> = ({
  action = 'welcome_wave',
  size = 140,
  mascot = 'group'
}) => {
  // Animation Shared Values
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);
  const waveRotate = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0.2);
  const bibleGlow = useSharedValue(0.4);

  useEffect(() => {
    if (action === 'welcome_wave') {
      // Gentle floating bounce + wave
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      rotateZ.value = withRepeat(
        withSequence(
          withTiming(-2.5, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(2.5, { duration: 1400, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      sparkleOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.2, { duration: 800 })
        ),
        -1,
        true
      );
    } else if (action === 'faith_walk') {
      // Energetic running / walking stride (squash, stretch & stride tilt)
      translateY.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 320, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 320, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      );
      rotateZ.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 320 }),
          withTiming(6, { duration: 320 })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 320 }),
          withTiming(0.96, { duration: 320 })
        ),
        -1,
        true
      );
    } else if (action === 'read_bible') {
      // Peaceful breathing reflection + Holy Spirit Scripture radiance
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      bibleGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    } else if (action === 'praise') {
      // High celebratory jump
      translateY.value = withRepeat(
        withSequence(
          withSpring(-20, { damping: 4, stiffness: 120 }),
          withSpring(0, { damping: 6, stiffness: 120 })
        ),
        -1,
        false
      );
    }
  }, [action]);

  const animatedMascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value }
    ]
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
    transform: [{ scale: withSpring(sparkleOpacity.value * 1.2) }]
  }));

  const animatedBibleGlowStyle = useAnimatedStyle(() => ({
    opacity: bibleGlow.value,
    transform: [{ scale: 1 + bibleGlow.value * 0.15 }]
  }));

  const imageSource = MascotAssets[mascot] || MascotAssets.group;
  const imageWidth = size * (mascot === 'group' ? 1.5 : 1);
  const imageHeight = size;

  return (
    <View style={[styles.container, { width: imageWidth, height: imageHeight }]}>
      {/* Background Radiance for Scripture Reading */}
      {action === 'read_bible' && (
        <Animated.View style={[styles.glowRing, animatedBibleGlowStyle]} />
      )}

      {/* Floating Sparkle Particles for Welcome */}
      {action === 'welcome_wave' && (
        <>
          <Animated.View style={[styles.sparkleTopLeft, animatedSparkleStyle]}>
            <Ionicons name="star" size={16} color="#F59E0B" />
          </Animated.View>
          <Animated.View style={[styles.sparkleTopRight, animatedSparkleStyle]}>
            <Ionicons name="star" size={13} color="#EC4899" />
          </Animated.View>
        </>
      )}

      {/* Animated Mascot Body */}
      <Animated.View style={[styles.mascotWrap, animatedMascotStyle]}>
        <Image
          source={imageSource}
          style={{ width: imageWidth, height: imageHeight, borderRadius: 24 }}
          resizeMode="contain"
        />

        {/* Floating Mini Holy Bible Overlay for Reading Action */}
        {action === 'read_bible' && (
          <View style={styles.bibleBadge}>
            <Ionicons name="book" size={20} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: -8,
    left: 8,
    zIndex: 4,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: -4,
    right: 12,
    zIndex: 4,
  },
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(254, 240, 138, 0.4)',
    zIndex: 0,
  },
  bibleBadge: {
    position: 'absolute',
    bottom: -4,
    right: 8,
    backgroundColor: '#1E40AF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  }
});
