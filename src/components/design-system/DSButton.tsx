import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Tokens, SpringConfigs, PrimitivePalette } from '../../theme';

export type DSButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'crimson'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type DSButtonSize = 'sm' | 'md' | 'lg';

export interface DSButtonProps {
  label?: string;
  variant?: DSButtonVariant;
  size?: DSButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  children?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DSButton: React.FC<DSButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = true,
  accessibilityLabel,
  style,
  labelStyle,
  children
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.97, SpringConfigs.snappy);
    if (haptic) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringConfigs.snappy);
  };

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Tokens.radii.xxl,
      borderCurve: 'continuous',
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      opacity: disabled ? 0.5 : 1
    };

    // Size variations
    if (size === 'sm') {
      base.height = 36;
      base.paddingHorizontal = Tokens.spacing[3];
      base.borderRadius = Tokens.radii.xl;
    } else if (size === 'lg') {
      base.height = 56;
      base.paddingHorizontal = Tokens.spacing[6];
      base.borderRadius = Tokens.radii.xxl;
    } else {
      // md
      base.height = 48;
      base.paddingHorizontal = Tokens.spacing[5];
      base.borderRadius = Tokens.radii.xxl;
    }

    // Variant variations
    switch (variant) {
      case 'primary':
        base.backgroundColor = PrimitivePalette.zinc900;
        break;
      case 'secondary':
        base.backgroundColor = PrimitivePalette.gray100;
        break;
      case 'accent':
        base.backgroundColor = PrimitivePalette.royalBlue;
        break;
      case 'crimson':
        base.backgroundColor = PrimitivePalette.crimson;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1;
        base.borderColor = PrimitivePalette.borderLight;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'destructive':
        base.backgroundColor = PrimitivePalette.crimsonSubtle;
        break;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontFamily: Tokens.fonts.sansSemiBold,
      textAlign: 'center'
    };

    if (size === 'sm') {
      base.fontSize = 12.5;
      base.lineHeight = 16;
    } else if (size === 'lg') {
      base.fontSize = 16;
      base.lineHeight = 22;
    } else {
      base.fontSize = 14.5;
      base.lineHeight = 20;
    }

    switch (variant) {
      case 'primary':
      case 'accent':
      case 'crimson':
        base.color = PrimitivePalette.white;
        break;
      case 'secondary':
      case 'outline':
      case 'ghost':
        base.color = PrimitivePalette.zinc900;
        break;
      case 'destructive':
        base.color = PrimitivePalette.crimson;
        break;
    }

    return base;
  };

  const spinnerColor = ['primary', 'accent', 'crimson'].includes(variant)
    ? PrimitivePalette.white
    : PrimitivePalette.zinc900;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      hitSlop={Tokens.layout.touchHitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: disabled || loading }}
      style={[getContainerStyle(), animatedStyle, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          {label ? (
            <Text style={[getTextStyle(), labelStyle]}>{label}</Text>
          ) : (
            children
          )}
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  leftIconContainer: {
    marginRight: Tokens.spacing[2]
  },
  rightIconContainer: {
    marginLeft: Tokens.spacing[2]
  }
});
