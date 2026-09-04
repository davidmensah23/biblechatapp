import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../theme/typography';
import { CardStyles } from '../theme/cardStyles';
import { KingdomDeed } from '../services/deedsService';

interface DailyDeedCardProps {
  deed: KingdomDeed;
  isCompleted?: boolean;
  onBeginDeed: () => void;
  onViewScripture: () => void;
}

export const DailyDeedCard: React.FC<DailyDeedCardProps> = ({
  deed,
  isCompleted = false,
  onBeginDeed,
  onViewScripture
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Top Number / Tier Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.tierPill}>
          <Text style={styles.tierIcon}>{deed.tierIcon}</Text>
          <Text style={styles.tierLabel}>{deed.tierLabel}</Text>
        </View>

        <View style={styles.xpPill}>
          <Ionicons name="flame" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={styles.xpText}>+{deed.xpReward} XP</Text>
        </View>
      </View>

      {/* Editorial Headline */}
      <Text style={styles.headlineText}>{deed.title}</Text>
      <Text style={styles.subtitleText}>{deed.description}</Text>

      {/* Milestone Checkmarks */}
      <View style={styles.checkpointsWrap}>
        {deed.checkpoints.map((step, idx) => (
          <View key={idx} style={styles.checkpointRow}>
            <View style={[styles.checkCircle, isCompleted && styles.checkCircleCompleted]}>
              <Ionicons
                name={isCompleted ? 'checkmark' : 'checkmark-outline'}
                size={13}
                color={isCompleted ? '#FFFFFF' : '#6B7280'}
              />
            </View>
            <Text style={[styles.checkpointText, isCompleted && styles.checkpointTextCompleted]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Bottom Button Group */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.beginBtn, isCompleted && styles.beginBtnCompleted]}
          onPress={onBeginDeed}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'heart'}
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.beginBtnText}>
            {isCompleted ? 'Deed Sealed' : 'Begin Deed'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guideBtn}
          onPress={onViewScripture}
          activeOpacity={0.75}
        >
          <Ionicons name="book-outline" size={15} color="#374151" style={{ marginRight: 5 }} />
          <Text style={styles.guideBtnText}>Scripture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    ...CardStyles.heroCard,
    padding: 24,
    marginHorizontal: 0,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 6,
  },
  tierIcon: {
    fontSize: 13,
  },
  tierLabel: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 11,
    color: '#4B5563',
    letterSpacing: 0.8,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  xpText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 12,
    color: '#B45309',
  },
  headlineText: {
    fontFamily: Typography.fontSerif,
    fontSize: 23,
    color: '#111827',
    lineHeight: 29,
    marginBottom: 6,
  },
  subtitleText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 16,
  },
  checkpointsWrap: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkCircleCompleted: {
    backgroundColor: '#111111',
  },
  checkpointText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 14.5,
    color: '#333333',
  },
  checkpointTextCompleted: {
    color: '#111111',
    fontFamily: Typography.fontSansMedium,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  beginBtn: {
    flex: 1.4,
    ...CardStyles.obsidianPillBtn,
  },
  beginBtnCompleted: {
    backgroundColor: '#059669',
  },
  beginBtnText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  guideBtn: {
    flex: 1,
    ...CardStyles.mistPillBtn,
  },
  guideBtnText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: '#374151',
  }
});
