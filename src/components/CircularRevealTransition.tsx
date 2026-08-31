import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_RADIUS = Math.sqrt(SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT) * 1.5;

interface CircularRevealTransitionProps {
  originX?: number;
  originY?: number;
  onFinished: () => void;
  children?: React.ReactNode;
}

export const CircularRevealTransition: React.FC<CircularRevealTransitionProps> = ({
  originX = SCREEN_WIDTH * 0.8,
  originY = SCREEN_HEIGHT * 0.9,
  onFinished,
  children
}) => {
  const scale = useSharedValue(0.01);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(
      1,
      {
        duration: 550,
        easing: Easing.bezier(0.2, 0.9, 0.3, 1)
      },
      (finished) => {
        if (finished) {
          runOnJS(onFinished)();
        }
      }
    );
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
      opacity: opacity.value
    };
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Expanding White Elliptical Portal */}
      <Animated.View style={circleAnimatedStyle} />
      {children}
    </View>
  );
};
