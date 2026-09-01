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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle, Path, G, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ApostlePersona } from '../types';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';

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

  // Animated Shared Values for ChatGPT Spectrum Aura
  const coreScale = useSharedValue(1);
  const coreRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.7);
  const rayExpand = useSharedValue(1);
  const verticalStretch = useSharedValue(1);
  const horizontalStretch = useSharedValue(1);

  // Pan Responder Slide-to-End-Call Animated Value
  const slideX = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible) {
      // 1. Fluid Starburst / Aura Core Breathing
      coreScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.92, { duration: 1600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // 2. Slow hypnotic rotation
      coreRotation.value = withRepeat(
        withTiming(360, { duration: 18000, easing: Easing.linear }),
        -1,
        false
      );

      // 3. Glowing Light Shimmer
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.55, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // 4. Reactive Ray Expand
      rayExpand.value = withRepeat(
        withSequence(
          withTiming(1.28, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.85, { duration: 1400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      verticalStretch.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.8, { duration: 1100, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      horizontalStretch.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.35, { duration: 1100, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

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

  // Reanimated Dynamic Spectrum Styles
  const auraCoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isSpeaking ? coreScale.value * 1.15 : coreScale.value },
      { rotate: `${coreRotation.value}deg` }
    ],
    opacity: glowOpacity.value,
  }));

  const verticalBeamAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: isSpeaking ? verticalStretch.value * 1.3 : verticalStretch.value },
      { scaleX: rayExpand.value }
    ],
    opacity: glowOpacity.value,
  }));

  const horizontalBeamAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: isSpeaking ? horizontalStretch.value * 1.3 : horizontalStretch.value },
      { scaleY: rayExpand.value }
    ],
    opacity: glowOpacity.value,
  }));

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
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

        {/* ChatGPT-style Radiant Spectral Starburst Visualizer */}
        <View style={styles.spectrumCenterArea}>
          {/* Ambient Glow Backdrop */}
          <Animated.View style={[styles.ambientGlowBlob, auraCoreAnimatedStyle]}>
            <Svg width="360" height="360" viewBox="0 0 360 360">
              <Defs>
                <RadialGradient id="ambientGrad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#EC4899" stopOpacity="0.85" />
                  <Stop offset="30%" stopColor="#8B5CF6" stopOpacity="0.6" />
                  <Stop offset="65%" stopColor="#1E3A8A" stopOpacity="0.35" />
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="180" cy="180" r="175" fill="url(#ambientGrad)" />
            </Svg>
          </Animated.View>

          {/* Vertical Radiant Cross Beam */}
          <Animated.View style={[styles.beamVertical, verticalBeamAnimatedStyle]}>
            <Svg width="160" height="420" viewBox="0 0 160 420">
              <Defs>
                <RadialGradient id="vertGrad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="15%" stopColor="#F472B6" stopOpacity="0.9" />
                  <Stop offset="45%" stopColor="#9333EA" stopOpacity="0.5" />
                  <Stop offset="85%" stopColor="#1E40AF" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Path
                d="M80,10 Q83,180 150,210 Q83,240 80,410 Q77,240 10,210 Q77,180 80,10 Z"
                fill="url(#vertGrad)"
              />
            </Svg>
          </Animated.View>

          {/* Horizontal Radiant Cross Beam */}
          <Animated.View style={[styles.beamHorizontal, horizontalBeamAnimatedStyle]}>
            <Svg width="420" height="160" viewBox="0 0 420 160">
              <Defs>
                <RadialGradient id="horizGrad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="20%" stopColor="#38BDF8" stopOpacity="0.85" />
                  <Stop offset="50%" stopColor="#818CF8" stopOpacity="0.4" />
                  <Stop offset="85%" stopColor="#1E1B4B" stopOpacity="0.1" />
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Path
                d="M10,80 Q180,83 210,150 Q240,83 410,80 Q240,77 210,10 Q180,77 10,80 Z"
                fill="url(#horizGrad)"
              />
            </Svg>
          </Animated.View>

          {/* Ultra-Bright Center Core Diamond Spark */}
          <Animated.View style={[styles.centerCoreSpark, auraCoreAnimatedStyle]}>
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <Defs>
                <RadialGradient id="coreDiamond" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="35%" stopColor="#FDF2F8" stopOpacity="0.95" />
                  <Stop offset="65%" stopColor="#F472B6" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#9333EA" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="60" cy="60" r="55" fill="url(#coreDiamond)" />
            </Svg>
          </Animated.View>
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
    height: 330,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientGlowBlob: {
    position: 'absolute',
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beamVertical: {
    position: 'absolute',
    width: 160,
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beamHorizontal: {
    position: 'absolute',
    width: 420,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCoreSpark: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionsContainer: {
    paddingHorizontal: 12,
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
