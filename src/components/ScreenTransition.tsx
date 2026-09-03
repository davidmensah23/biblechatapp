import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';

export type TransitionType = 'tab' | 'push' | 'modal';

interface ScreenTransitionProps {
  transitionKey: string;
  type?: TransitionType;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  transitionKey,
  type = 'tab',
  children,
  style
}) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (type === 'push') {
      // Fluid page push transition (sliding up from bottom with spring physics)
      opacity.value = 0;
      translateY.value = 36;
      scale.value = 0.97;

      opacity.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic)
      });

      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 150,
        mass: 0.8
      });

      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 150,
        mass: 0.8
      });
    } else {
      // Smooth subtle tab cross-fade with micro-glide
      opacity.value = 0.55;
      translateY.value = 6;
      scale.value = 0.99;

      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic)
      });

      translateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic)
      });

      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic)
      });
    }
  }, [transitionKey, type]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ]
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
