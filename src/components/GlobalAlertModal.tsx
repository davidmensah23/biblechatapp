import React, { useEffect, useState } from 'react';
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
import {
  AlertPayload,
  AlertButtonConfig,
  setGlobalAlertListener,
  dismissGlobalAlert
} from '../services/alertService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GlobalAlertModal: React.FC = () => {
  const [alertData, setAlertData] = useState<AlertPayload>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setGlobalAlertListener((payload) => {
      setAlertData(payload);
      if (payload.visible) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
        scale.value = withSpring(1, { damping: 22, stiffness: 300 });
        opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      } else {
        scale.value = 0.92;
        opacity.value = 0;
      }
    });

    return () => {
      setGlobalAlertListener(null);
    };
  }, []);

  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.92, { duration: 150 });
    setTimeout(() => {
      dismissGlobalAlert();
      if (alertData.options?.onDismiss) {
        alertData.options.onDismiss();
      }
    }, 150);
  };

  const handleButtonPress = (btn: AlertButtonConfig) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.92, { duration: 150 });
    setTimeout(() => {
      dismissGlobalAlert();
      if (btn.onPress) {
        btn.onPress();
      }
    }, 150);
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  if (!alertData.visible) return null;

  // Auto-detect icon based on title/message context if not explicitly provided
  const getAutoIcon = (): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    if (alertData.icon) {
      return { name: alertData.icon as any, color: '#111111', bg: '#F3F4F6' };
    }
    const lower = `${alertData.title} ${alertData.message || ''}`.toLowerCase();

    if (lower.includes('offline ready') || lower.includes('downloaded') || lower.includes('verified') || lower.includes('success') || lower.includes('saved')) {
      return { name: 'checkmark-circle', color: '#059669', bg: '#D1FAE5' };
    }
    if (lower.includes('download') || lower.includes('cloud')) {
      return { name: 'cloud-download-outline', color: '#2563EB', bg: '#DBEAFE' };
    }
    if (lower.includes('error') || lower.includes('failed') || lower.includes('invalid') || lower.includes('denied')) {
      return { name: 'alert-circle', color: '#DC2626', bg: '#FEE2E2' };
    }
    if (lower.includes('warning') || lower.includes('required') || lower.includes('length') || lower.includes('mismatch')) {
      return { name: 'warning-outline', color: '#D97706', bg: '#FEF3C7' };
    }
    if (lower.includes('options') || lower.includes('menu')) {
      return { name: 'ellipsis-horizontal', color: '#111111', bg: '#F3F4F6' };
    }
    return { name: 'information-circle-outline', color: '#111111', bg: '#F3F4F6' };
  };

  const iconInfo = getAutoIcon();
  const isMultiOption = alertData.buttons.length > 2;

  // Split cancel button from action buttons in multi-option mode
  const cancelBtn = alertData.buttons.find(b => b.style === 'cancel');
  const actionButtons = isMultiOption
    ? alertData.buttons.filter(b => b.style !== 'cancel')
    : alertData.buttons;

  // Get action icon for each multi-option row
  const getActionIcon = (text: string, isDestructive: boolean): keyof typeof Ionicons.glyphMap => {
    const t = text.toLowerCase();
    if (t.includes('share')) return 'share-social-outline';
    if (t.includes('report')) return 'flag-outline';
    if (t.includes('hide')) return 'eye-off-outline';
    if (t.includes('delete') || t.includes('remove')) return 'trash-outline';
    if (t.includes('edit')) return 'create-outline';
    if (t.includes('copy')) return 'copy-outline';
    if (isDestructive) return 'alert-circle-outline';
    return 'arrow-forward-outline';
  };

  return (
    <Modal visible={alertData.visible} animationType="none" transparent={true} onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, isMultiOption && styles.cardMultiOption, animatedCardStyle]}>
              
              {/* Top Icon Badge */}
              <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
                <Ionicons name={iconInfo.name} size={28} color={iconInfo.color} />
              </View>

              {/* Title */}
              {Boolean(alertData.title) && (
                <Text style={styles.title}>{alertData.title}</Text>
              )}

              {/* Message / Description */}
              {Boolean(alertData.message) && (
                <Text style={styles.message}>{alertData.message}</Text>
              )}

              {/* ============================================================= */}
              {/* MULTI-OPTION ACTION SHEET MODE (e.g. 3+ Options like Community) */}
              {/* ============================================================= */}
              {isMultiOption ? (
                <View style={styles.multiOptionContainer}>
                  {actionButtons.map((btn, idx) => {
                    const isDestructive = btn.style === 'destructive';
                    const btnIcon = btn.icon ? (btn.icon as any) : getActionIcon(btn.text || '', isDestructive);

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.actionRow, isDestructive && styles.actionRowDestructive]}
                        onPress={() => handleButtonPress(btn)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.actionIconWrap, isDestructive && styles.actionIconWrapDestructive]}>
                          <Ionicons
                            name={btnIcon}
                            size={18}
                            color={isDestructive ? '#DC2626' : '#111111'}
                          />
                        </View>
                        <Text style={[styles.actionRowText, isDestructive && styles.actionRowTextDestructive]}>
                          {btn.text}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={isDestructive ? '#FCA5A5' : '#9CA3AF'}
                        />
                      </TouchableOpacity>
                    );
                  })}

                  {/* Cancel Button Row */}
                  <TouchableOpacity
                    style={styles.cancelActionBtn}
                    onPress={() => (cancelBtn ? handleButtonPress(cancelBtn) : handleClose())}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelActionBtnText}>
                      {cancelBtn?.text || 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ============================================================= */
                /* STANDARD 1 OR 2 BUTTON ALERT MODE                            */
                /* ============================================================= */
                <View style={styles.buttonRow}>
                  {alertData.buttons.length === 2 && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleButtonPress(alertData.buttons[0])}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.cancelBtnText}>
                        {alertData.buttons[0].text || 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      alertData.buttons.length === 1 && styles.singleBtn,
                      (alertData.buttons[alertData.buttons.length - 1]?.style === 'destructive') && styles.confirmBtnDestructive
                    ]}
                    onPress={() => handleButtonPress(alertData.buttons[alertData.buttons.length - 1])}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.confirmBtnText}>
                      {alertData.buttons[alertData.buttons.length - 1]?.text || 'OK'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

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
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  cardMultiOption: {
    maxWidth: 360,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    color: '#4B5563',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#374151',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
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
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  // Multi-option Action Sheet styles
  multiOptionContainer: {
    width: '100%',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionRowDestructive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIconWrapDestructive: {
    backgroundColor: '#FEE2E2',
  },
  actionRowText: {
    flex: 1,
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#1F2937',
  },
  actionRowTextDestructive: {
    color: '#DC2626',
  },
  cancelActionBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  cancelActionBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14.5,
    color: '#4B5563',
  }
});
