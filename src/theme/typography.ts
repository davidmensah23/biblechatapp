import { PrimitiveFontFamilies, TypographyScale } from './tokens';

/**
 * BibleChat Typography
 * Backward-compatible typography object mapped to Design System Tokens.
 */
export const Typography = {
  // Screen-Optimized Scripture & Chat Serif (Merriweather)
  fontYouVersionSerif: PrimitiveFontFamilies.serifRegular,
  fontYouVersionSerifBold: PrimitiveFontFamilies.serifBold,
  fontYouVersionSerifItalic: PrimitiveFontFamilies.serifItalic,

  // Editorial Scripture Reading Serif (Merriweather)
  fontSerif: PrimitiveFontFamilies.serifBold,
  fontSerifBold: PrimitiveFontFamilies.serifBold,
  fontSerifMedium: PrimitiveFontFamilies.serifRegular,
  fontSerifRegular: PrimitiveFontFamilies.serifRegular,
  fontSerifItalic: PrimitiveFontFamilies.serifItalic,

  // Monastic Display Serif (Instrument Serif)
  fontDisplaySerif: PrimitiveFontFamilies.displayBold,
  fontDisplaySerifRegular: PrimitiveFontFamilies.displayRegular,
  fontDisplaySerifItalic: PrimitiveFontFamilies.displayItalic,

  // Modern UI Sans (Poppins)
  fontSansRegular: PrimitiveFontFamilies.sansRegular,
  fontSansMedium: PrimitiveFontFamilies.sansMedium,
  fontSansSemiBold: PrimitiveFontFamilies.sansSemiBold,
  fontSansBold: PrimitiveFontFamilies.sansBold,

  // Fallbacks
  fallbackSerif: 'Georgia, serif',
  fallbackSans: 'System, sans-serif',

  // Typography Scales & Families Re-exports
  families: PrimitiveFontFamilies,
  scale: TypographyScale
};

export { PrimitiveFontFamilies, TypographyScale };
