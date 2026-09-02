import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';

interface PrivacyOnboardingModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const PrivacyOnboardingModal: React.FC<PrivacyOnboardingModalProps> = ({
  visible,
  onDismiss
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.dialogCard}>
          {/* Sacred Lock Crest */}
          <View style={styles.crestWrap}>
            <Ionicons name="shield-checkmark" size={32} color="#111111" />
          </View>

          <Text style={styles.eyebrow}>YOUR SACRED PRIVACY</Text>
          <Text style={styles.title}>Your Sanctuary is Private & Safe</Text>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Feature 1: Local-First Protection */}
            <View style={styles.featureRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECECEC' }]}>
                <Ionicons name="lock-closed" size={18} color="#111111" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>On-Device Private Storage</Text>
                <Text style={styles.featureBody}>
                  Your personal prayers, reflections, and conversations with the Apostles are stored inside your device’s private memory sandbox. We never harvest or sell your faith data.
                </Text>
              </View>
            </View>

            {/* Feature 2: Immune to Cleaner Apps */}
            <View style={styles.featureRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECECEC' }]}>
                <Ionicons name="shield" size={18} color="#111111" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Immune to Phone Cleaners</Text>
                <Text style={styles.featureBody}>
                  Your database is kept in secure internal storage. Cleaner apps only wipe temporary caches and cannot touch your faith database.
                </Text>
              </View>
            </View>

            {/* Feature 3: Cloud Safeguard & Zero Residual */}
            <View style={styles.featureRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#ECECEC' }]}>
                <Ionicons name="cloud-done" size={18} color="#111111" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Cloud Sync & Total Control</Text>
                <Text style={styles.featureBody}>
                  Your Spiritual Journey, Streaks, and bookmarks are securely synced to your account. If you ever delete your account, all cloud and local records are permanently wiped.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={onDismiss} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Enter Sanctuary</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '82%',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  crestWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  eyebrow: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#8B1E1E',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollBody: {
    width: '100%',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 3,
  },
  featureBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 17,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  }
});
