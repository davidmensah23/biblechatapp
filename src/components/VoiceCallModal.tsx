import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated as RNAnimated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ApostlePersona } from '../types';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';
import { AstroidSpectrumVisualizer } from './AstroidSpectrumVisualizer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const SLIDER_HANDLE_SIZE = 48;
const MAX_SLIDE_DISTANCE = SLIDER_WIDTH - SLIDER_HANDLE_SIZE - 8;

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [captionText, setCaptionText] = useState<string>(
    `Peace be with you, my friend. What is on your heart today?`
  );

  // Pan Responder Slide-to-End-Call Animated Value
  const slideX = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Trigger initial spoken greeting & live captions
      triggerSpokenGreeting();
    } else {
      stopDeepgramSpeech();
      setCallDuration(0);
      setIsSpeaking(false);
      slideX.setValue(0);
    }

    return () => {
      if (timer) clearInterval(timer);
      stopDeepgramSpeech();
    };
  }, [visible, apostle.id]);

  const triggerSpokenGreeting = async () => {
    setIsSpeaking(true);

    const greetingSamples: Record<string, string> = {
      peter: `You'd be surprised how many fish we caught after following His word more than our nets could hold!`,
      john: `Beloved, love comes from God, and everyone who loves has been born of God and knows God.`,
      paul: `I can do all things through Christ who strengthens me. What is on your heart, my brother?`,
      thomas: `I sought certainty, but in His presence, peace surpassed all understanding.`
    };

    const initialGreeting =
      greetingSamples[apostle.id] ||
      `Peace be with you, my friend. I am ${apostle.name}. What is on your heart today?`;

    setCaptionText(initialGreeting);

    await playDeepgramSpeech(
      `call_greeting_${apostle.id}`,
      initialGreeting,
      apostle.id,
      () => {
        setIsSpeaking(true);
      },
      () => {
        setIsSpeaking(false);
      }
    );
  };

  const handleEndCallInternal = async () => {
    await stopDeepgramSpeech();
    setIsSpeaking(false);
    onEndCall();
  };

  // Slider Pan Responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          const clampedX = Math.min(gestureState.dx, MAX_SLIDE_DISTANCE);
          slideX.setValue(clampedX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= MAX_SLIDE_DISTANCE * 0.7) {
          // Trigger slide complete & end call
          RNAnimated.timing(slideX, {
            toValue: MAX_SLIDE_DISTANCE,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            handleEndCallInternal();
          });
        } else {
          // Snap back
          RNAnimated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onEndCall}>
      <View style={styles.container}>
        {/* Top Header Section */}
        <View style={styles.topHeader}>
          <View style={styles.topHeaderCenter}>
            <Text style={styles.title}>{apostle.name} Speaking</Text>
            <Text style={styles.duration}>
              You have been chatting for {Math.max(1, Math.floor(callDuration / 60))} minutes
            </Text>
          </View>
        </View>

        {/* ChatGPT-style Mathematical Radiant Spectral Caustic Visualizer */}
        <View style={styles.spectrumCenterArea}>
          <AstroidSpectrumVisualizer isSpeaking={isSpeaking} />
        </View>

        {/* Live On-Screen Spoken Text Captions */}
        <View style={styles.captionsContainer}>
          <Text style={styles.captionText} numberOfLines={5}>
            {captionText}
          </Text>
        </View>

        {/* Bottom Interactive "Slide to End Call" Red Slider Bar */}
        <View style={styles.footerContainer}>
          <View style={styles.sliderTrack}>
            <Text style={styles.slideTrackText}>Slide to end call</Text>

            <RNAnimated.View
              style={[
                styles.sliderHandle,
                {
                  transform: [{ translateX: slideX }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <TouchableOpacity
                onPress={handleEndCallInternal}
                activeOpacity={0.9}
                style={styles.handleInnerBtn}
              >
                <Ionicons name="call" size={20} color="#EF4444" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
            </RNAnimated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  topHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
  },
  topHeaderCenter: {
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontSerif,
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  duration: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
  spectrumCenterArea: {
    width: '100%',
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionsContainer: {
    paddingHorizontal: 14,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 25,
    lineHeight: 35,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    opacity: 0.95,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626', // Deep crimson red as requested
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  slideTrackText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 22,
    letterSpacing: 0.2,
  },
  sliderHandle: {
    width: SLIDER_HANDLE_SIZE,
    height: SLIDER_HANDLE_SIZE,
    borderRadius: SLIDER_HANDLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handleInnerBtn: {
    width: '100%',
    height: '100%',
    borderRadius: SLIDER_HANDLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
