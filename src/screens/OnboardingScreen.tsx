import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent
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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient as SvgRadialGradient, Stop, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { SpringConfigs } from '../theme/animations';
import { APOSTLE_PERSONAS } from '../services/personas';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Radiant 4-Point Cosmic Star Spectrum for Slide 3
const CosmicSpectrumVisualizer: React.FC = () => {
  const starGlow = useSharedValue(1);
  const flareScale = useSharedValue(1);

  useEffect(() => {
    starGlow.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    flareScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starGlow.value }],
    opacity: starGlow.value * 0.85,
  }));

  const beamAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: flareScale.value }],
  }));

  return (
    <View style={styles.spectrumContainer}>
      {/* Background Deep Cosmic Gradient */}
      <LinearGradient
        colors={['#080312', '#1A062E', '#0B0214']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Radiant Horizontal Neon Aurora Streak */}
      <Animated.View style={[styles.auroraBeamWrapper, beamAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0)', 'rgba(147, 51, 234, 0.6)', 'rgba(236, 72, 153, 0.95)', 'rgba(147, 51, 234, 0.6)', 'rgba(59, 130, 246, 0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.auroraBeamLine}
        />
      </Animated.View>

      {/* Central Radiant 4-Point Star Burst (SVG) */}
      <Animated.View style={[styles.starCenterWrapper, starAnimatedStyle]}>
        <Svg height="130" width="130" viewBox="0 0 130 130">
          <Defs>
            <SvgRadialGradient id="starGlowGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="25%" stopColor="#F472B6" stopOpacity="0.8" />
              <Stop offset="60%" stopColor="#C084FC" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>

          <Circle cx="65" cy="65" r="60" fill="url(#starGlowGrad)" />

          <Path
            d="M 65 5 Q 65 65 5 65 Q 65 65 65 125 Q 65 65 125 65 Q 65 65 65 5 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          <Path
            d="M 65 30 Q 65 65 30 65 Q 65 65 65 100 Q 65 65 100 65 Q 65 65 65 30 Z"
            fill="#FBCFE8"
            opacity="0.7"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Pagination Dot Animations
  const dotWidth0 = useSharedValue(26);
  const dotWidth1 = useSharedValue(6);
  const dotWidth2 = useSharedValue(6);

  useEffect(() => {
    dotWidth0.value = withSpring(currentSlide === 0 ? 26 : 6, SpringConfigs.bouncy);
    dotWidth1.value = withSpring(currentSlide === 1 ? 26 : 6, SpringConfigs.bouncy);
    dotWidth2.value = withSpring(currentSlide === 2 ? 26 : 6, SpringConfigs.bouncy);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < 2) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    } else {
      onComplete();
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    if (pageIndex !== currentSlide && pageIndex >= 0 && pageIndex <= 2) {
      setCurrentSlide(pageIndex);
    }
  };

  const cycleCardStack = () => {
    setActiveCardIndex((prev) => (prev + 1) % APOSTLE_PERSONAS.length);
  };

  const dot0Style = useAnimatedStyle(() => ({ width: dotWidth0.value }));
  const dot1Style = useAnimatedStyle(() => ({ width: dotWidth1.value }));
  const dot2Style = useAnimatedStyle(() => ({ width: dotWidth2.value }));

  const currentApostle = APOSTLE_PERSONAS[activeCardIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Clean Skip Option */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        {currentSlide < 2 && (
          <TouchableOpacity onPress={onComplete} style={styles.skipButton} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Native Horizontal Paging ScrollView (100% Smooth & Glitch-Free on Android) */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SLIDE 1 */}
        <View style={styles.slidePage}>
          {/* Slide 1 Top Visual with Smooth Long Gradient Dissolve */}
          <View style={styles.visualContainer}>
            <Image
              source={require('../../assets/images/onboarding_disciples_hero.png')}
              style={styles.heroImageFull}
              resizeMode="cover"
            />
            {/* Smooth Multi-Stop Linear Gradient Fade */}
            <LinearGradient
              colors={[
                'transparent',
                'rgba(10, 10, 10, 0.2)',
                'rgba(10, 10, 10, 0.65)',
                'rgba(10, 10, 10, 0.95)',
                '#0A0A0A'
              ]}
              locations={[0, 0.25, 0.55, 0.8, 1]}
              style={styles.smoothFadeGradient}
            />
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
          </View>
        </View>

        {/* SLIDE 2: Layered 3D Perspective Card Stack */}
        <View style={styles.slidePage}>
          <View style={[styles.visualContainer, styles.visualContainerPadded]}>
            {/* Top Arched Stack Layers in Perspective */}
            <View style={[styles.stackCard, styles.stackCardLayer4]} />
            <View style={[styles.stackCard, styles.stackCardLayer3]} />
            <View style={[styles.stackCard, styles.stackCardLayer2]} />

            {/* Front Interactive Card */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={cycleCardStack}
              style={[styles.stackCard, styles.stackCardFront]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircleWrap}>
                  <Image source={currentApostle.avatar} style={styles.cardAvatar} resizeMode="cover" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{currentApostle.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {currentApostle.subtitle}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardBio} numberOfLines={4}>
                {currentApostle.bio}
              </Text>

              <View style={styles.chatWithMePill}>
                <Text style={styles.chatWithMeText}>Chat with me</Text>
              </View>
            </TouchableOpacity>
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

        {/* SLIDE 3: Glowing Aurora Starlight Call Screen */}
        <View style={styles.slidePage}>
          <View style={[styles.visualContainer, styles.visualContainerPadded]}>
            <View style={styles.callCard}>
              <Text style={styles.callCardTitle}>Peter Speaking</Text>
              <Text style={styles.callCardSubtitle}>You have been chatting for 30 minutes</Text>

              {/* Exact Radiant Starlight Spectrum */}
              <View style={styles.spectrumOuterFrame}>
                <CosmicSpectrumVisualizer />
              </View>

              {/* Slide to End Call Pill */}
              <View style={styles.slideEndBar}>
                <Text style={styles.slideEndText}>Slide to end call</Text>
                <View style={styles.slideEndIcon}>
                  <Ionicons name="call" size={14} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
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
      </ScrollView>

      {/* Floating Bottom Footer Navigation */}
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
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" style={{ marginLeft: 6 }} />
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
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: '#A1A1AA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
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
  smoothFadeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  stackCard: {
    position: 'absolute',
    borderRadius: 24,
  },
  stackCardLayer4: {
    width: '74%',
    height: 250,
    top: 6,
    backgroundColor: '#18181D',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  stackCardLayer3: {
    width: '80%',
    height: 255,
    top: 16,
    backgroundColor: '#23232A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stackCardLayer2: {
    width: '86%',
    height: 260,
    top: 26,
    backgroundColor: '#32323C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  stackCardFront: {
    width: '92%',
    backgroundColor: '#F5F5F7',
    padding: 20,
    top: 38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircleWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ECECF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cardAvatar: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.4 }, { translateY: 2 }],
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
    fontSize: 10.5,
    color: '#2563EB',
    marginTop: 1,
  },
  cardBio: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    lineHeight: 17.5,
    color: '#374151',
    marginBottom: 16,
  },
  chatWithMePill: {
    borderWidth: 1.5,
    borderColor: '#111827',
    borderRadius: 22,
    paddingVertical: 10,
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
    backgroundColor: '#0F0918',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 70, 239, 0.4)',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
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
    marginBottom: 16,
  },
  spectrumOuterFrame: {
    width: '100%',
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  spectrumContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  auroraBeamWrapper: {
    position: 'absolute',
    width: '100%',
    height: 14,
    justifyContent: 'center',
  },
  auroraBeamLine: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  starCenterWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideEndBar: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  slideEndText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  slideEndIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
