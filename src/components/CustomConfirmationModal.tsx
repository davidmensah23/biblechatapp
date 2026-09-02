import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';

export interface CustomConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'default' | 'destructive' | 'accent';
  icon?: keyof typeof Ionicons.glyphMap;
  singleButton?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

export const CustomConfirmationModal: React.FC<CustomConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'default',
  icon = 'information-circle-outline',
  singleButton = false,
  onConfirm,
  onCancel,
  onClose
}) => {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 22, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    } else {
      scale.value = 0.92;
      opacity.value = 0;
    }
  }, [visible]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  if (!visible) return null;

  const isDestructive = confirmStyle === 'destructive';

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, animatedCardStyle]}>
              {/* Top Icon Emblem */}
              <View style={[styles.iconCircle, isDestructive && styles.iconCircleDestructive]}>
                <Ionicons
                  name={icon}
                  size={28}
                  color={isDestructive ? '#DC2626' : '#111111'}
                />
              </View>

              {/* Title & Description */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                {!singleButton && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      if (onCancel) onCancel();
                      onClose();
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.cancelBtnText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    isDestructive && styles.confirmBtnDestructive,
                    singleButton && styles.singleBtn
                  ]}
                  onPress={() => {
                    onConfirm();
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F3F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleDestructive: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontFamily: Typography.fontSansBold,
    fontSize: 19,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCF3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#111111',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDestructive: {
    backgroundColor: '#DC2626',
  },
  singleBtn: {
    flex: 1,
    width: '100%',
  },
  confirmBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  }
});
