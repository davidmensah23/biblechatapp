import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { CardStyles } from '../theme/cardStyles';
import { ShareLightModal } from './ShareLightModal';

interface InviteFriendsBannerProps {
  userName?: string;
}

export const InviteFriendsBanner: React.FC<InviteFriendsBannerProps> = ({ userName }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        {/* Left Content */}
        <View style={styles.leftContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={18} color="#111827" />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>Invite Friends</Text>
            <Text style={styles.subtitle}>Walk in faith together & earn Grace</Text>
          </View>
        </View>

        {/* Right Progressive Chromatic Sunset Blur Aura */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(251, 207, 232, 0.45)',
            'rgba(254, 215, 170, 0.85)'
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.chromaticAura}
        >
          {/* Peeking 3D Mascots */}
          <View style={styles.peekingMascotRow}>
            <View style={[styles.miniMascot, styles.mascotPurple]}>
              <Text style={styles.miniEmoji}>🌿</Text>
            </View>
            <View style={[styles.miniMascot, styles.mascotPeach]}>
              <Text style={styles.miniEmoji}>🕊️</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <ShareLightModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userName={userName}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    ...CardStyles.heroCard,
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 74,
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingVertical: 14,
    zIndex: 2,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
  chromaticAura: {
    width: 140,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 14,
    zIndex: 1,
  },
  peekingMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -8,
  },
  miniMascot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mascotPurple: {
    backgroundColor: '#E9D5FF',
    zIndex: 1,
  },
  mascotPeach: {
    backgroundColor: '#FED7AA',
    width: 42,
    height: 42,
    borderRadius: 21,
    zIndex: 2,
  },
  miniEmoji: {
    fontSize: 18,
  }
});
