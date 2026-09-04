import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';
import { PastoralGuide } from '../services/pastoralGuidesService';
import { APOSTLE_PERSONAS } from '../services/personas';
import { ApostlePersona } from '../types';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PastoralGuideModalProps {
  visible: boolean;
  guide: PastoralGuide | null;
  onClose: () => void;
  onStartChat: (apostle: ApostlePersona, topicIntro: string) => void;
}

export const PastoralGuideModal: React.FC<PastoralGuideModalProps> = ({
  visible,
  guide,
  onClose,
  onStartChat,
}) => {
  if (!guide) return null;

  const apostle = APOSTLE_PERSONAS.find((a) => a.id === guide.apostleId) || APOSTLE_PERSONAS[0];

  const handleStartChatPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    onStartChat(
      apostle,
      `Peace be with you, ${apostle.name}. I am walking through a moment of ${guide.situationLabel.toLowerCase()} (${guide.title.toLowerCase()}), and I would value your biblical counsel and prayer.`
    );
  };

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={onClose}
      initialSnap="full"
      fullHeightRatio={0.88}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Apostle Counselor Header Bar */}
        <View style={styles.apostleHeaderBar}>
          <View style={styles.apostleAvatarWrap}>
            <Image source={apostle.avatar} style={styles.apostleAvatar} />
            <View style={[styles.statusDot, { backgroundColor: guide.color }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.apostleCounselorLabel}>YOUR SPIRITUAL COMPANION</Text>
            <Text style={styles.apostleName}>{apostle.name}</Text>
            <Text style={styles.apostleSubtitle}>{apostle.subtitle}</Text>
          </View>
        </View>

        {/* Situation Hero Pill */}
        <View style={[styles.heroSituationCard, { backgroundColor: guide.accentBg }]}>
          <Text style={styles.heroEmoji}>{guide.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroSituationLabel, { color: guide.color }]}>
              {guide.situationLabel.toUpperCase()}
            </Text>
            <Text style={styles.heroTitle}>{guide.title}</Text>
          </View>
        </View>

        {/* Scripture Anchor in YouVersion Untitled Serif */}
        <View style={styles.scriptureCard}>
          <View style={styles.scriptureBadgeRow}>
            <View style={styles.redBullet} />
            <Text style={styles.scriptureBadgeText}>SCRIPTURE ANCHOR</Text>
          </View>
          <Text style={styles.scriptureText}>"{guide.scriptureText}"</Text>
          <Text style={styles.scriptureRef}>— {guide.scriptureRef}</Text>
        </View>

        {/* Pastoral Reflection from the Apostle */}
        <View style={styles.reflectionSection}>
          <Text style={styles.sectionHeader}>A Word from {apostle.name.split(',')[0]}</Text>
          <Text style={styles.reflectionBody}>{guide.reflection}</Text>
        </View>

        {/* Guided Heartfelt Prayer */}
        <View style={styles.prayerCard}>
          <View style={styles.prayerHeaderRow}>
            <Ionicons name="heart" size={16} color="#D97706" />
            <Text style={styles.prayerHeaderText}>PRAYER FOR YOUR SPIRIT</Text>
          </View>
          <Text style={styles.prayerText}>{guide.guidedPrayer}</Text>
        </View>

        {/* Action Button: 1-Tap Direct Apostle Counseling */}
        <TouchableOpacity
          style={[styles.startChatBtn, { backgroundColor: '#111827' }]}
          onPress={handleStartChatPress}
          activeOpacity={0.88}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.startChatBtnText}>
            Converse with {apostle.name.split(',')[0]} About This
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  apostleHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  apostleAvatarWrap: {
    position: 'relative',
  },
  apostleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  apostleCounselorLabel: {
    fontFamily: Typography.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: '#9CA3AF',
  },
  apostleName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 17,
    color: '#111827',
    marginTop: 1,
  },
  apostleSubtitle: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12,
    color: '#6B7280',
  },
  heroSituationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 32,
  },
  heroSituationLabel: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: Typography.fontSansBold,
    fontSize: 16,
    color: '#111827',
  },
  scriptureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
  },
  scriptureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  redBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B1E1E',
  },
  scriptureBadgeText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#8B1E1E',
  },
  scriptureText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 16.5,
    lineHeight: 25,
    color: '#1F2937',
    marginBottom: 8,
  },
  scriptureRef: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'right',
  },
  reflectionSection: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontFamily: Typography.fontSansBold,
    fontSize: 14,
    color: '#111827',
    marginBottom: 6,
  },
  reflectionBody: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    lineHeight: 22,
    color: '#374151',
  },
  prayerCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 24,
  },
  prayerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  prayerHeaderText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: '#92400E',
  },
  prayerText: {
    fontFamily: Typography.fontYouVersionSerifItalic,
    fontSize: 15.5,
    lineHeight: 23,
    color: '#78350F',
  },
  startChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  startChatBtnText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
