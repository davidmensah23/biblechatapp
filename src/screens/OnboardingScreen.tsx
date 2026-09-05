import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { LanguagePickerModal } from '../components/LanguagePickerModal';
import { getAppLanguage, SUPPORTED_LANGUAGES, AppLanguage } from '../services/localizationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: (originX?: number, originY?: number) => void;
}

const APOSTLE_PREVIEWS = [
  { id: 'peter', name: 'Peter', avatar: require('../../assets/avatars/peter.png') },
  { id: 'paul', name: 'Paul', avatar: require('../../assets/avatars/paul.png') },
  { id: 'john', name: 'John', avatar: require('../../assets/avatars/john.png') },
  { id: 'thomas', name: 'Thomas', avatar: require('../../assets/avatars/thomas.png') }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [currentLang, setCurrentLang] = useState<AppLanguage>(getAppLanguage());

  const handleStart = (e: any) => {
    const { pageX, pageY } = e.nativeEvent || {};
    onComplete(pageX || SCREEN_WIDTH / 2, pageY || SCREEN_WIDTH * 1.5);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Language Picker */}
      <View style={styles.topBar}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>BIBLE CHAT</Text>
        </View>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setShowLanguagePicker(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={16} color="rgba(255, 255, 255, 0.85)" />
          <Text style={styles.langBtnText}>{currentLang.nativeName}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Avatar Cluster with Subtle Glow */}
        <View style={styles.avatarClusterWrap}>
          <LinearGradient
            colors={['rgba(139, 30, 30, 0.28)', 'rgba(0, 0, 0, 0)']}
            style={styles.ambientGlow}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={styles.avatarRow}>
            {APOSTLE_PREVIEWS.map((apostle, idx) => (
              <View
                key={apostle.id}
                style={[
                  styles.avatarCard,
                  idx === 1 && { marginTop: -12, transform: [{ scale: 1.08 }] },
                  idx === 2 && { marginTop: -12, transform: [{ scale: 1.08 }] }
                ]}
              >
                <Image source={apostle.avatar} style={styles.avatarImg} />
                <Text style={styles.avatarName}>{apostle.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hero Copy */}
        <View style={styles.copyContainer}>
          <Text style={styles.heroTitle}>Walk with the Apostles</Text>
          <Text style={styles.heroSubtitle}>
            Deep 1st-century historical wisdom, original Greek & Hebrew exegesis, and living scripture guidance calibrated to your walk.
          </Text>
        </View>

        {/* 3 Core Value Badges */}
        <View style={styles.pillarsContainer}>
          <View style={styles.pillarItem}>
            <View style={styles.pillarIconWrap}>
              <Ionicons name="compass-outline" size={18} color="#C49752" />
            </View>
            <Text style={styles.pillarText}>1st-Century Reality</Text>
          </View>

          <View style={styles.pillarItem}>
            <View style={styles.pillarIconWrap}>
              <Ionicons name="book-outline" size={18} color="#C49752" />
            </View>
            <Text style={styles.pillarText}>Greek & Hebrew Roots</Text>
          </View>

          <View style={styles.pillarItem}>
            <View style={styles.pillarIconWrap}>
              <Ionicons name="sparkles-outline" size={18} color="#C49752" />
            </View>
            <Text style={styles.pillarText}>Tap-to-Define Words</Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA Area */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleStart}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="#111111" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleStart}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>I already have an account · <Text style={styles.signInSpan}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>

      {/* Language Modal */}
      <LanguagePickerModal
        visible={showLanguagePicker}
        currentLanguage={currentLang}
        onSelectLanguage={(lang) => {
          setCurrentLang(lang);
          setShowLanguagePicker(false);
        }}
        onClose={() => setShowLanguagePicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandBadgeText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: '#E0E0E0',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  langBtnText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatarClusterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
    width: '100%',
  },
  ambientGlow: {
    position: 'absolute',
    width: 280,
    height: 180,
    borderRadius: 90,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  avatarCard: {
    alignItems: 'center',
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#1E1E1E',
  },
  avatarName: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 6,
  },
  copyContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 36,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    color: 'rgba(255, 255, 255, 0.68)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  pillarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  pillarItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillarIconWrap: {
    marginBottom: 6,
  },
  pillarText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 16,
    color: '#111111',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  signInSpan: {
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
