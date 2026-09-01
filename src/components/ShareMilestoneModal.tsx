import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { FaithBadge } from '../services/gamificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShareMilestoneModalProps {
  visible: boolean;
  badge: FaithBadge | null;
  userName: string;
  onClose: () => void;
}

export const ShareMilestoneModal: React.FC<ShareMilestoneModalProps> = ({
  visible,
  badge,
  userName,
  onClose
}) => {
  if (!badge) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🕊️ I just unlocked the "${badge.title}" milestone on Bible Chat!\n\n"${badge.subtitle}"\n\nWalk daily with the Apostles: https://biblechatapp.com`,
        title: `Faith Milestone: ${badge.title}`
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Celebration Header */}
          <View style={[styles.badgeIconLarge, { backgroundColor: `${badge.iconColor}15` }]}>
            <Ionicons name={badge.iconName as any} size={42} color={badge.iconColor} />
          </View>

          <Text style={styles.congratsHeading}>Milestone Accomplished!</Text>
          <Text style={styles.badgeName}>{badge.title}</Text>
          <Text style={styles.badgeDescription}>{badge.subtitle}</Text>

          {/* Milestone Certificate Card */}
          <View style={styles.certificateCard}>
            <Text style={styles.certLabel}>FAITH DISCIPLESHIP RECOGNITION</Text>
            <Text style={styles.certUserName}>{userName || 'Beloved Disciple'}</Text>
            <Text style={styles.certDate}>
              Awarded +{badge.xpReward} Grace XP • {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.shareBtnText}>Share Achievement</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Continue Journey</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  badgeIconLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    marginTop: 6,
  },
  congratsHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#7C3AED',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  badgeName: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  badgeDescription: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  certificateCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  certLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  certUserName: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  certDate: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
  shareBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  shareBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  doneBtn: {
    paddingVertical: 8,
  },
  doneBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#6B7280',
  }
});
