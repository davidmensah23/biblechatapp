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
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient as SvgRadialGradient, Stop, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { SpringConfigs } from '../theme/animations';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: (originX?: number, originY?: number) => void;
}

// 5 Curated Apostles with 100% Unique, Authentic Bios for Slide 2 Card Deck
interface DeckApostle {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  avatar: any;
}

const DECK_APOSTLES: DeckApostle[] = [
  {
    id: 'peter',
    name: 'Peter',
    title: 'Simon Peter',
    subtitle: 'Seeking true wisdom through Christ our savior',
    bio: "I am Simon Peter, a fisherman called to follow. Bold, loyal, and sometimes impulsive—I'm the rock that helped build the early Church.",
    avatar: require('../../assets/avatars/peter.png')
  },
  {
    id: 'john',
    name: 'John',
    title: 'John, The Beloved',
    subtitle: 'Abiding in divine light and everlasting love',
    bio: "I rested against His chest at the Last Supper and stood faithful at the cross. Discover how His boundless love transforms everything.",
    avatar: require('../../assets/avatars/john.png')
  },
  {
    id: 'paul',
    name: 'Paul',
    title: 'Paul of Tarsus',
    subtitle: 'Captured by grace to run the race with endurance',
    bio: "Once a fierce persecutor, blinded on the Damascus road and made new. If grace could reach me, no heart is beyond His redemption.",
    avatar: require('../../assets/avatars/paul.png')
  },
  {
    id: 'thomas',
    name: 'Thomas',
    title: 'Thomas (Didymus)',
    subtitle: 'Honest questions leading to unshakeable conviction',
    bio: "I needed to see His wounded hands with my own eyes. Bring your doubts and honest questions—He welcomes every sincere seeker.",
    avatar: require('../../assets/avatars/thomas.png')
  },
  {
    id: 'andrew',
    name: 'Andrew',
    title: 'Andrew',
    subtitle: 'The quiet connector who first brought others to Christ',
    bio: "I didn't need the spotlight; I found joy in bringing my brother and the boy with five loaves directly to Jesus. Every small step matters.",
    avatar: require('../../assets/avatars/andrew.png')
  }
];

// =========================================================================
// SLIDE 2: 3D PERSPECTIVE CARD DECK COMPONENT (GSAP SHUFFLE ANIMATION)
// =========================================================================
const PerspectiveCardDeck: React.FC<{ isActiveSlide: boolean }> = ({ isActiveSlide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation drivers
  const cardShift = useSharedValue(0);
  const ambientFloat = useSharedValue(0);

  // Ambient gentle floating motion for depth
  useEffect(() => {
    ambientFloat.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const nextCard = () => {
    'worklet';
    cardShift.value = withTiming(
      1,
      { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) },
      (finished) => {
        if (finished) {
          runOnJS(updateCardState)();
        }
      }
    );
  };

  const updateCardState = () => {
    setCurrentIndex((prev) => (prev + 1) % DECK_APOSTLES.length);
    cardShift.value = 0;
  };

  // Automatic shuffle interval every 3.2 seconds when on slide 2
  useEffect(() => {
    if (!isActiveSlide) return;
    const interval = setInterval(() => {
      nextCard();
    }, 3200);

    return () => clearInterval(interval);
  }, [isActiveSlide, currentIndex]);

  const activeApostle = DECK_APOSTLES[currentIndex];
  const nextApostle = DECK_APOSTLES[(currentIndex + 1) % DECK_APOSTLES.length];

  // Front Card Animation Style (Glides upward, tilts 3D, fades slightly)
  const frontCardStyle = useAnimatedStyle(() => {
    const translateY = ambientFloat.value - cardShift.value * 50;
    const rotateZ = `${-cardShift.value * 6}deg`;
    const scale = 1 + cardShift.value * 0.04;
    const opacity = 1 - cardShift.value * 0.85;

    return {
      transform: [
        { perspective: 1000 },
        { translateY },
        { rotateZ },
        { scale }
      ],
      opacity
    };
  });

  // Next Card Behind (Scales up from 0.92 to 1.0 and moves forward)
  const nextCardBehindStyle = useAnimatedStyle(() => {
    const scale = 0.92 + cardShift.value * 0.08;
    const translateY = 14 - cardShift.value * 14;
    const opacity = 0.85 + cardShift.value * 0.15;

    return {
      transform: [
        { perspective: 1000 },
        { translateY },
        { scale }
      ],
      opacity
    };
  });

  return (
    <View style={styles.deckWrapper}>
      {/* Layer 4: Distant Arch Card */}
      <View style={[styles.stackCard, styles.stackCardLayer4]} />

      {/* Layer 3: Middle Arched Card */}
      <View style={[styles.stackCard, styles.stackCardLayer3]} />

      {/* Layer 2: Next Card In Line (Smoothly Scales Forward During Shuffle) */}
      <Animated.View style={[styles.stackCard, styles.stackCardLayer2, nextCardBehindStyle]}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircleWrap}>
            <Image source={nextApostle.avatar} style={styles.cardAvatar} resizeMode="cover" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>{nextApostle.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {nextApostle.subtitle}
            </Text>
          </View>
        </View>

        <Text style={styles.cardBio} numberOfLines={3}>
          {nextApostle.bio}
        </Text>

        <View style={styles.chatWithMePill}>
          <Text style={styles.chatWithMeText}>Chat with me</Text>
        </View>
      </Animated.View>

      {/* Layer 1: Active Front Card with 3D Float & Shuffle Gesture */}
      <Animated.View style={[styles.stackCard, styles.stackCardFront, frontCardStyle]}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={nextCard}
          style={styles.cardInnerTouch}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatarCircleWrap}>
              <Image source={activeApostle.avatar} style={styles.cardAvatar} resizeMode="cover" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{activeApostle.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {activeApostle.subtitle}
              </Text>
            </View>
          </View>

          <Text style={styles.cardBio} numberOfLines={3}>
            {activeApostle.bio}
          </Text>

          <View style={styles.chatWithMePill}>
            <Text style={styles.chatWithMeText}>Chat with me</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// =========================================================================
// SLIDE 3: PIXEL-PERFECT STARLIGHT SPECTRUM COMPONENT
// =========================================================================
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

      {/* Central 4-Pointed Radiant Flare */}
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

          <Circle cx="70" cy="70" r="65" fill="url(#coreGlow)" />

          <Path
            d="M 70 8 Q 70 70 8 70 Q 70 70 70 132 Q 70 70 132 70 Q 70 70 70 8 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

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

// =========================================================================
// MAIN ONBOARDING SCREEN
// =========================================================================
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const handleNext = (originX?: number, originY?: number) => {
    if (currentSlide < 2) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    } else {
      onComplete(originX, originY);
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    setCurrentSlide(pageIndex);
  };

  const dot0Style = useAnimatedStyle(() => ({
    width: dotWidth0.value,
  }));

  const dot1Style = useAnimatedStyle(() => ({
    width: dotWidth1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    width: dotWidth2.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Skip Button */}
      <View style={styles.topHeaderBar}>
        <View />
        <TouchableOpacity
          style={styles.topSkipBtn}
          onPress={(e) => onComplete(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          activeOpacity={0.7}
        >
          <Text style={styles.topSkipText}>Skip</Text>
          <Ionicons name="chevron-forward" size={13} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        bounces={false}
      >
        {/* SLIDE 1: Dissolve Disciples Hero */}
        <View style={styles.slidePage}>
          <View style={styles.visualContainer}>
            <Image
              source={require('../../assets/images/onboarding_disciples_hero.png')}
              style={styles.heroImageFull}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                'transparent',
                'rgba(11, 11, 11, 0.25)',
                'rgba(11, 11, 11, 0.7)',
                'rgba(11, 11, 11, 0.96)',
                '#0B0B0B'
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

        {/* SLIDE 2: 3D Perspective Card Deck (GSAP Shuffle) */}
        <View style={styles.slidePage}>
          <View style={[styles.visualContainer, styles.visualContainerPadded]}>
            <PerspectiveCardDeck isActiveSlide={currentSlide === 1} />
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

      {/* Floating Bottom Navigation Row */}
      <View style={styles.floatingFooterRow}>
        {/* Pagination Dots */}
        <View style={styles.paginationDots}>
          <Animated.View style={[styles.dot, currentSlide === 0 ? styles.dotActive : styles.dotInactive, dot0Style]} />
          <Animated.View style={[styles.dot, currentSlide === 1 ? styles.dotActive : styles.dotInactive, dot1Style]} />
          <Animated.View style={[styles.dot, currentSlide === 2 ? styles.dotActive : styles.dotInactive, dot2Style]} />
        </View>

        {/* Action Button */}
        {currentSlide < 2 ? (
          <TouchableOpacity
            style={styles.nextArrowBtn}
            onPress={(e) => handleNext(e.nativeEvent.pageX, e.nativeEvent.pageY)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={(e) => onComplete(e.nativeEvent.pageX, e.nativeEvent.pageY)}
            activeOpacity={0.85}
          >
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
    backgroundColor: '#0B0B0B',
  },
  topHeaderBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topSkipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    gap: 3,
  },
  topSkipText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#D1D5DB',
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
    height: '53%',
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
  deckWrapper: {
    width: '100%',
    height: 255,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stackCard: {
    position: 'absolute',
    borderRadius: 26,
  },
  stackCardLayer4: {
    top: -26,
    width: '74%',
    height: 52,
    backgroundColor: '#1E1E22',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    opacity: 0.45,
  },
  stackCardLayer3: {
    top: -14,
    width: '84%',
    height: 58,
    backgroundColor: '#27272D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    opacity: 0.7,
  },
  stackCardLayer2: {
    width: '100%',
    backgroundColor: '#D0D0D6',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E2E6',
  },
  stackCardFront: {
    width: '100%',
    backgroundColor: '#DCDCE0',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#ECECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  cardInnerTouch: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircleWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#9E9FA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardAvatar: {
    width: '100%',
    height: '100%',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 23,
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
    fontSize: 12.5,
    lineHeight: 18,
    color: '#222222',
    marginBottom: 14,
  },
  chatWithMePill: {
    borderWidth: 1.5,
    borderColor: '#111111',
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#D0D0D6',
  },
  chatWithMeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14,
    color: '#111111',
  },
  callCard: {
    width: '100%',
    backgroundColor: '#0A0612',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: '#261344',
  },
  callCardTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 27,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  callCardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  spectrumOuterFrame: {
    height: 125,
    borderRadius: 18,
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#1E1435',
  },
  spectrumContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  auroraBeamWrapper: {
    position: 'absolute',
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auroraBeamLine: {
    width: '100%',
    height: 48,
    opacity: 0.9,
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
    marginBottom: 135,
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
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 28,
  },
  getStartedText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 15,
    color: '#FFFFFF',
  }
});
