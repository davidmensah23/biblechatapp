import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { DailyLiturgy } from '../services/liturgyService';

interface DailyLiturgyCardProps {
  liturgy: DailyLiturgy;
  isCompleted?: boolean;
  onPress: () => void;
}

const THEME_IMAGES = {
  morning: require('../../assets/images/morning_prayer_bg.jpg'),
  midday: require('../../assets/images/afternoon_prayer_bg.jpg'),
  evening: require('../../assets/images/evening_prayer_bg.jpg'),
};

export const DailyLiturgyCard: React.FC<DailyLiturgyCardProps> = ({
  liturgy,
  isCompleted = false,
  onPress
}) => {
  const period = liturgy.period;
  const bgImage = THEME_IMAGES[period] || THEME_IMAGES.morning;

  const periodConfig = {
    morning: { label: 'MORNING PRAYER • 2 MIN', icon: 'sunny' as const },
    midday: { label: 'MIDDAY PAUSE • 1 MIN', icon: 'time-outline' as const },
    evening: { label: 'EVENING PRAYER • 2 MIN', icon: 'moon' as const },
  }[period] || { label: 'DAILY PRAYER • 2 MIN', icon: 'sunny' as const };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* 1. Background 2D Illustrated Artwork */}
      <Image source={bgImage} style={styles.bgImage} resizeMode="cover" />

      {/* 2. Progressive Multi-Stop Gradient Scrim (Vibrant Center, Clear Text Top & Bottom) */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.50)', 'rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.55)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.contentWrap}>
        {/* Top Tag Row with Frosted Glass Pill */}
        <View style={styles.topRow}>
          <View style={styles.periodPill}>
            <Ionicons
              name={periodConfig.icon}
              size={12}
              color="#FFFFFF"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.periodPillText}>
              {periodConfig.label}
            </Text>
          </View>
        </View>

        {/* Title with Subtle Shadow for Crisp Readability */}
        <Text style={styles.titleText}>{liturgy.theme}</Text>
        <Text style={styles.subText}>
          Prayer with Apostle {liturgy.apostle.name}
        </Text>

        {/* Bottom Action: Done pill if completed, or Listen & Pray button if not */}
        <View style={styles.bottomRow}>
          {isCompleted ? (
            <View style={styles.donePill}>
              <Ionicons name="checkmark" size={13} color="#047857" style={{ marginRight: 4 }} />
              <Text style={styles.doneText}>Done</Text>
            </View>
          ) : (
            <View style={styles.listenPill}>
              <Ionicons name="play" size={13} color="#111111" style={{ marginRight: 5 }} />
              <Text style={styles.listenText}>
                {period === 'midday' ? 'Listen & Pause' : 'Listen & Pray'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right Side Avatar with Frosted Glass Border */}
      <View style={styles.avatarWrap}>
        <Image source={liturgy.apostle.avatar} style={styles.avatarImg} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    minHeight: 145,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  contentWrap: {
    flex: 1,
    paddingRight: 14,
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  periodPillText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  titleText: {
    fontFamily: Typography.fontSerif,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  subText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    lineHeight: 17,
    color: 'rgba(255, 255, 255, 0.88)',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
  },
  doneText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#047857',
  },
  listenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
  },
  listenText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#111111',
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 2,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
});
