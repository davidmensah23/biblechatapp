import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Visual Area */}
      <View style={styles.visualContainer}>
        {currentSlide === 0 && (
          <View style={styles.slide1Visual}>
            <Image
              source={require('../../assets/images/onboarding_disciples_hero.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        )}

        {currentSlide === 1 && (
          <View style={styles.slide2Visual}>
            {/* Background Stack Cards */}
            <View style={[styles.stackCard, styles.stackCardBack2]} />
            <View style={[styles.stackCard, styles.stackCardBack1]} />
            
            {/* Top Peter Preview Card */}
            <View style={[styles.stackCard, styles.stackCardFront]}>
              <View style={styles.cardHeader}>
                <Image
                  source={require('../../assets/avatars/peter.png')}
                  style={styles.cardAvatar}
                />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Simon Peter</Text>
                  <Text style={styles.cardSubtitle}>Seeking true wisdom through Christ our savior</Text>
                </View>
              </View>

              <Text style={styles.cardBio}>
                I am Simon Peter, a fisherman called to follow. Bold, loyal, and sometimes impulsive—I'm the rock that helped build the early Church.
              </Text>

              <View style={styles.chatWithMePill}>
                <Text style={styles.chatWithMeText}>Chat with me</Text>
              </View>
            </View>
          </View>
        )}

        {currentSlide === 2 && (
          <View style={styles.slide3Visual}>
            <View style={styles.callCard}>
              <Text style={styles.callCardTitle}>Peter Speaking</Text>
              <Text style={styles.callCardSubtitle}>You have been chatting for 30 minutes</Text>

              <View style={styles.callGlowArea}>
                <View style={styles.callGlowBeam} />
                <View style={styles.callGlowCenter} />
              </View>

              <View style={styles.slideEndBar}>
                <Text style={styles.slideEndText}>Slide to end call</Text>
                <View style={styles.slideEndIcon}>
                  <Ionicons name="call" size={14} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Content Area */}
      <View style={styles.textContainer}>
        {currentSlide === 0 && (
          <>
            <Text style={styles.heading}>
              They've Got <Text style={styles.italicAccent}>Stories</Text>.{'\n'}
              You've Got <Text style={styles.italicAccent}>Questions</Text>
            </Text>
            <Text style={styles.subtitle}>
              Ask Questions, Explore Their Stories, And Discover Ancient Wisdom—Reimagined For Today.
            </Text>
          </>
        )}

        {currentSlide === 1 && (
          <>
            <Text style={styles.heading}>
              Dive Into <Text style={styles.italicAccent}>Timeless</Text>{'\n'}
              Conversations
            </Text>
            <Text style={styles.subtitle}>
              From Parables To Personal Insight, Learn From 12 Disciples Brought To Life With Heart And Humility.
            </Text>
          </>
        )}

        {currentSlide === 2 && (
          <>
            <Text style={styles.heading}>
              Thoughtful. Friendly.{'\n'}
              <Text style={styles.italicAccent}>Always Here.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Enjoy Meaningful Interactions In A Respectful, Safe, And Beautifully Designed Experience.
            </Text>
          </>
        )}

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          {/* Pagination Indicators */}
          <View style={styles.paginationDots}>
            <View style={[styles.dot, currentSlide === 0 ? styles.dotActive : styles.dotInactive]} />
            <View style={[styles.dot, currentSlide === 1 ? styles.dotActive : styles.dotInactive]} />
            <View style={[styles.dot, currentSlide === 2 ? styles.dotActive : styles.dotInactive]} />
          </View>

          {/* Action Button */}
          {currentSlide < 2 ? (
            <TouchableOpacity style={styles.nextArrowBtn} onPress={handleNext} activeOpacity={0.8}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.getStartedBtn} onPress={onComplete} activeOpacity={0.8}>
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  visualContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slide1Visual: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: width * 0.88,
    height: '92%',
  },
  slide2Visual: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stackCard: {
    position: 'absolute',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  stackCardBack2: {
    width: '78%',
    height: 240,
    top: 20,
    opacity: 0.2,
    backgroundColor: '#888888',
  },
  stackCardBack1: {
    width: '84%',
    height: 250,
    top: 32,
    opacity: 0.4,
    backgroundColor: '#AAAAAA',
  },
  stackCardFront: {
    width: '90%',
    backgroundColor: '#F7F7F7',
    padding: 20,
    top: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 20,
    color: '#111111',
  },
  cardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 9.5,
    color: '#3B82F6',
    marginTop: 2,
  },
  cardBio: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#444444',
    marginBottom: 14,
  },
  chatWithMePill: {
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chatWithMeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: '#111111',
  },
  slide3Visual: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callCard: {
    width: '90%',
    backgroundColor: '#0F0F12',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.4)',
    padding: 20,
    alignItems: 'center',
  },
  callCardTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  callCardSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: '#888888',
    marginBottom: 20,
  },
  callGlowArea: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  callGlowBeam: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#D946EF',
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  callGlowCenter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#06B6D4',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  slideEndBar: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  slideEndText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  slideEndIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 0.8,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  heading: {
    fontFamily: Typography.fontSerif,
    fontSize: 34,
    color: Colors.darkTextPrimary,
    lineHeight: 42,
    marginBottom: 12,
  },
  italicAccent: {
    fontFamily: Typography.fontSerifItalic,
  },
  subtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.darkTextMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
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
    width: 22,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#333333',
  },
  nextArrowBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentBlue,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 28,
  },
  getStartedText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  }
});
