import React, { useState, useEffect, useRef } from 'react';
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
import { DailyLiturgy, markTodayLiturgyCompleted, getTodayLiturgy } from '../services/liturgyService';
import { playDeepgramSpeech, stopDeepgramSpeech } from '../services/deepgramVoices';
import { recordDailyActivity } from '../services/gamificationService';
import { MascotAssets } from '../services/mascotAssets';
import { fetchUserProfile } from '../services/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DailyLiturgyModalProps {
  visible: boolean;
  onClose: () => void;
  liturgy: DailyLiturgy;
  isAlreadyCompleted?: boolean;
  onCompleted?: () => void;
  userName?: string;
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
  onCompleted,
  userName
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeLiturgy, setActiveLiturgy] = useState<DailyLiturgy>(liturgy);
  const [resolvedUserName, setResolvedUserName] = useState<string>(userName || '');
  const scrollViewRef = useRef<ScrollView>(null);

  // Sync liturgy and personalize when opening
  useEffect(() => {
    setIsCompleted(isAlreadyCompleted);
    if (!visible) {
      stopDeepgramSpeech();
      setIsPlayingAudio(false);
      setShowCelebration(false);
    } else {
      // Personalize liturgy with user's first name
      if (userName) {
        setResolvedUserName(userName);
        setActiveLiturgy(getTodayLiturgy(userName));
      } else {
        fetchUserProfile().then(profile => {
          const first = profile?.fullName?.trim().split(' ')[0] || '';
          if (first) {
            setResolvedUserName(first);
            setActiveLiturgy(getTodayLiturgy(first));
          } else {
            setActiveLiturgy(liturgy);
          }
        }).catch(() => {
          setActiveLiturgy(liturgy);
        });
      }
    }
  }, [visible, isAlreadyCompleted, liturgy, userName]);

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
        activeLiturgy.id,
        activeLiturgy.fullSpokenScript,
        activeLiturgy.apostle.id,
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

    // Auto-scroll so celebration card is centered and fully visible (no bottom clipping)
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const handleClose = async () => {
    await stopDeepgramSpeech();
    setIsPlayingAudio(false);
    onClose();
  };

  const isMorning = activeLiturgy.period === 'morning';
  const isMidday = activeLiturgy.period === 'midday';

  return (
    <InteractiveGestureSheet
      visible={visible}
      onClose={handleClose}
      initialSnap="full"
      fullHeightRatio={0.96}
      midHeightRatio={0.68}
      showGrabBar={true}
      headerTransparent={true}
      grabBarColor="rgba(255, 255, 255, 0.75)"
    >
      <View style={styles.sheetContentWrapper}>
        {/* Full 9:16 Illustrated Landscape Background Edge-to-Edge */}
        <Image
          source={THEME_IMAGES[activeLiturgy.period] || THEME_IMAGES.morning}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* Minimal High-Clarity Progressive Gradient Scrim */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.38)', 'rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.58)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Liturgy Header with Floating Frosted Badges */}
          <View style={styles.topBar}>
            <View style={styles.periodBadge}>
              <Ionicons
                name={isMorning ? 'sunny' : isMidday ? 'time-outline' : 'moon'}
                size={14}
                color={isMorning ? '#FDE047' : isMidday ? '#93C5FD' : '#C7D2FE'}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.periodText}>
                {isMorning
                  ? 'Morning Prayer • 2 Min'
                  : isMidday
                  ? 'Midday Pause • 1 Min'
                  : 'Evening Prayer • 2 Min'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.75}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Apostle Companion Header with Frosted Glass Badge */}
          <View style={styles.companionRow}>
            <View style={styles.avatarWrap}>
              <Image source={activeLiturgy.apostle.avatar} style={styles.avatarImg} />
            </View>
            <View style={styles.companionMeta}>
              <Text style={styles.apostleName}>{activeLiturgy.apostle.name}</Text>
              <Text style={styles.liturgyTheme}>
                {resolvedUserName ? `Guided for ${resolvedUserName} • ${activeLiturgy.theme}` : activeLiturgy.theme}
              </Text>
            </View>
          </View>

          {/* Audio Player Bar - Apple-Style Frosted Glass */}
          <TouchableOpacity
            style={[styles.audioCard, isPlayingAudio && styles.audioCardActive]}
            onPress={handleToggleAudio}
            activeOpacity={0.85}
          >
            <View style={[styles.audioPlayBtn, isPlayingAudio && styles.audioPlayBtnActive]}>
              <Ionicons
                name={isPlayingAudio ? 'pause' : 'play'}
                size={18}
                color={isPlayingAudio ? '#FFFFFF' : '#111111'}
                style={!isPlayingAudio && { marginLeft: 2 }}
              />
            </View>

            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>
                {isPlayingAudio
                  ? `Listening to Apostle ${activeLiturgy.apostle.name}...`
                  : `Listen Spoken Prayer (Reverent & Clear)`}
              </Text>
              <Text style={styles.audioSub}>
                {resolvedUserName
                  ? `Personalized for ${resolvedUserName} • Scripture, reflection & blessing`
                  : `Neural voice guided reflection & blessing`}
              </Text>
            </View>

            {isPlayingAudio && (
              <View style={styles.playingWaveBadge}>
                <Ionicons name="volume-high" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Section 1: Scripture Anchor - Liquid Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.scriptureCitationBadge}>
              <Ionicons name="book-outline" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.scriptureCitationText}>{activeLiturgy.scriptureRef}</Text>
            </View>
            <Text style={styles.scriptureText}>“{activeLiturgy.scriptureText}”</Text>
          </View>

          {/* Section 2: Pastoral Reflection - Liquid Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={13} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeaderTitle}>Apostle's Reflection</Text>
            </View>
            <Text style={styles.uniformBodyText}>{activeLiturgy.reflection}</Text>
          </View>

          {/* Section 3: Guided Prayer - Liquid Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="hand-right-outline" size={13} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeaderTitle}>Let Us Pray Together</Text>
            </View>
            <Text style={[styles.uniformBodyText, styles.prayerBodyText]}>“{activeLiturgy.prayer}”</Text>
          </View>

          {/* Section 4: Closing Blessing - Warm Amber Glass Card */}
          <View style={[styles.glassCard, styles.blessingGlassCard]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="sparkles-outline" size={13} color="#FDE047" style={{ marginRight: 6 }} />
              <Text style={styles.blessingLabel}>Apostolic Blessing</Text>
            </View>
            <Text style={styles.uniformBodyText}>“{activeLiturgy.blessing}”</Text>
          </View>

          {/* Completion Section */}
          {showCelebration ? (
            /* Joyful Centered Celebration Card with Mascot Assets (Never Clipped) */
            <View style={styles.celebrationCard}>
              <View style={styles.mascotSealContainer}>
                <Image source={MascotAssets.group} style={styles.mascotSealImg} />
              </View>
              <Text style={styles.celebrationTitle}>Grace & Peace Be Multiplied!</Text>
              <Text style={styles.celebrationSub}>
                {resolvedUserName ? `${resolvedUserName}, you` : 'You'} completed today's liturgy. Your faith streak is moving forward!
              </Text>

              <View style={styles.rewardsRow}>
                <View style={styles.rewardPill}>
                  <Ionicons name="flame" size={16} color="#F97316" style={{ marginRight: 5 }} />
                  <Text style={styles.rewardPillText}>+1 Streak Day</Text>
                </View>
                <View style={[styles.rewardPill, styles.rewardPillGold]}>
                  <Ionicons name="sparkles" size={15} color="#FDE047" style={{ marginRight: 5 }} />
                  <Text style={[styles.rewardPillText, { color: '#FEF08A' }]}>+25 Spiritual XP</Text>
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
                  color={isCompleted ? '#FFFFFF' : '#111111'}
                  style={{ marginRight: 8 }}
                />
                <Text style={isCompleted ? styles.completeBtnDoneText : styles.completeBtnText}>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 46,
    paddingBottom: 90,
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
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  periodText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    marginRight: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    fontSize: 18.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  liturgyTheme: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.90)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  audioCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  audioPlayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  audioSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playingWaveBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  blessingGlassCard: {
    backgroundColor: 'rgba(30, 25, 15, 0.40)',
    borderColor: 'rgba(253, 224, 71, 0.35)',
    marginBottom: 20,
  },
  scriptureCitationBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderColor: 'rgba(255, 255, 255, 0.32)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  scriptureCitationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scriptureText: {
    fontFamily: Typography.fontSerif,
    fontSize: 18,
    lineHeight: 27,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.80)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  uniformBodyText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15.5,
    lineHeight: 24.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  prayerBodyText: {
    fontStyle: 'italic',
  },
  blessingLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11.5,
    color: '#FDE047',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  completeBtnWrap: {
    marginTop: 4,
    marginBottom: 20,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  completeBtnDone: {
    backgroundColor: '#059669',
  },
  completeBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
  },
  completeBtnDoneText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  celebrationCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(253, 224, 71, 0.50)',
    marginTop: 6,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  mascotSealContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  celebrationSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
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
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  rewardPillGold: {
    backgroundColor: 'rgba(254, 240, 138, 0.20)',
    borderColor: 'rgba(254, 240, 138, 0.40)',
  },
  rewardPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  amenCloseBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  amenCloseBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15,
    color: '#111111',
  }
});
