import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';

export interface ActionMenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isDestructive?: boolean;
}

export interface CustomActionMenuModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: ActionMenuItem[];
  cancelText?: string;
  onClose: () => void;
}

export const CustomActionMenuModal: React.FC<CustomActionMenuModalProps> = ({
  visible,
  title,
  subtitle,
  options,
  cancelText = 'Cancel',
  onClose
}) => {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
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

  const handleSelect = (action: () => void) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onClose();
    setTimeout(() => {
      action();
    }, 100);
  };

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, animatedCardStyle]}>
              
              {/* Header Icon Pill */}
              <View style={styles.iconCircle}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#111111" />
              </View>

              {/* Title & Optional Subtitle Preview */}
              <Text style={styles.title}>{title}</Text>
              {Boolean(subtitle) && (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              )}

              {/* Action Rows */}
              <View style={styles.optionsList}>
                {options.map((item, idx) => {
                  const isDestructive = item.isDestructive;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.optionRow, isDestructive && styles.optionRowDestructive]}
                      onPress={() => handleSelect(item.onPress)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.iconWrap, isDestructive && styles.iconWrapDestructive]}>
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={isDestructive ? '#DC2626' : '#111111'}
                        />
                      </View>
                      
                      <Text style={[styles.optionText, isDestructive && styles.optionTextDestructive]}>
                        {item.label}
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={isDestructive ? '#FCA5A5' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>

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
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: Typography.fontSansBold,
    fontSize: 19,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  optionsList: {
    width: '100%',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  optionRowDestructive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconWrapDestructive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  optionText: {
    flex: 1,
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#1F2937',
  },
  optionTextDestructive: {
    color: '#DC2626',
  },
  cancelBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#374151',
  }
});
