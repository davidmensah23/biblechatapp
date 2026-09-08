import React from 'react';
import { View, Pressable, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Tokens, SpringConfigs, PrimitivePalette } from '../../theme';

export type DSCardVariant = 'smooth' | 'hero' | 'compact' | 'dark' | 'subtle';

export interface DSCardProps {
  variant?: DSCardVariant;
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  padding?: number;
  elevated?: boolean;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DSCard: React.FC<DSCardProps> = ({
  variant = 'smooth',
  onPress,
  disabled = false,
  haptic = true,
  padding,
  elevated = false,
  style,
  children
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    scale.value = withSpring(0.98, SpringConfigs.snappy);
    if (haptic) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handlePressOut = () => {
    if (!onPress) return;
    scale.value = withSpring(1, SpringConfigs.snappy);
  };

  const getBaseStyle = (): ViewStyle => {
    const isDark = variant === 'dark';

    const base: ViewStyle = {
      borderRadius: variant === 'hero' ? Tokens.radii.hero : (variant === 'compact' ? Tokens.radii.xl : Tokens.radii.xxl),
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: isDark ? PrimitivePalette.whiteAlpha10 : PrimitivePalette.borderLight,
      backgroundColor: isDark
        ? PrimitivePalette.darkCard
        : variant === 'subtle'
        ? PrimitivePalette.gray50
        : PrimitivePalette.white,
      padding: padding !== undefined
        ? padding
        : variant === 'hero'
        ? Tokens.spacing[5]
        : variant === 'compact'
        ? Tokens.spacing[3]
        : Tokens.spacing[4]
    };

    if (elevated && !isDark) {
      Object.assign(base, Tokens.shadows.sm);
    }

    return base;
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        style={[getBaseStyle(), animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[getBaseStyle(), style]}>{children}</View>;
};
