import { ViewStyle } from 'react-native';

export const CardStyles = {
  // Ultra-smooth Flat Card (Clean Apple / YouVersion Editorial Standard)
  smoothCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  // Floating Hero / Featured Card (Clean Flat)
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  // Compact List Item Card (Clean Flat)
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  // Dark Luxury Card for Call / Modals (Clean Flat)
  darkSmoothCard: {
    backgroundColor: '#171717',
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
