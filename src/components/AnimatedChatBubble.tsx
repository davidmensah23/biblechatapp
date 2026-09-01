import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SpringConfigs } from '../theme/animations';

interface AnimatedChatBubbleProps {
  isUser: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const AnimatedChatBubble: React.FC<AnimatedChatBubbleProps> = ({
  isUser,
  style,
  children
}) => {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(isUser ? 6 : 8);

  useEffect(() => {
    scale.value = withSpring(1.0, {
      damping: 13,
      stiffness: 220,
      mass: 0.8
    });
    opacity.value = withTiming(1.0, { duration: 160 });
    translateY.value = withSpring(0, SpringConfigs.bouncy);
  }, []);

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
