import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { DailyLiturgy } from '../services/liturgyService';

interface DailyLiturgyCardProps {
  liturgy: DailyLiturgy;
  isCompleted?: boolean;
  onPress: () => void;
}

export const DailyLiturgyCard: React.FC<DailyLiturgyCardProps> = ({
  liturgy,
  isCompleted = false,
  onPress
}) => {
  const isMorning = liturgy.period === 'morning';

  return (
    <TouchableOpacity
      style={[styles.card, isMorning ? styles.cardMorning : styles.cardEvening]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.contentWrap}>
        {/* Top Tag Row */}
        <View style={styles.topRow}>
          <View style={[styles.periodPill, isMorning ? styles.periodPillMorning : styles.periodPillEvening]}>
            <Ionicons
              name={isMorning ? 'sunny' : 'moon'}
              size={12}
              color={isMorning ? '#B45309' : '#4338CA'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.periodPillText, isMorning ? styles.periodPillTextMorning : styles.periodPillTextEvening]}>
              {isMorning ? 'MORNING LITURGY' : 'EVENING LITURGY'} • 2 MIN
            </Text>
          </View>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.completedText}>Done Today</Text>
            </View>
          )}
        </View>

        {/* Title & Theme */}
        <Text style={styles.titleText}>{liturgy.theme}</Text>
        <Text style={styles.subText}>
          Guided prayer & reflection with Apostle {liturgy.apostle.name}
        </Text>

        {/* Bottom Action Pill */}
        <View style={styles.bottomRow}>
          <View style={[styles.listenPill, isCompleted && styles.listenPillDone]}>
            <Ionicons
              name={isCompleted ? 'checkmark' : 'play'}
              size={13}
              color={isCompleted ? '#059669' : '#111111'}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.listenText, isCompleted && styles.listenTextDone]}>
              {isCompleted ? 'Review Reflection' : 'Listen & Pray'}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Side Avatar */}
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
    marginBottom: 14,
    borderWidth: 1,
  },
  cardMorning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  cardEvening: {
    backgroundColor: '#F5F3FF',
    borderColor: '#EDE9FE',
  },
  contentWrap: {
    flex: 1,
    paddingRight: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  periodPillMorning: {
    backgroundColor: '#FEF3C7',
  },
  periodPillEvening: {
    backgroundColor: '#EDE9FE',
  },
  periodPillText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  periodPillTextMorning: {
    color: '#B45309',
  },
  periodPillTextEvening: {
    color: '#4338CA',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#059669',
  },
  titleText: {
    fontFamily: Typography.fontSerif,
    fontSize: 17.5,
    lineHeight: 23,
    color: '#111111',
    marginBottom: 4,
  },
  subText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#6B7280',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listenPillDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  listenText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#111111',
  },
  listenTextDone: {
    color: '#059669',
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  }
});
