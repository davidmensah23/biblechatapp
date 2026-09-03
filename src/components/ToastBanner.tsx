import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';

interface ToastBannerProps {
  visible: boolean;
  message: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onDismiss: () => void;
  duration?: number;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({
  visible,
  message,
  iconName = 'checkmark-circle',
  onDismiss,
  duration = 2800
}) => {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 180 });

      const timer = setTimeout(() => {
        translateY.value = withTiming(-80, { duration: 220 });
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(onDismiss, 240);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-80, { duration: 180 });
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.contentPill}>
        <Ionicons name={iconName} size={18} color="#059669" style={styles.icon} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  contentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: '96%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
    flexShrink: 1,
    lineHeight: 18,
  },
});
