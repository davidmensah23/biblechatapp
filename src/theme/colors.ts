import { PrimitivePalette, SemanticColors } from './tokens';

/**
 * BibleChat Colors
 * Backward-compatible colors object mapped to Design System Tokens.
 */
export const Colors = {
  // Main Light Theme (Figma Match)
  background: PrimitivePalette.backgroundLight,
  card: PrimitivePalette.white,
  cardSecondary: PrimitivePalette.cardSecondary,
  cardMuted: PrimitivePalette.cardMuted,
  pillNav: PrimitivePalette.obsidian,
  pillNavIconInactive: '#888888',
  pillNavIconActive: PrimitivePalette.white,
  textPrimary: '#111111',
  textSecondary: '#444444',
  textMuted: '#777777',
  textLight: '#999999',
  border: '#E2E2E2',
  divider: PrimitivePalette.divider,
  
  // Accents
  accentRed: PrimitivePalette.crimson,        // Active tab line indicator
  accentGreen: PrimitivePalette.emeraldAlt,   // Save changes button
  accentBlue: PrimitivePalette.royalBlue,     // Onboarding CTA button
  accentOrange: PrimitivePalette.coral,
  accentAmber: PrimitivePalette.amber,
  accentViolet: PrimitivePalette.violet,
  
  // Onboarding Dark Theme (Figma Match)
  darkBackground: PrimitivePalette.obsidian,
  darkCard: PrimitivePalette.darkCard,
  darkCardBorder: '#262626',
  darkTextPrimary: PrimitivePalette.white,
  darkTextSecondary: '#CCCCCC',
  darkTextMuted: '#888888',
  
  // Interactive
  heartActive: PrimitivePalette.crimson,
  heartInactive: '#222222',
  userBubble: PrimitivePalette.zinc900,
  userBubbleText: PrimitivePalette.white,
  assistantBubble: '#EFEFEF',
  assistantBubbleText: '#18181B',
  
  // Voice call modal
  callCardBg: '#09090B',
  callGlowMagenta: PrimitivePalette.glowMagenta,
  callGlowCyan: PrimitivePalette.glowCyan,

  // Palette Re-exports
  palette: PrimitivePalette,
  semantic: SemanticColors
};

export { PrimitivePalette, SemanticColors };
