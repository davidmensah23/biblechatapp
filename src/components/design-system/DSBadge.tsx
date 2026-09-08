import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Tokens, PrimitivePalette } from '../../theme';

export type DSBadgeVariant = 'soft' | 'solid' | 'outline';
export type DSBadgeColor = 'neutral' | 'brand' | 'success' | 'warning' | 'crimson' | 'gold' | 'violet';
export type DSBadgeSize = 'sm' | 'md' | 'lg';

export interface DSBadgeProps {
  label: string;
  variant?: DSBadgeVariant;
  color?: DSBadgeColor;
  size?: DSBadgeSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const DSBadge: React.FC<DSBadgeProps> = ({
  label,
  variant = 'soft',
  color = 'neutral',
  size = 'md',
  leftIcon,
  rightIcon,
  style,
  textStyle
}) => {
  const getColorTokens = () => {
    switch (color) {
      case 'brand':
        return {
          main: PrimitivePalette.royalBlue,
          subtle: PrimitivePalette.blueSubtle,
          text: '#1E40AF'
        };
      case 'success':
        return {
          main: PrimitivePalette.emerald,
          subtle: PrimitivePalette.emeraldSubtle,
          text: '#065F46'
        };
      case 'warning':
      case 'gold':
        return {
          main: PrimitivePalette.amber,
          subtle: PrimitivePalette.amberSubtle,
          text: '#92400E'
        };
      case 'crimson':
        return {
          main: PrimitivePalette.crimson,
          subtle: PrimitivePalette.crimsonSubtle,
          text: '#9F1239'
        };
      case 'violet':
        return {
          main: PrimitivePalette.violet,
          subtle: PrimitivePalette.violetSubtle,
          text: '#5B21B6'
        };
      case 'neutral':
      default:
        return {
          main: PrimitivePalette.zinc800,
          subtle: PrimitivePalette.gray100,
          text: PrimitivePalette.zinc800
        };
    }
  };

  const palette = getColorTokens();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Tokens.radii.pill,
      borderCurve: 'continuous',
      alignSelf: 'flex-start'
    };

    if (size === 'sm') {
      base.height = 20;
      base.paddingHorizontal = 7;
    } else if (size === 'lg') {
      base.height = 28;
      base.paddingHorizontal = 12;
    } else {
      base.height = 24;
      base.paddingHorizontal = 9;
    }

    if (variant === 'solid') {
      base.backgroundColor = palette.main;
    } else if (variant === 'outline') {
      base.backgroundColor = 'transparent';
      base.borderWidth = 1;
      base.borderColor = palette.main;
    } else {
      // soft
      base.backgroundColor = palette.subtle;
    }

    return base;
  };

  const getLabelStyle = (): TextStyle => {
    const base: TextStyle = {
      fontFamily: Tokens.fonts.sansSemiBold,
      textAlign: 'center'
    };

    if (size === 'sm') {
      base.fontSize = 10;
      base.lineHeight = 13;
    } else if (size === 'lg') {
      base.fontSize = 12.5;
      base.lineHeight = 16;
    } else {
      base.fontSize = 11;
      base.lineHeight = 14;
    }

    if (variant === 'solid') {
      base.color = PrimitivePalette.white;
    } else if (variant === 'outline') {
      base.color = palette.main;
    } else {
      base.color = palette.text;
    }

    return base;
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text style={[getLabelStyle(), textStyle]}>{label}</Text>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    marginRight: 4
  },
  rightIcon: {
    marginLeft: 4
  }
});
