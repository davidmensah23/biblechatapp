import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchYouVersionVerseOfTheDay, YouVersionVOTD } from '../../services/youversionService';
import { Typography } from '../../theme/typography';
import { Colors } from '../../theme/colors';

export interface VerseOfTheDayProps {
  versionId?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export const VerseOfTheDay: React.FC<VerseOfTheDayProps> = ({
  versionId = 111,
  style,
  onPress
}) => {
  const [votd, setVotd] = useState<YouVersionVOTD | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchYouVersionVerseOfTheDay(undefined, String(versionId))
      .then((data) => {
        if (isMounted) {
          setVotd(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [versionId]);

  const handleShare = async () => {
    if (!votd?.passage) return;
    try {
      await Share.share({
        message: `"${votd.passage.content}" — ${votd.passage.reference} (YouVersion Verse of the Day)`
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingWrap, style]}>
        <ActivityIndicator size="small" color="#DC2626" />
      </View>
    );
  }

  if (!votd?.passage) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>VERSE OF THE DAY</Text>
        </View>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={17} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>"{votd.passage.content}"</Text>
      <Text style={styles.ref}>{votd.passage.reference}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 8,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pillBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillText: {
    fontFamily: Typography.fontSansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#DC2626',
  },
  content: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 18,
    lineHeight: 28,
    color: '#111827',
    marginBottom: 10,
  },
  ref: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#6B7280',
  },
});
