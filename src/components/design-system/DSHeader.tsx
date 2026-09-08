import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Tokens, PrimitivePalette } from '../../theme';

export interface DSHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  editorial?: boolean; // uses InstrumentSerif monastic font for scripture context
  style?: ViewStyle;
}

export const DSHeader: React.FC<DSHeaderProps> = ({
  title,
  subtitle,
  onBack,
  leftElement,
  rightElement,
  transparent = false,
  editorial = false,
  style
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top + 4 : Tokens.spacing[3],
          backgroundColor: transparent ? 'transparent' : PrimitivePalette.white,
          borderBottomColor: transparent ? 'transparent' : PrimitivePalette.borderLight,
          borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth
        },
        style
      ]}
    >
      <View style={styles.contentRow}>
        {/* Left Action / Back button */}
        <View style={styles.leftContainer}>
          {leftElement ? (
            leftElement
          ) : onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={Tokens.layout.touchHitSlop}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={PrimitivePalette.zinc900} />
            </Pressable>
          ) : null}
        </View>

        {/* Center Title & Subtitle */}
        <View style={styles.centerContainer}>
          {title && (
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                editorial && styles.editorialTitle
              ]}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightContainer}>
          {rightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Tokens.layout.screenPaddingHorizontal,
    paddingBottom: Tokens.spacing[3],
    zIndex: 10
  },
  contentRow: {
    height: Tokens.layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftContainer: {
    minWidth: 40,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Tokens.spacing[2]
  },
  title: {
    fontFamily: Tokens.fonts.sansSemiBold,
    fontSize: 16.5,
    lineHeight: 22,
    color: PrimitivePalette.zinc900,
    textAlign: 'center'
  },
  editorialTitle: {
    fontFamily: Tokens.fonts.displayBold,
    fontSize: 20,
    lineHeight: 24
  },
  subtitle: {
    fontFamily: Tokens.fonts.sansRegular,
    fontSize: 11.5,
    lineHeight: 15,
    color: PrimitivePalette.gray500,
    textAlign: 'center',
    marginTop: 1
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center'
  }
});
