import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';
import { Tokens, TypographyScale, SemanticColors, ThemeMode } from '../../theme';

export type DSTextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'scripture'
  | 'scriptureBold'
  | 'scriptureTitle'
  | 'scriptureNote';

export type DSTextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'subtle'
  | 'inverse'
  | 'brand'
  | 'crimson'
  | 'emerald'
  | 'amber'
  | 'scripture'
  | string;

export interface DSTextProps extends TextProps {
  variant?: DSTextVariant;
  color?: DSTextColor;
  align?: 'left' | 'center' | 'right';
  theme?: ThemeMode;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

const variantStyleMap: Record<DSTextVariant, TextStyle> = {
  displayLarge: TypographyScale.displayLarge,
  displayMedium: TypographyScale.displayMedium,
  h1: TypographyScale.heading1,
  h2: TypographyScale.heading2,
  h3: TypographyScale.heading3,
  h4: TypographyScale.heading4,
  bodyLarge: TypographyScale.bodyLarge,
  body: TypographyScale.bodyMedium,
  bodySmall: TypographyScale.bodySmall,
  caption: TypographyScale.caption,
  overline: TypographyScale.overline,
  scripture: TypographyScale.scriptureVerse,
  scriptureBold: TypographyScale.scriptureVerseBold,
  scriptureTitle: TypographyScale.scriptureChapterTitle,
  scriptureNote: TypographyScale.scriptureNote
};

export const DSText: React.FC<DSTextProps> = ({
  variant = 'body',
  color = 'primary',
  align,
  theme = 'light',
  style,
  children,
  ...rest
}) => {
  const currentTheme = SemanticColors[theme];

  const resolveColor = (): string => {
    switch (color) {
      case 'primary':
        return currentTheme.textPrimary;
      case 'secondary':
        return currentTheme.textSecondary;
      case 'muted':
        return currentTheme.textMuted;
      case 'subtle':
        return currentTheme.textSubtle;
      case 'inverse':
        return currentTheme.textInverse;
      case 'brand':
        return currentTheme.accentBrand;
      case 'crimson':
        return currentTheme.accentCrimson;
      case 'emerald':
        return currentTheme.accentEmerald;
      case 'amber':
        return currentTheme.accentAmber;
      case 'scripture':
        return currentTheme.textScripture;
      default:
        return color;
    }
  };

  const resolvedStyle: TextStyle = {
    ...variantStyleMap[variant],
    color: resolveColor(),
    ...(align ? { textAlign: align } : {})
  };

  return (
    <Text style={[resolvedStyle, style]} {...rest}>
      {children}
    </Text>
  );
};
