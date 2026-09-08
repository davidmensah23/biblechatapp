import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  ViewStyle,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Tokens, PrimitivePalette } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface DSModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  maxHeightRatio?: number;
  containerStyle?: ViewStyle;
  children: React.ReactNode;
}

export const DSModal: React.FC<DSModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  showHandle = true,
  showCloseButton = true,
  maxHeightRatio = Tokens.layout.modalMaxHeightRatio,
  containerStyle,
  children
}) => {
  const insets = useSafeAreaInsets();

  const maxAllowedHeight = SCREEN_HEIGHT * maxHeightRatio;
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 8 : Tokens.spacing[5];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropDismissArea} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheetContainer,
            {
              maxHeight: maxAllowedHeight,
              paddingBottom: bottomPadding
            },
            containerStyle
          ]}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={styles.handleBar} />
            </View>
          )}

          {(title || showCloseButton) && (
            <View style={styles.headerRow}>
              <View style={styles.headerTextContainer}>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>

              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  hitSlop={Tokens.layout.touchHitSlop}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                  style={styles.closeButton}
                >
                  <X size={18} color={PrimitivePalette.gray500} />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Tokens.palette.scrimMedium,
    justifyContent: 'flex-end'
  },
  backdropDismissArea: {
    flex: 1
  },
  sheetContainer: {
    backgroundColor: PrimitivePalette.white,
    borderTopLeftRadius: Tokens.radii.hero,
    borderTopRightRadius: Tokens.radii.hero,
    borderCurve: 'continuous',
    paddingHorizontal: Tokens.layout.screenPaddingHorizontal,
    borderTopWidth: 1,
    borderTopColor: PrimitivePalette.borderLight,
    ...Tokens.shadows.lg
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Tokens.spacing[2]
  },
  handleBar: {
    width: Tokens.layout.sheetHandleWidth,
    height: Tokens.layout.sheetHandleHeight,
    borderRadius: Tokens.radii.pill,
    backgroundColor: PrimitivePalette.gray300
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Tokens.spacing[2],
    paddingBottom: Tokens.spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PrimitivePalette.borderLight
  },
  headerTextContainer: {
    flex: 1,
    marginRight: Tokens.spacing[2]
  },
  title: {
    fontFamily: Tokens.fonts.sansBold,
    fontSize: 18,
    lineHeight: 24,
    color: PrimitivePalette.zinc900
  },
  subtitle: {
    fontFamily: Tokens.fonts.sansRegular,
    fontSize: 12.5,
    lineHeight: 16,
    color: PrimitivePalette.gray500,
    marginTop: 2
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PrimitivePalette.gray100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    paddingTop: Tokens.spacing[4]
  }
});
