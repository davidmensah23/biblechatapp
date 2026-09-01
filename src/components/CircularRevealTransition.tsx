import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
  interpolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_RADIUS = Math.sqrt(SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT) * 1.6;

interface CircularRevealTransitionProps {
  originX?: number;
  originY?: number;
  onFinished: () => void;
  children?: React.ReactNode;
}

/**
 * Cinematic Eclipse / Circular Portal Transition
 * Expands organically from the exact tap coordinates (Get Started / Skip) to reveal the Auth Screen.
 */
export const CircularRevealTransition: React.FC<CircularRevealTransitionProps> = ({
  originX = SCREEN_WIDTH * 0.8,
  originY = SCREEN_HEIGHT * 0.9,
  onFinished,
  children
}) => {
  const scale = useSharedValue(0.005);
  const ringScale = useSharedValue(0.005);
  const ringOpacity = useSharedValue(0.85);

  useEffect(() => {
    // 1. Primary White Expanding Eclipse Portal (950ms cinematic curve)
    scale.value = withTiming(
      1,
      {
        duration: 950,
        easing: Easing.bezier(0.16, 1, 0.3, 1) // Smooth organic exponential acceleration & decelerated settle
      },
      (finished) => {
        if (finished) {
          runOnJS(onFinished)();
        }
      }
    );

    // 2. Radiant Luminous Blue-Cyan Shockwave Ring preceding the portal
    ringScale.value = withTiming(1.08, {
      duration: 950,
      easing: Easing.bezier(0.16, 1, 0.3, 1)
    });

    ringOpacity.value = withTiming(0, {
      duration: 950,
      easing: Easing.bezier(0.4, 0, 0.2, 1)
    });
  }, []);

  const circleAnimatedStyle = useAnimatedStyle(() => {
    const size = MAX_RADIUS * 2 * scale.value;
    return {
      position: 'absolute',
      left: originX - size / 2,
      top: originY - size / 2,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#FFFFFF',
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 25,
      elevation: 20
    };
  });

  const ringAnimatedStyle = useAnimatedStyle(() => {
    const ringSize = MAX_RADIUS * 2 * ringScale.value;
    return {
      position: 'absolute',
      left: originX - ringSize / 2,
      top: originY - ringSize / 2,
      width: ringSize,
      height: ringSize,
      borderRadius: ringSize / 2,
      borderWidth: 4,
      borderColor: '#38BDF8',
      opacity: ringOpacity.value
    };
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Radiant Shockwave Edge Ring */}
      <Animated.View style={ringAnimatedStyle} />

      {/* Main Expanding White Eclipse Portal */}
      <Animated.View style={circleAnimatedStyle} />

      {children}
    </View>
  );
};
