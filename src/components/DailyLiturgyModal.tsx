import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Easing
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  
  const celebrationFade = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.92)).current;

  // Sync liturgy and personalize when opening
  useEffect(() => {
    setIsCompleted(isAlreadyCompleted);
    if (!visible) {
      stopDeepgramSpeech();
      setIsPlayingAudio(false);
      setShowCelebration(false);
      celebrationFade.setValue(0);
      celebrationScale.setValue(0.92);
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

    // Smooth cinematic fade-in & gentle spring of the streak celebration right inside the same pane
    celebrationFade.setValue(0);
    celebrationScale.setValue(0.92);
    Animated.parallel([
      Animated.timing(celebrationFade, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      })
    ]).start();

    if (onCompleted) onCompleted();
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
        {/* Full-bleed 9:16 Illustrated Biblical Artwork */}
        <Image
          source={THEME_IMAGES[activeLiturgy.period] || THEME_IMAGES.morning}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* Soft, natural progressive gradient allowing the landscape to shine through completely */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.42)', 'rgba(0, 0, 0, 0.12)', 'rgba(0, 0, 0, 0.65)']}
          locations={[0, 0.40, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {showCelebration ? (
          /* ========================================================================= */
          /* IN-PANE STREAK CELEBRATION (Smooth Fade-In Replacing The Entire View)    */
          /* ========================================================================= */
          <Animated.View
            style={[
              styles.celebrationFullPane,
              {
                opacity: celebrationFade,
                transform: [{ scale: celebrationScale }]
              }
            ]}
          >
            {/* Top Close Button in Celebration Pane */}
            <View style={styles.celebrationTopBar}>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.75}>
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.celebrationCenterContent}>
              {/* Mascot Group Medallion */}
              <View style={styles.mascotSealContainer}>
                <Image source={MascotAssets.group} style={styles.mascotSealImg} />
              </View>

              <Text style={styles.celebrationTitle}>Grace & Peace Be Multiplied!</Text>
              
              <Text style={styles.celebrationSub}>
                {resolvedUserName ? `${resolvedUserName}, you` : 'You'} have completed today's liturgy with Apostle {activeLiturgy.apostle.name}. Your faith streak is moving forward!
              </Text>

              {/* Dynamic Reward Pills */}
              <View style={styles.rewardsRow}>
                <View style={styles.rewardPill}>
                  <Ionicons name="flame" size={18} color="#F97316" style={{ marginRight: 6 }} />
                  <Text style={styles.rewardPillText}>+1 Day Streak</Text>
                </View>
                <View style={[styles.rewardPill, styles.rewardPillGold]}>
                  <Ionicons name="trophy" size={16} color="#FDE047" style={{ marginRight: 6 }} />
                  <Text style={[styles.rewardPillText, { color: '#FEF08A' }]}>+25 Spiritual XP</Text>
                </View>
              </View>
            </View>

            {/* Prominent Action Button */}
            <TouchableOpacity style={styles.amenCloseBtn} onPress={handleClose} activeOpacity={0.88}>
              <Text style={styles.amenCloseBtnText}>Amen & Close</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          /* ========================================================================= */
          /* CLEAN, EDITORIAL SCRIPTURE & LITURGY VIEW (No Blocking Cards)             */
          /* ========================================================================= */
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Bar: Floating Badges */}
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

            {/* Apostle Identity Row */}
            <View style={styles.companionRow}>
              <View style={styles.avatarWrap}>
                <Image source={activeLiturgy.apostle.avatar} style={styles.avatarImg} />
              </View>
              <View style={styles.companionMeta}>
                <Text style={styles.apostleName}>Apostle {activeLiturgy.apostle.name}</Text>
                <Text style={styles.liturgyTheme}>
                  {resolvedUserName ? `Guided for ${resolvedUserName} • ${activeLiturgy.theme}` : activeLiturgy.theme}
                </Text>
              </View>
            </View>

            {/* Minimal Floating Audio Bar */}
            <TouchableOpacity
              style={[styles.audioPill, isPlayingAudio && styles.audioPillActive]}
              onPress={handleToggleAudio}
              activeOpacity={0.85}
            >
              <View style={[styles.audioPlayIconWrap, isPlayingAudio && styles.audioPlayIconWrapActive]}>
                <Ionicons
                  name={isPlayingAudio ? 'pause' : 'play'}
                  size={16}
                  color={isPlayingAudio ? '#FFFFFF' : '#111111'}
                  style={!isPlayingAudio && { marginLeft: 2 }}
                />
              </View>

              <View style={styles.audioPillMeta}>
                <Text style={styles.audioPillTitle}>
                  {isPlayingAudio
                    ? `Listening to Apostle ${activeLiturgy.apostle.name}...`
                    : `Listen Spoken Prayer (Reverent & Clear)`}
                </Text>
                <Text style={styles.audioPillSub}>
                  {resolvedUserName
                    ? `Personalized for ${resolvedUserName} • Scripture, reflection & blessing`
                    : `Neural voice guided reflection & blessing`}
                </Text>
              </View>

              {isPlayingAudio && (
                <View style={styles.audioWaveIndicator}>
                  <Ionicons name="volume-high" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* ===================================================================== */}
            {/* SECTION 1: SCRIPTURE ANCHOR (Weighted Editorial Serif directly on art) */}
            {/* ===================================================================== */}
            <View style={styles.sectionContainer}>
              <View style={styles.scriptureCitationRow}>
                <Ionicons name="book-outline" size={13} color="rgba(255, 255, 255, 0.85)" style={{ marginRight: 6 }} />
                <Text style={styles.scriptureCitationText}>{activeLiturgy.scriptureRef}</Text>
              </View>
              <Text style={styles.scriptureText}>“{activeLiturgy.scriptureText}”</Text>
            </View>

            {/* ===================================================================== */}
            {/* SECTION 2: APOSTLE'S REFLECTION                                       */}
            {/* ===================================================================== */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionDividerRow}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionHeading}>APOSTLE'S REFLECTION</Text>
                <View style={styles.sectionLine} />
              </View>
              <Text style={styles.reflectionBodyText}>{activeLiturgy.reflection}</Text>
            </View>

            {/* ===================================================================== */}
            {/* SECTION 3: GUIDED PRAYER                                              */}
            {/* ===================================================================== */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionDividerRow}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionHeading}>LET US PRAY TOGETHER</Text>
                <View style={styles.sectionLine} />
              </View>
              <Text style={styles.prayerBodyText}>“{activeLiturgy.prayer}”</Text>
            </View>

            {/* ===================================================================== */}
            {/* SECTION 4: APOSTOLIC BLESSING                                         */}
            {/* ===================================================================== */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionDividerRow}>
                <View style={styles.sectionLine} />
                <Text style={[styles.sectionHeading, styles.sectionHeadingBlessing]}>APOSTOLIC BLESSING</Text>
                <View style={styles.sectionLine} />
              </View>
              <Text style={styles.blessingBodyText}>“{activeLiturgy.blessing}”</Text>
            </View>

            {/* Completion Button */}
            <View style={styles.completeBtnWrap}>
              <TouchableOpacity
                style={[styles.completeBtn, isCompleted && styles.completeBtnDone]}
                onPress={isCompleted ? handleClose : handleCompleteLiturgy}
                activeOpacity={0.88}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={21}
                  color={isCompleted ? '#FFFFFF' : '#111111'}
                  style={{ marginRight: 8 }}
                />
                <Text style={isCompleted ? styles.completeBtnDoneText : styles.completeBtnText}>
                  {isCompleted ? 'Completed Today ✓' : "Complete Today's Liturgy (+25 XP)"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 70,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  periodText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
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
    fontFamily: Typography.fontSerifBold,
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  liturgyTheme: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    marginBottom: 28,
  },
  audioPillActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  audioPlayIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  audioPlayIconWrapActive: {
    backgroundColor: '#DC2626',
  },
  audioPillMeta: {
    flex: 1,
  },
  audioPillTitle: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  audioPillSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.80)',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  audioWaveIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginBottom: 28,
  },
  scriptureCitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scriptureCitationText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.90)',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scriptureText: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 22,
    lineHeight: 32,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.90)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  sectionDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  sectionHeading: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.78)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.80)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionHeadingBlessing: {
    color: '#FDE047',
  },
  reflectionBodyText: {
    fontFamily: Typography.fontSerifMedium,
    fontSize: 17.5,
    lineHeight: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.88)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 5,
  },
  prayerBodyText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.88)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 5,
  },
  blessingBodyText: {
    fontFamily: Typography.fontSerifMedium,
    fontSize: 17.5,
    lineHeight: 28,
    color: '#FEF08A',
    textShadowColor: 'rgba(0, 0, 0, 0.90)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 5,
  },
  completeBtnWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 17,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  completeBtnDone: {
    backgroundColor: '#059669',
  },
  completeBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15.5,
    color: '#111111',
  },
  completeBtnDoneText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  // Full-pane streak celebration layout
  celebrationFullPane: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 48,
    paddingBottom: 40,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },
  celebrationTopBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  celebrationCenterContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  mascotSealContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 3.5,
    borderColor: '#FEF08A',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  mascotSealImg: {
    width: '100%',
    height: '100%',
  },
  celebrationTitle: {
    fontFamily: Typography.fontSerifBold,
    fontSize: 26,
    lineHeight: 34,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.90)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  celebrationSub: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.90)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 26,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  rewardPillGold: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderColor: 'rgba(254, 240, 138, 0.45)',
  },
  rewardPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  amenCloseBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  amenCloseBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16,
    color: '#111111',
  }
});
