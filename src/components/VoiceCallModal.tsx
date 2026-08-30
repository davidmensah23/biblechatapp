import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ApostlePersona } from '../types';

interface VoiceCallModalProps {
  visible: boolean;
  apostle: ApostlePersona;
  durationMinutes?: number;
  onEndCall: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  visible,
  apostle,
  durationMinutes = 30,
  onEndCall
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onEndCall} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Center Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{apostle.name} Speaking</Text>
          <Text style={styles.duration}>
            You have been chatting for {durationMinutes} minutes
          </Text>

          {/* Glowing Wave Card */}
          <View style={styles.visualizerCard}>
            <Image
              source={require('../../assets/avatars/peter.png')}
              style={styles.centerAvatar}
            />
            <View style={styles.pulseRing} />
            <Text style={styles.listeningStatus}>Listening & Reflecting...</Text>
          </View>
        </View>

        {/* Bottom Slide to End Call */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={onEndCall}
            activeOpacity={0.85}
          >
            <Text style={styles.endCallText}>Slide to end call</Text>
            <View style={styles.callIconBadge}>
              <Ionicons name="call" size={18} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 34,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  duration: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#888888',
    marginBottom: 36,
  },
  visualizerCard: {
    width: '100%',
    height: 280,
    backgroundColor: '#121214',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  centerAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginBottom: 16,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  listeningStatus: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#06B6D4',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  endCallButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  endCallText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  callIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
