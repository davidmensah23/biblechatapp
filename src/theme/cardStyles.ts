import { ViewStyle } from 'react-native';

export const CardStyles = {
  // Ultra-smooth Continuous G2 Squircle Card (Apple Design Standard)
  smoothCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  } as ViewStyle,

  // Floating Hero / Featured Card (Extra soft diffused glow)
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 6,
  } as ViewStyle,

  // Compact List Item Card
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  } as ViewStyle,

  // Dark Luxury Card for Call / Modals
  darkSmoothCard: {
    backgroundColor: '#171717',
    borderRadius: 30,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,

  // Velvet Obsidian Primary Pill Button
  obsidianPillBtn: {
    backgroundColor: '#18181B',
    borderRadius: 24,
    borderCurve: 'continuous',
    paddingVertical: 13,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Mist Gray Secondary Pill Button
  mistPillBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    borderCurve: 'continuous',
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
};
