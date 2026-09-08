import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tokens, PrimitivePalette } from '../../theme';

export interface DSScreenProps {
  scrollable?: boolean;
  hasFloatingNav?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  backgroundColor?: string;
  header?: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const DSScreen: React.FC<DSScreenProps> = ({
  scrollable = true,
  hasFloatingNav = true,
  statusBarStyle = 'dark-content',
  backgroundColor = PrimitivePalette.backgroundLight,
  header,
  contentContainerStyle,
  style,
  children
}) => {
  const insets = useSafeAreaInsets();

  const bottomInset = insets.bottom > 0 ? insets.bottom : Tokens.spacing[4];
  const calculatedBottomPadding = hasFloatingNav
    ? Tokens.layout.floatingNavClearance
    : bottomInset;

  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: Tokens.layout.screenPaddingHorizontal,
          paddingBottom: calculatedBottomPadding
        },
        contentContainerStyle
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.staticContent,
        {
          paddingHorizontal: Tokens.layout.screenPaddingHorizontal,
          paddingBottom: calculatedBottomPadding
        },
        contentContainerStyle
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
      />
      {header}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    paddingTop: Tokens.spacing[4],
    flexGrow: 1
  },
  staticContent: {
    flex: 1,
    paddingTop: Tokens.spacing[4]
  }
});
