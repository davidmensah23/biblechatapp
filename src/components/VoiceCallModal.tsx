import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ApostlePersona } from '../types';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';

interface VoiceCallModalProps {
  visible: boolean;
  apostle: ApostlePersona;
  durationMinutes?: number;
  onEndCall: () => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  visible,
  apostle,
  durationMinutes = 1,
  onEndCall
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatusText, setCallStatusText] = useState('Connecting...');

  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.6);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.4);
  const wavePulse = useSharedValue(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      // Ring 1 Ripple
      ring1Scale.value = withRepeat(
        withTiming(1.6, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      ring1Opacity.value = withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );

      // Ring 2 Ripple
      ring2Scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(1.9, { duration: 2000, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
      ring2Opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 500 }),
          withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      // Center Avatar Breathing
      wavePulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Trigger initial spoken greeting via Deepgram Aura
      triggerSpokenGreeting();
    } else {
      stopDeepgramSpeech();
      setCallDuration(0);
      setIsSpeaking(false);
    }

    return () => {
      if (timer) clearInterval(timer);
      stopDeepgramSpeech();
    };
  }, [visible, apostle.id]);

  const triggerSpokenGreeting = async () => {
    setCallStatusText(`${apostle.name} Speaking...`);
    setIsSpeaking(true);

    const greetingText = `Peace be with you, my friend. I am ${apostle.name}. I am here to listen and walk with you. What is on your heart today?`;

    await playDeepgramSpeech(
      `call_greeting_${apostle.id}`,
      greetingText,
      apostle.id,
      () => {
        setIsSpeaking(true);
        setCallStatusText(`${apostle.name} Speaking...`);
      },
      () => {
        setIsSpeaking(false);
        setCallStatusText('Listening to you...');
      }
    );
  };

  const handleEndCallInternal = async () => {
    await stopDeepgramSpeech();
    setIsSpeaking(false);
    onEndCall();
  };

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const centerAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wavePulse.value }],
  }));

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleEndCallInternal} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Center Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{apostle.name}</Text>
          <Text style={styles.duration}>
            {formatDuration(callDuration)} • Connected
          </Text>

          {/* Visualizer Card */}
          <View style={styles.visualizerCard}>
            <Animated.View style={[styles.pulseRing, styles.pulseRing1, ring1Style]} />
            <Animated.View style={[styles.pulseRing, styles.pulseRing2, ring2Style]} />

            <Animated.View style={[styles.avatarWrapper, centerAvatarStyle]}>
              <Image
                source={apostle.avatar}
                style={styles.centerAvatar}
              />
            </Animated.View>

            <View style={styles.statusRow}>
              {isSpeaking && <ActivityIndicator size="small" color="#06B6D4" style={{ marginRight: 6 }} />}
              <Text style={styles.listeningStatus}>{callStatusText}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Slide to End Call */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCallInternal}
            activeOpacity={0.85}
          >
            <Text style={styles.endCallText}>End Voice Call</Text>
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
    backgroundColor: '#0B0B0B',
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
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
  },
  pulseRing1: {
    width: 120,
    height: 120,
    borderColor: 'rgba(6, 182, 212, 0.6)',
  },
  pulseRing2: {
    width: 140,
    height: 140,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  avatarWrapper: {
    zIndex: 2,
    marginBottom: 16,
  },
  centerAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: '#3B82F6',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
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
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  endCallText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  callIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
