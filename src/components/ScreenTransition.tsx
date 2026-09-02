import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface ScreenTransitionProps {
  transitionKey: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  transitionKey,
  children,
  style
}) => {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = 0.45;
    translateY.value = 8;
    scale.value = 0.985;

    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic)
    });

    translateY.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic)
    });

    scale.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic)
    });
  }, [transitionKey]);

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
  }
});
