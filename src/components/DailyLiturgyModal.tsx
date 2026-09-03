import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Typography } from '../theme/typography';
import { InteractiveGestureSheet } from './InteractiveGestureSheet';
import { DailyLiturgy, markTodayLiturgyCompleted } from '../services/liturgyService';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';
import { recordDailyActivity } from '../services/gamificationService';
import { MascotAssets } from '../services/mascotAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DailyLiturgyModalProps {
  visible: boolean;
  onClose: () => void;
  liturgy: DailyLiturgy;
  isAlreadyCompleted?: boolean;
  onCompleted?: () => void;
}


const THEME_IMAGES = {
  morning: require('../../assets/images/morning_prayer_bg.jpg'),
  midday: require('../../assets/images/afternoon_prayer_bg.jpg'),
  evening: require('../../assets/images/evening_prayer_bg.jpg'),
};

export const DailyLiturgyModal: React.FC<DailyLiturgyModalProps> = ({
  visible,
  onClose,
  liturgy,
  isAlreadyCompleted = false,
  onCompleted
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setIsCompleted(isAlreadyCompleted);
    if (!visible) {
      stopDeepgramSpeech();
      setIsPlayingAudio(false);
      setShowCelebration(false);
    }
  }, [visible, isAlreadyCompleted]);

  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      await stopDeepgramSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}

      await playDeepgramSpeech(
        liturgy.id,
        liturgy.fullSpokenScript,
        liturgy.apostle.id,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleCompleteLiturgy = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    await markTodayLiturgyCompleted();
    await recordDailyActivity('deed_completed', 25);
    setIsCompleted(true);
    setShowCelebration(true);
    if (onCompleted) onCompleted();
  };

  const handleClose = async () => {
    await stopDeepgramSpeech();
    setIsPlayingAudio(false);
    onClose();
  };

  const isMorning = liturgy.period === 'morning';

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={handleClose}
      initialSnap="full"
      fullHeightRatio={0.92}
      midHeightRatio={0.70}
      showGrabBar={true}
    >
      <View style={styles.sheetContentWrapper}>
        {/* Full 9:16 Illustrated Background with Progressive Scrim */}
        <Image
          source={THEME_IMAGES[liturgy.period] || THEME_IMAGES.morning}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.10)', 'rgba(0, 0, 0, 0.65)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Top Liturgy Header */}
        <View style={styles.topBar}>
          <View style={[styles.periodBadge, isMorning ? styles.periodMorning : styles.periodEvening]}>
            <Ionicons
              name={isMorning ? 'sunny' : 'moon'}
              size={13}
              color={isMorning ? '#D97706' : '#6366F1'}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.periodText, isMorning ? styles.periodTextMorning : styles.periodTextEvening]}>
              {
              liturgy.period === 'morning'
                ? 'Morning Prayer • 2 Min'
                : liturgy.period === 'midday'
                ? 'Midday Pause • 1 Min'
                : 'Evening Prayer • 2 Min'
            }
            </Text>
          </View>

          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.75}>
            <Ionicons name="close" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Apostle Companion Header */}
        <View style={styles.companionRow}>
          <View style={styles.avatarWrap}>
            <Image source={liturgy.apostle.avatar} style={styles.avatarImg} />
          </View>
          <View style={styles.companionMeta}>
            <Text style={styles.apostleName}>{liturgy.apostle.name}</Text>
            <Text style={styles.liturgyTheme}>{liturgy.theme}</Text>
          </View>
        </View>

        {/* Audio Player Bar */}
        <TouchableOpacity
          style={[styles.audioCard, isPlayingAudio && styles.audioCardActive]}
          onPress={handleToggleAudio}
          activeOpacity={0.85}
        >
          <View style={[styles.audioPlayBtn, isPlayingAudio && styles.audioPlayBtnActive]}>
            <Ionicons
              name={isPlayingAudio ? 'pause' : 'play'}
              size={18}
              color="#FFFFFF"
              style={!isPlayingAudio && { marginLeft: 2 }}
            />
          </View>

          <View style={styles.audioInfo}>
            <Text style={styles.audioTitle}>
              {isPlayingAudio ? `Listening to Apostle ${liturgy.apostle.name}...` : `Listen Spoken Prayer (2 min)`}
            </Text>
            <Text style={styles.audioSub}>Neural voice guided reflection & blessing</Text>
          </View>

          {isPlayingAudio && (
            <View style={styles.playingWaveBadge}>
              <Ionicons name="volume-high" size={15} color="#8B1E1E" />
            </View>
          )}
        </TouchableOpacity>

        {/* Section 1: Scripture Anchor */}
        <View style={styles.scriptureBlock}>
          <View style={styles.scriptureCitationBadge}>
            <Text style={styles.scriptureCitationText}>{liturgy.scriptureRef}</Text>
          </View>
          <Text style={styles.scriptureText}>“{liturgy.scriptureText}”</Text>
        </View>

        {/* Section 2: Pastoral Reflection */}
        <View style={styles.reflectionCard}>
          <Text style={styles.sectionHeaderTitle}>Apostle's Reflection</Text>
          <Text style={styles.bodyText}>{liturgy.reflection}</Text>
        </View>

        {/* Section 3: Guided Prayer */}
        <View style={styles.prayerCard}>
          <View style={styles.prayerHeaderRow}>
            <Ionicons name="hand-right-outline" size={16} color="#4B5563" style={{ marginRight: 6 }} />
            <Text style={styles.sectionHeaderTitle}>Let Us Pray Together</Text>
          </View>
          <Text style={styles.prayerBodyText}>“{liturgy.prayer}”</Text>
        </View>

        {/* Section 4: Closing Blessing */}
        <View style={styles.blessingCard}>
          <Text style={styles.blessingLabel}>Apostolic Blessing</Text>
          <Text style={styles.blessingBodyText}>“{liturgy.blessing}”</Text>
        </View>

        {/* Completion Section */}
        {showCelebration ? (
          /* Joyful Celebration Card with Mascot Assets */
          <View style={styles.celebrationCard}>
            <View style={styles.mascotSealContainer}>
              <Image source={MascotAssets.group} style={styles.mascotSealImg} />
            </View>
            <Text style={styles.celebrationTitle}>Grace & Peace Be Multiplied!</Text>
            <Text style={styles.celebrationSub}>
              You completed today's liturgy. Your faith streak is moving forward!
            </Text>

            <View style={styles.rewardsRow}>
              <View style={styles.rewardPill}>
                <Ionicons name="flame" size={16} color="#F97316" style={{ marginRight: 5 }} />
                <Text style={styles.rewardPillText}>+1 Streak Day</Text>
              </View>
              <View style={[styles.rewardPill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Ionicons name="sparkles" size={15} color="#D97706" style={{ marginRight: 5 }} />
                <Text style={[styles.rewardPillText, { color: '#92400E' }]}>+25 Spiritual XP</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.amenCloseBtn} onPress={handleClose} activeOpacity={0.85}>
              <Text style={styles.amenCloseBtnText}>Amen & Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.completeBtnWrap}>
            <TouchableOpacity
              style={[styles.completeBtn, isCompleted && styles.completeBtnDone]}
              onPress={isCompleted ? handleClose : handleCompleteLiturgy}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.completeBtnText}>
                {isCompleted ? 'Completed Today ✓' : "Complete Today's Liturgy (+25 XP)"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>
    </InteractiveGestureSheet>
  );
};

const styles = StyleSheet.create({
  sheetContentWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  periodMorning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  periodEvening: {
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
  },
  periodText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
  },
  periodTextMorning: {
    color: '#B45309',
  },
  periodTextEvening: {
    color: '#4338CA',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 14,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  companionMeta: {
    flex: 1,
  },
  apostleName: {
    fontFamily: Typography.fontSansBold,
    fontSize: 18,
    color: '#111111',
  },
  liturgyTheme: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    marginTop: 2,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 18,
  },
  audioCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  audioPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  audioPlayBtnActive: {
    backgroundColor: '#8B1E1E',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13.5,
    color: '#111111',
  },
  audioSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  playingWaveBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scriptureBlock: {
    backgroundColor: '#FAF9F6',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECECEE',
    marginBottom: 14,
  },
  scriptureCitationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  scriptureCitationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#111111',
  },
  scriptureText: {
    fontFamily: Typography.fontSerif,
    fontSize: 18,
    lineHeight: 27,
    color: '#1F2937',
    fontStyle: 'italic',
  },
  reflectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F2',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    lineHeight: 23,
    color: '#374151',
  },
  prayerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  prayerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerBodyText: {
    fontFamily: Typography.fontSerif,
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  blessingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 20,
  },
  blessingLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  blessingBodyText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 14.5,
    lineHeight: 22,
    color: '#92400E',
  },
  completeBtnWrap: {
    marginTop: 4,
    marginBottom: 16,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 24,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  completeBtnDone: {
    backgroundColor: '#059669',
  },
  completeBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  celebrationCard: {
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#ECECEE',
    marginTop: 6,
    marginBottom: 16,
  },
  mascotSealContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FEF08A',
    marginBottom: 14,
  },
  mascotSealImg: {
    width: '100%',
    height: '100%',
  },
  celebrationTitle: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 6,
  },
  celebrationSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rewardPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#C2410C',
  },
  amenCloseBtn: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenCloseBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  }
});
