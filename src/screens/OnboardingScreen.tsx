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
import Svg, { Path, Defs, RadialGradient as SvgRadialGradient, Stop, Circle, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { SpringConfigs } from '../theme/animations';
import { APOSTLE_PERSONAS } from '../services/personas';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Pixel-Perfect Starlight Spectrum for Slide 3
const CosmicSpectrumVisualizer: React.FC = () => {
  const starGlow = useSharedValue(1);
  const flareScale = useSharedValue(1);

  useEffect(() => {
    starGlow.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    flareScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starGlow.value }],
    opacity: starGlow.value * 0.9,
  }));

  const beamAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: flareScale.value }],
  }));

  return (
    <View style={styles.spectrumContainer}>
      {/* Background Deep Cosmic Gradient */}
      <LinearGradient
        colors={['#070311', '#140526', '#090214']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Horizontal Aurora Nebula Mist */}
      <Animated.View style={[styles.auroraBeamWrapper, beamAnimatedStyle]}>
        <LinearGradient
          colors={[
            'rgba(37, 99, 235, 0)',
            'rgba(59, 130, 246, 0.5)',
            'rgba(217, 70, 239, 0.85)',
            'rgba(244, 63, 94, 0.7)',
            'rgba(168, 85, 247, 0.4)',
            'rgba(37, 99, 235, 0)'
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.auroraBeamLine}
        />
      </Animated.View>

      {/* Central 4-Pointed Radiant Flare with Radial Gradient Halo */}
      <Animated.View style={[styles.starCenterWrapper, starAnimatedStyle]}>
        <Svg height="140" width="140" viewBox="0 0 140 140">
          <Defs>
            <SvgRadialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="20%" stopColor="#FDF2F8" stopOpacity="0.95" />
              <Stop offset="45%" stopColor="#F472B6" stopOpacity="0.65" />
              <Stop offset="75%" stopColor="#A855F7" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>

          {/* Diffuse Core Aura */}
          <Circle cx="70" cy="70" r="65" fill="url(#coreGlow)" />

          {/* Primary 4-Pointed Radiant Flare */}
          <Path
            d="M 70 8 Q 70 70 8 70 Q 70 70 70 132 Q 70 70 132 70 Q 70 70 70 8 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          {/* Secondary Soft Pink Micro Flare */}
          <Path
            d="M 70 34 Q 70 70 34 70 Q 70 70 70 106 Q 70 70 106 70 Q 70 70 70 34 Z"
            fill="#FCE7F3"
            opacity="0.75"
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

  // Pagination Indicators
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
      {/* Native Horizontal Paging Carousel */}
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
          {/* Disciples Visual with Seamless Bottom Dissolve */}
          <View style={styles.visualContainer}>
            <Image
              source={require('../../assets/images/onboarding_disciples_hero.png')}
              style={styles.heroImageFull}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                'transparent',
                'rgba(10, 10, 10, 0.25)',
                'rgba(10, 10, 10, 0.7)',
                'rgba(10, 10, 10, 0.96)',
                '#0A0A0A'
              ]}
              locations={[0, 0.3, 0.6, 0.85, 1]}
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

        {/* SLIDE 2: 3D Perspective Card Deck */}
        <View style={styles.slidePage}>
          <View style={[styles.visualContainer, styles.visualContainerPadded]}>
            {/* Perspective Arched Backing Cards */}
            <View style={[styles.stackCard, styles.stackCardLayer4]} />
            <View style={[styles.stackCard, styles.stackCardLayer3]} />
            <View style={[styles.stackCard, styles.stackCardLayer2]} />

            {/* Front Card Matching Reference */}
            <TouchableOpacity
              activeOpacity={0.94}
              onPress={cycleCardStack}
              style={[styles.stackCard, styles.stackCardFront]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircleWrap}>
                  <Image source={currentApostle.avatar} style={styles.cardAvatar} resizeMode="cover" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{currentApostle.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    Seeking true wisdom through Christ our savior
                  </Text>
                </View>
              </View>

              <Text style={styles.cardBio}>
                I am Simon Peter, a fisherman called to follow. Bold, loyal, and sometimes impulsive—I'm the rock that helped build the early Church
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

        {/* SLIDE 3: Cosmic Starlight Call Screen */}
        <View style={styles.slidePage}>
          <View style={[styles.visualContainer, styles.visualContainerPadded]}>
            <View style={styles.callCard}>
              <Text style={styles.callCardTitle}>Peter Speaking</Text>
              <Text style={styles.callCardSubtitle}>You have been chatting for 30 minutes</Text>

              {/* Radiant Cosmic Star Flare */}
              <View style={styles.spectrumOuterFrame}>
                <CosmicSpectrumVisualizer />
              </View>

              {/* Slide to End Call Pill */}
              <LinearGradient
                colors={['#2563EB', '#3B82F6', '#60A5FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.slideEndBar}
              >
                <Text style={styles.slideEndText}>Slide to end call</Text>
                <View style={styles.slideEndIcon}>
                  <Ionicons name="call" size={14} color="#1E1E24" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </LinearGradient>
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
    backgroundColor: '#0A0A0A',
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
    paddingBottom: 24,
  },
  visualContainer: {
    height: '52%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visualContainerPadded: {
    paddingHorizontal: 24,
    paddingTop: 10,
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
    height: 180,
  },
  stackCard: {
    position: 'absolute',
    borderRadius: 28,
  },
  stackCardLayer4: {
    width: '74%',
    height: 250,
    top: 8,
    backgroundColor: '#38383C',
  },
  stackCardLayer3: {
    width: '80%',
    height: 255,
    top: 18,
    backgroundColor: '#505056',
  },
  stackCardLayer2: {
    width: '86%',
    height: 260,
    top: 28,
    backgroundColor: '#72727A',
  },
  stackCardFront: {
    width: '92%',
    backgroundColor: '#DCDCE0',
    padding: 22,
    top: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircleWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#383838',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    fontSize: 24,
    color: '#111111',
  },
  cardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: '#284682',
    marginTop: 2,
    lineHeight: 14,
  },
  cardBio: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    lineHeight: 18.5,
    color: '#222222',
    marginBottom: 18,
  },
  chatWithMePill: {
    borderWidth: 1.5,
    borderColor: '#111111',
    borderRadius: 24,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#D0D0D6',
  },
  chatWithMeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#111111',
  },
  callCard: {
    width: '94%',
    backgroundColor: '#0A0612',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 70, 239, 0.45)',
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
    marginBottom: 14,
  },
  spectrumOuterFrame: {
    width: '100%',
    height: 124,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
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
    height: 18,
    justifyContent: 'center',
  },
  auroraBeamLine: {
    width: '100%',
    height: 10,
    borderRadius: 5,
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
    marginBottom: 78,
  },
  heading: {
    fontFamily: Typography.fontSerif,
    fontSize: 36,
    color: '#FFFFFF',
    lineHeight: 44,
    marginBottom: 12,
  },
  italicAccent: {
    fontFamily: Typography.fontSerifItalic,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
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
    backgroundColor: '#2563EB',
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
