import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Share,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { CardStyles } from '../theme/cardStyles';
import { MascotAssets } from '../services/mascotAssets';
import { getReferralCodeForUser, buildInviteLink, getUserReferralStats, ReferralStats } from '../services/referralsService';

interface ShareLightModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

export const ShareLightModal: React.FC<ShareLightModalProps> = ({
  visible,
  onClose,
  userName = 'Pilgrim'
}) => {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    totalInvites: 0,
    joinedFriends: 0,
    graceEarned: 0,
    referralCode: getReferralCodeForUser(userName)
  });
  const [message, setMessage] = useState(
    "I found a peaceful biblical companion app that lets you converse with the Apostles and walk in Scripture. Walk with me on Akorno!"
  );

  const referralCode = getReferralCodeForUser(userName);
  const inviteLink = buildInviteLink(referralCode);

  useEffect(() => {
    if (visible) {
      getUserReferralStats(undefined, userName).then(setStats);
    }
  }, [visible, userName]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${message}\n\nJoin here: ${inviteLink}`,
        title: 'Walk with me in Faith on Akorno'
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Top Grab Bar */}
          <View style={styles.grabBar} />

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* 2D Soft Gradient Organic Mascots (Cotton Cloud / Manna Bread / Dewdrop) */}
            <View style={{ marginBottom: 12, alignItems: 'center' }}>
              <Image
                source={MascotAssets.group}
                style={{ width: 220, height: 140, borderRadius: 20 }}
                resizeMode="contain"
              />
            </View>

            {/* Headline in Instrument Serif */}
            <Text style={styles.title}>Let's Walk in Faith Together!</Text>
            <Text style={styles.subtitle}>
              Share the inspiration with loved ones and unlock <Text style={styles.highlightText}>Grace Shields</Text> together.
            </Text>

            {/* Copyable Link Pill */}
            <TouchableOpacity style={styles.linkPill} onPress={handleCopy} activeOpacity={0.8}>
              <Text style={styles.linkText} numberOfLines={1}>{inviteLink}</Text>
              <View style={styles.copyIconWrap}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color={copied ? '#059669' : '#6B7280'}
                />
              </View>
            </TouchableOpacity>

            {/* Editable Message Box */}
            <View style={styles.messageCard}>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
                placeholder="Personalize your invitation note..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Full-width Obsidian Pill Button */}
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
              <Ionicons name="share-social" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.shareBtnText}>Share the Light</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderCurve: 'continuous',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  grabBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 6,
    marginTop: -8,
  },
  content: {
    alignItems: 'center',
    paddingTop: 8,
  },
  mascotCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    gap: -12,
  },
  mascotBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  mascotPeach: {
    backgroundColor: '#FED7AA',
    zIndex: 1,
  },
  mascotPink: {
    backgroundColor: '#FBCFE8',
    width: 68,
    height: 68,
    borderRadius: 34,
    zIndex: 3,
  },
  mascotPurple: {
    backgroundColor: '#DDD6FE',
    zIndex: 2,
  },
  mascotEmoji: {
    fontSize: 26,
  },
  title: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  highlightText: {
    color: '#D97706',
    fontFamily: Typography.fontSansSemiBold,
  },
  linkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 14,
  },
  linkText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#374151',
    flex: 1,
  },
  copyIconWrap: {
    paddingLeft: 10,
  },
  messageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    width: '100%',
    marginBottom: 22,
  },
  messageInput: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 20,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  shareBtn: {
    width: '100%',
    ...CardStyles.obsidianPillBtn,
    paddingVertical: 15,
  },
  shareBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  }
});
