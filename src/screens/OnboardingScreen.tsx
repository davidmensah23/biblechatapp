import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  PanResponder
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { SpringConfigs } from '../theme/animations';
import { APOSTLE_PERSONAS } from '../services/personas';
import { ApostlePersona } from '../types';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Multi-bar pulsating audio visualizer for Slide 3
const WaveVisualizer: React.FC = () => {
  const bar1 = useSharedValue(20);
  const bar2 = useSharedValue(35);
  const bar3 = useSharedValue(50);
  const bar4 = useSharedValue(30);
  const bar5 = useSharedValue(45);
  const bar6 = useSharedValue(25);
  const bar7 = useSharedValue(40);

  useEffect(() => {
    bar1.value = withRepeat(withSequence(withTiming(45, { duration: 400 }), withTiming(15, { duration: 400 })), -1, true);
    bar2.value = withRepeat(withSequence(withTiming(20, { duration: 350 }), withTiming(55, { duration: 350 })), -1, true);
    bar3.value = withRepeat(withSequence(withTiming(60, { duration: 450 }), withTiming(25, { duration: 450 })), -1, true);
    bar4.value = withRepeat(withSequence(withTiming(30, { duration: 300 }), withTiming(70, { duration: 300 })), -1, true);
    bar5.value = withRepeat(withSequence(withTiming(65, { duration: 420 }), withTiming(20, { duration: 420 })), -1, true);
    bar6.value = withRepeat(withSequence(withTiming(18, { duration: 380 }), withTiming(50, { duration: 380 })), -1, true);
    bar7.value = withRepeat(withSequence(withTiming(40, { duration: 320 }), withTiming(15, { duration: 320 })), -1, true);
  }, []);

  const s1 = useAnimatedStyle(() => ({ height: bar1.value }));
  const s2 = useAnimatedStyle(() => ({ height: bar2.value }));
  const s3 = useAnimatedStyle(() => ({ height: bar3.value }));
  const s4 = useAnimatedStyle(() => ({ height: bar4.value }));
  const s5 = useAnimatedStyle(() => ({ height: bar5.value }));
  const s6 = useAnimatedStyle(() => ({ height: bar6.value }));
  const s7 = useAnimatedStyle(() => ({ height: bar7.value }));

  return (
    <View style={styles.waveBarsContainer}>
      <Animated.View style={[styles.waveBar, s1]} />
      <Animated.View style={[styles.waveBar, styles.waveBarCyan, s2]} />
      <Animated.View style={[styles.waveBar, styles.waveBarPurple, s3]} />
      <Animated.View style={[styles.waveBar, styles.waveBarBlue, s4]} />
      <Animated.View style={[styles.waveBar, styles.waveBarPurple, s5]} />
      <Animated.View style={[styles.waveBar, styles.waveBarCyan, s6]} />
      <Animated.View style={[styles.waveBar, s7]} />
    </View>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPreviewApostle, setSelectedPreviewApostle] = useState<ApostlePersona>(APOSTLE_PERSONAS[0]);

  // Horizontal Carousel Translation Track
  const translateX = useSharedValue(0);

  // Pagination Dot Animations
  const dotWidth0 = useSharedValue(26);
  const dotWidth1 = useSharedValue(6);
  const dotWidth2 = useSharedValue(6);

  // Glow pulse for slide 3
  const beamPulse = useSharedValue(1);

  useEffect(() => {
    translateX.value = withSpring(-currentSlide * width, SpringConfigs.cardStack);

    dotWidth0.value = withSpring(currentSlide === 0 ? 26 : 6, SpringConfigs.bouncy);
    dotWidth1.value = withSpring(currentSlide === 1 ? 26 : 6, SpringConfigs.bouncy);
    dotWidth2.value = withSpring(currentSlide === 2 ? 26 : 6, SpringConfigs.bouncy);

    if (currentSlide === 2) {
      beamPulse.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Continuous Swipe Gesture Responder
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.value = -currentSlide * width + gestureState.dx;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 && currentSlide < 2) {
          setCurrentSlide(currentSlide + 1);
        } else if (gestureState.dx > 50 && currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        } else {
          translateX.value = withSpring(-currentSlide * width, SpringConfigs.cardStack);
        }
      },
    })
  ).current;

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const dot0Style = useAnimatedStyle(() => ({ width: dotWidth0.value }));
  const dot1Style = useAnimatedStyle(() => ({ width: dotWidth1.value }));
  const dot2Style = useAnimatedStyle(() => ({ width: dotWidth2.value }));
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ scale: beamPulse.value }] }));

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      {/* Top Header with Skip Button */}
      <View style={styles.topBar}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>✨ AI Theological Companion</Text>
        </View>

        {currentSlide < 2 ? (
          <TouchableOpacity onPress={onComplete} style={styles.skipButton} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>

      {/* Continuous Sliding Track for Top Visuals and Typography */}
      <Animated.View style={[styles.slidingTrack, trackAnimatedStyle]}>
        {/* SLIDE 1 */}
        <View style={styles.slidePage}>
          {/* Slide 1 Top Visual */}
          <View style={styles.visualContainer}>
            <Image
              source={require('../../assets/images/onboarding_disciples_hero.png')}
              style={styles.heroImageFull}
              resizeMode="cover"
            />
            <View style={styles.bottomVignette} />
          </View>

          {/* Slide 1 Text Area */}
          <View style={styles.textContainer}>
            <Text style={styles.heading}>
              They've Got <Text style={styles.italicAccent}>Stories</Text>.{'\n'}
              You've Got <Text style={styles.italicAccent}>Questions</Text>
            </Text>
            <Text style={styles.subtitle}>
              Ask Questions, Explore Their Stories, And Discover Ancient Wisdom—Reimagined For Today.
            </Text>

            {/* Interactive Sample Prompt Chip */}
            <View style={styles.samplePromptChip}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#60A5FA" style={{ marginRight: 8 }} />
              <Text style={styles.samplePromptText} numberOfLines={2}>
                "Peter, what did it feel like when Jesus called you from the boat?"
              </Text>
            </View>
          </View>
        </View>

        {/* SLIDE 2 */}
        <View style={styles.slidePage}>
          {/* Slide 2 Top Visual */}
          <View style={[styles.visualContainer, styles.visualContainerPadded]}>
            {/* 3D Stack Layer 3 */}
            <View style={[styles.stackCard, styles.stackCardBack2]} />
            {/* 3D Stack Layer 2 */}
            <View style={[styles.stackCard, styles.stackCardBack1]} />

            {/* Front Selected Apostle Card */}
            <View style={[styles.stackCard, styles.stackCardFront]}>
              <View style={styles.cardHeader}>
                <Image
                  source={selectedPreviewApostle.avatar}
                  style={styles.cardAvatar}
                />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{selectedPreviewApostle.name}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {selectedPreviewApostle.subtitle}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardBio} numberOfLines={3}>
                {selectedPreviewApostle.shortQuote}
              </Text>

              {/* Mini Apostles Selector Chips */}
              <View style={styles.miniAvatarsRow}>
                {APOSTLE_PERSONAS.slice(0, 5).map((a) => {
                  const isCurrent = a.id === selectedPreviewApostle.id;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.miniAvatarTouch, isCurrent && styles.miniAvatarTouchActive]}
                      onPress={() => setSelectedPreviewApostle(a)}
                      activeOpacity={0.7}
                    >
                      <Image source={a.avatar} style={styles.miniAvatarImg} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.chatWithMePill}>
                <Text style={styles.chatWithMeText}>Chat with {selectedPreviewApostle.name}</Text>
              </View>
            </View>
          </View>

          {/* Slide 2 Text Area */}
          <View style={styles.textContainer}>
            <Text style={styles.heading}>
              Dive Into <Text style={styles.italicAccent}>Timeless</Text>{'\n'}
              Conversations
            </Text>
            <Text style={styles.subtitle}>
              From Parables To Personal Insight, Learn From 12 Disciples Brought To Life With Heart And Humility.
            </Text>
          </View>
        </View>

        {/* SLIDE 3 */}
        <View style={styles.slidePage}>
          {/* Slide 3 Top Visual */}
          <View style={[styles.visualContainer, styles.visualContainerPadded]}>
            <View style={styles.callCard}>
              <Text style={styles.callCardTitle}>Peter Speaking</Text>
              <Text style={styles.callCardSubtitle}>You have been chatting for 30 minutes</Text>

              <View style={styles.callGlowArea}>
                <Animated.View style={[styles.callGlowHalo, beamStyle]} />
                <WaveVisualizer />
              </View>

              <View style={styles.slideEndBar}>
                <Text style={styles.slideEndText}>Slide to end call</Text>
                <View style={styles.slideEndIcon}>
                  <Ionicons name="call" size={15} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </View>
            </View>
          </View>

          {/* Slide 3 Text Area */}
          <View style={styles.textContainer}>
            <Text style={styles.heading}>
              Thoughtful. Friendly.{'\n'}
              <Text style={styles.italicAccent}>Always Here.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Enjoy Meaningful Interactions In A Respectful, Safe, And Beautifully Designed Experience.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Floating Bottom Footer Controls */}
      <View style={styles.floatingFooterRow}>
        {/* Animated Pagination Indicators */}
        <View style={styles.paginationDots}>
          <Animated.View style={[styles.dot, currentSlide === 0 ? styles.dotActive : styles.dotInactive, dot0Style]} />
          <Animated.View style={[styles.dot, currentSlide === 1 ? styles.dotActive : styles.dotInactive, dot1Style]} />
          <Animated.View style={[styles.dot, currentSlide === 2 ? styles.dotActive : styles.dotInactive, dot2Style]} />
        </View>

        {/* Action Button */}
        {currentSlide < 2 ? (
          <TouchableOpacity style={styles.nextArrowBtn} onPress={handleNext} activeOpacity={0.8}>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.getStartedBtn} onPress={onComplete} activeOpacity={0.85}>
            <Text style={styles.getStartedText}>Begin Your Walk</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 150,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11.5,
    color: '#E5E7EB',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: '#9CA3AF',
  },
  slidingTrack: {
    flex: 1,
    flexDirection: 'row',
    width: width * 3,
  },
  slidePage: {
    width: width,
    height: '100%',
    justifyContent: 'space-between',
    paddingBottom: 95,
  },
  visualContainer: {
    height: '56%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visualContainerPadded: {
    paddingHorizontal: 22,
  },
  heroImageFull: {
    width: '100%',
    height: '100%',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
  },
  stackCard: {
    position: 'absolute',
    borderRadius: 24,
  },
  stackCardBack2: {
    width: '84%',
    height: 250,
    top: 14,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ rotate: '-6deg' }],
  },
  stackCardBack1: {
    width: '88%',
    height: 260,
    top: 24,
    backgroundColor: '#2A2A32',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ rotate: '4deg' }],
  },
  stackCardFront: {
    width: '94%',
    backgroundColor: '#F5F5F7',
    padding: 18,
    top: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: '#111111',
  },
  cardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#2563EB',
    marginTop: 1,
  },
  cardBio: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#374151',
    marginBottom: 12,
  },
  miniAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  miniAvatarTouch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  miniAvatarTouchActive: {
    borderColor: '#2563EB',
    transform: [{ scale: 1.1 }],
  },
  miniAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  chatWithMePill: {
    borderWidth: 1.5,
    borderColor: '#111827',
    borderRadius: 22,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  chatWithMeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111827',
  },
  callCard: {
    width: '94%',
    backgroundColor: '#121218',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.35)',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  callCardTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  callCardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 18,
  },
  callGlowArea: {
    width: '100%',
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  callGlowHalo: {
    position: 'absolute',
    width: 140,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
  },
  waveBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 75,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  waveBarCyan: {
    backgroundColor: '#06B6D4',
  },
  waveBarPurple: {
    backgroundColor: '#D946EF',
  },
  waveBarBlue: {
    backgroundColor: '#3B82F6',
  },
  slideEndBar: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  slideEndText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  slideEndIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    paddingHorizontal: 26,
    justifyContent: 'center',
  },
  heading: {
    fontFamily: Typography.fontSerif,
    fontSize: 38,
    color: Colors.darkTextPrimary,
    lineHeight: 46,
    marginBottom: 10,
  },
  italicAccent: {
    fontFamily: Typography.fontSerifItalic,
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15.5,
    lineHeight: 23,
    color: '#9CA3AF',
  },
  samplePromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  samplePromptText: {
    flex: 1,
    fontFamily: Typography.fontSerifItalic,
    fontSize: 13.5,
    color: '#93C5FD',
    lineHeight: 18,
  },
  floatingFooterRow: {
    position: 'absolute',
    bottom: 24,
    left: 26,
    right: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: '#374151',
  },
  nextArrowBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentBlue,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  getStartedText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  }
});
