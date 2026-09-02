import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface AnimatedChatBubbleProps {
  isUser: boolean;
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Subtle, serene chat bubble presentation.
 * Preloaded history renders instantly with zero popping.
 * New incoming/outgoing messages fade & glide gently in.
 */
export const AnimatedChatBubble: React.FC<AnimatedChatBubbleProps> = ({
  isUser,
  animate = false,
  style,
  children
}) => {
  const opacity = useSharedValue(animate ? 0 : 1);
  const translateY = useSharedValue(animate ? 4 : 0);
  const scale = useSharedValue(animate ? 0.98 : 1);

  useEffect(() => {
    if (animate) {
      opacity.value = withTiming(1.0, {
        duration: 260,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
      scale.value = withTiming(1.0, {
        duration: 260,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        animatedStyle,
        isUser ? styles.userAnchor : styles.assistantAnchor
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  userAnchor: {
    alignSelf: 'flex-end',
  },
  assistantAnchor: {
    alignSelf: 'flex-start',
  }
});
