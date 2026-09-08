import { TextStyle, ViewStyle } from 'react-native';

/**
 * BibleChat Design System Tokens
 * 
 * Clean Apple Flat Minimalism meets YouVersion Editorial Scripture
 * Three-Layer Architecture:
 * 1. Primitives: Raw palettes, spacing units, border radii, font families.
 * 2. Semantics: Contextual meanings (surface, text, border, feedback, interactive).
 * 3. Component Tokens: Specific configurations for buttons, cards, badges, navigation.
 */

// ============================================================================
// 1. PRIMITIVES
// ============================================================================

export const PrimitivePalette = {
  // Neutrals (White to Obsidian)
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  backgroundLight: '#F6F6F6',
  gray100: '#F3F4F6',
  cardMuted: '#F0F0F0',
  cardSecondary: '#ECECEC',
  borderLight: '#E5E7EB',
  divider: '#EEEEEE',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  slate700: '#334155',
  zinc800: '#27272A',
  zinc850: '#202023',
  zinc900: '#18181B',
  darkCard: '#171717',
  obsidian: '#0B0B0B',
  black: '#000000',

  // Brand Accents
  crimson: '#E11D48',
  crimsonHover: '#BE123C',
  crimsonSubtle: '#FFF1F2',

  emerald: '#10B981',
  emeraldAlt: '#52C480',
  emeraldSubtle: '#ECFDF5',

  royalBlue: '#2563EB',
  blueSubtle: '#EFF6FF',

  amber: '#F59E0B',
  amberSubtle: '#FFFBEB',

  violet: '#7C3AED',
  violetSubtle: '#F5F3FF',

  coral: '#EA580C',
  coralSubtle: '#FFF7ED',

  // Audio / Voice Glow Accents
  glowMagenta: '#D946EF',
  glowCyan: '#06B6D4',

  // Scrims & Alpha
  scrimLight: 'rgba(0, 0, 0, 0.35)',
  scrimMedium: 'rgba(0, 0, 0, 0.55)',
  scrimHeavy: 'rgba(0, 0, 0, 0.75)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  whiteAlpha20: 'rgba(255, 255, 255, 0.2)',
  whiteAlpha60: 'rgba(255, 255, 255, 0.6)',
  blackAlpha05: 'rgba(0, 0, 0, 0.05)',
  blackAlpha10: 'rgba(0, 0, 0, 0.1)'
} as const;

export const PrimitiveSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96
} as const;

export const PrimitiveRadii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24, // Core signature card & button radius
  hero: 28,
  pill: 9999,
  full: 9999
} as const;

export const PrimitiveFontFamilies = {
  // Sans-serif UI (Poppins)
  sansRegular: 'Poppins_400Regular',
  sansMedium: 'Poppins_500Medium',
  sansSemiBold: 'Poppins_600SemiBold',
  sansBold: 'Poppins_700Bold',

  // Editorial Scripture & Reading Serif (Merriweather)
  serifLight: 'Merriweather_300Light',
  serifRegular: 'Merriweather_400Regular',
  serifBold: 'Merriweather_700Bold',
  serifBlack: 'Merriweather_900Black',
  serifItalic: 'Merriweather_400Regular_Italic',
  serifBoldItalic: 'Merriweather_700Bold_Italic',

  // Monastic Display Serif (Instrument Serif)
  displayRegular: 'InstrumentSerif-Regular',
  displayBold: 'InstrumentSerif-Bold',
  displayItalic: 'InstrumentSerif-Italic'
} as const;

// ============================================================================
// 2. SEMANTIC TOKENS
// ============================================================================

export const SemanticColors = {
  // Light Theme Defaults (Main App Experience)
  light: {
    // Surfaces
    surfaceScreen: PrimitivePalette.backgroundLight,
    surfaceCard: PrimitivePalette.white,
    surfaceCardSecondary: PrimitivePalette.cardSecondary,
    surfaceCardMuted: PrimitivePalette.cardMuted,
    surfacePillNav: PrimitivePalette.obsidian,
    surfaceModal: PrimitivePalette.white,
    surfacePopover: PrimitivePalette.white,
    surfaceScrim: PrimitivePalette.scrimMedium,

    // Text & Content
    textPrimary: '#111827', // Contrast 15.3:1 on white (WCAG AAA)
    textSecondary: '#4B5563', // Contrast 7.2:1 on white (WCAG AAA)
    textMuted: '#6B7280', // Contrast 4.6:1 on white (WCAG AA)
    textSubtle: '#9CA3AF',
    textInverse: PrimitivePalette.white,
    textScripture: '#1F2937',

    // Borders & Dividers
    borderSubtle: PrimitivePalette.divider,
    borderDefault: PrimitivePalette.borderLight,
    borderStrong: PrimitivePalette.gray300,
    borderFocus: PrimitivePalette.royalBlue,

    // Interactive & Accents
    accentPrimary: PrimitivePalette.zinc900,
    accentBrand: PrimitivePalette.royalBlue,
    accentCrimson: PrimitivePalette.crimson,
    accentEmerald: PrimitivePalette.emeraldAlt,
    accentAmber: PrimitivePalette.amber,
    accentViolet: PrimitivePalette.violet,

    // States & Feedback
    successBg: PrimitivePalette.emeraldSubtle,
    successText: '#065F46',
    warningBg: PrimitivePalette.amberSubtle,
    warningText: '#92400E',
    errorBg: PrimitivePalette.crimsonSubtle,
    errorText: '#9F1239',
    infoBg: PrimitivePalette.blueSubtle,
    infoText: '#1E40AF',

    // Chat Bubbles
    userBubbleBg: PrimitivePalette.zinc900,
    userBubbleText: PrimitivePalette.white,
    assistantBubbleBg: '#EFEFEF',
    assistantBubbleText: '#18181B'
  },

  // Dark Theme (Onboarding, Audio Call, Immersive Reading)
  dark: {
    surfaceScreen: PrimitivePalette.obsidian,
    surfaceCard: PrimitivePalette.darkCard,
    surfaceCardSecondary: PrimitivePalette.zinc900,
    surfaceCardMuted: PrimitivePalette.zinc850,
    surfacePillNav: PrimitivePalette.zinc900,
    surfaceModal: PrimitivePalette.zinc900,
    surfacePopover: PrimitivePalette.zinc900,
    surfaceScrim: PrimitivePalette.scrimHeavy,

    textPrimary: PrimitivePalette.white, // Contrast 19.5:1 on obsidian (WCAG AAA)
    textSecondary: '#E5E7EB', // Contrast 13.8:1 on obsidian
    textMuted: '#9CA3AF', // Contrast 5.1:1 on obsidian (WCAG AA)
    textSubtle: '#6B7280',
    textInverse: PrimitivePalette.obsidian,
    textScripture: '#F3F4F6',

    borderSubtle: PrimitivePalette.zinc800,
    borderDefault: PrimitivePalette.whiteAlpha10,
    borderStrong: PrimitivePalette.whiteAlpha20,
    borderFocus: PrimitivePalette.royalBlue,

    accentPrimary: PrimitivePalette.white,
    accentBrand: PrimitivePalette.royalBlue,
    accentCrimson: PrimitivePalette.crimson,
    accentEmerald: PrimitivePalette.emerald,
    accentAmber: PrimitivePalette.amber,
    accentViolet: PrimitivePalette.violet,

    successBg: '#064E3B',
    successText: '#A7F3D0',
    warningBg: '#78350F',
    warningText: '#FDE68A',
    errorBg: '#881337',
    errorText: '#FECDD3',
    infoBg: '#1E3A8A',
    infoText: '#BFDBFE',

    userBubbleBg: PrimitivePalette.white,
    userBubbleText: PrimitivePalette.obsidian,
    assistantBubbleBg: PrimitivePalette.zinc850,
    assistantBubbleText: PrimitivePalette.white
  }
} as const;

// ============================================================================
// 3. TYPOGRAPHY SCALE TOKENS
// ============================================================================

export const TypographyScale = {
  // Monastic Hero & Chapter Displays
  displayLarge: {
    fontFamily: PrimitiveFontFamilies.displayBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5
  } as TextStyle,

  displayMedium: {
    fontFamily: PrimitiveFontFamilies.displayRegular,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3
  } as TextStyle,

  // Modern UI Sans Headings
  heading1: {
    fontFamily: PrimitiveFontFamilies.sansBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2
  } as TextStyle,

  heading2: {
    fontFamily: PrimitiveFontFamilies.sansSemiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.1
  } as TextStyle,

  heading3: {
    fontFamily: PrimitiveFontFamilies.sansSemiBold,
    fontSize: 16,
    lineHeight: 22
  } as TextStyle,

  heading4: {
    fontFamily: PrimitiveFontFamilies.sansMedium,
    fontSize: 14,
    lineHeight: 20
  } as TextStyle,

  // Body Text
  bodyLarge: {
    fontFamily: PrimitiveFontFamilies.sansRegular,
    fontSize: 16,
    lineHeight: 24
  } as TextStyle,

  bodyMedium: {
    fontFamily: PrimitiveFontFamilies.sansRegular,
    fontSize: 14,
    lineHeight: 20
  } as TextStyle,

  bodySmall: {
    fontFamily: PrimitiveFontFamilies.sansRegular,
    fontSize: 12.5,
    lineHeight: 18
  } as TextStyle,

  // Captions & Microcopy
  caption: {
    fontFamily: PrimitiveFontFamilies.sansMedium,
    fontSize: 11,
    lineHeight: 15
  } as TextStyle,

  overline: {
    fontFamily: PrimitiveFontFamilies.sansSemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  } as TextStyle,

  // Editorial Scripture Reading
  scriptureChapterTitle: {
    fontFamily: PrimitiveFontFamilies.displayBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.2
  } as TextStyle,

  scriptureVerse: {
    fontFamily: PrimitiveFontFamilies.serifRegular,
    fontSize: 18,
    lineHeight: 29,
    letterSpacing: 0.1
  } as TextStyle,

  scriptureVerseBold: {
    fontFamily: PrimitiveFontFamilies.serifBold,
    fontSize: 18,
    lineHeight: 29,
    letterSpacing: 0.1
  } as TextStyle,

  scriptureNote: {
    fontFamily: PrimitiveFontFamilies.serifItalic,
    fontSize: 13,
    lineHeight: 18
  } as TextStyle
} as const;

// ============================================================================
// 4. SHADOWS & ELEVATION
// ============================================================================

export const PrimitiveShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  } as ViewStyle,

  // Subtle clean Apple flat card shadow
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  } as ViewStyle,

  // Standard interactive card elevation
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3
  } as ViewStyle,

  // Floating Nav Bar & Modal Sheet elevation
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8
  } as ViewStyle,

  // Audio Call / Glowing Accent
  glow: {
    shadowColor: PrimitivePalette.glowMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6
  } as ViewStyle
} as const;

// ============================================================================
// 5. LAYOUT & TOUCH SYSTEM STANDARDS
// ============================================================================

export const LayoutStandards = {
  // Screen insets
  screenPaddingHorizontal: PrimitiveSpacing[5], // 20pt standard gutter
  screenPaddingTop: PrimitiveSpacing[4],        // 16pt below safe area
  screenGutter: PrimitiveSpacing[4],            // 16pt between cards

  // Clearance for fixed floating chrome
  floatingNavClearance: 96,                    // Space needed at bottom of scrollable views
  headerHeight: 56,                            // Standard screen header height

  // Touch targets (WCAG & Apple Human Interface Guidelines)
  minTouchTarget: 44,                          // Minimum 44x44pt tappable area
  touchHitSlop: { top: 10, bottom: 10, left: 10, right: 10 },

  // Modals & Bottom Sheets
  modalBorderRadius: PrimitiveRadii.xxl,
  modalMaxHeightRatio: 0.88,
  sheetHandleWidth: 40,
  sheetHandleHeight: 4,

  // Interactive motion standards
  activeOpacity: 0.75,
  pressedScale: 0.97
} as const;

// ============================================================================
// CONSOLIDATED MASTER TOKENS EXPORT
// ============================================================================

export const Tokens = {
  palette: PrimitivePalette,
  spacing: PrimitiveSpacing,
  radii: PrimitiveRadii,
  fonts: PrimitiveFontFamilies,
  typography: TypographyScale,
  shadows: PrimitiveShadows,
  colors: SemanticColors,
  layout: LayoutStandards
} as const;

export type ThemeMode = 'light' | 'dark';
