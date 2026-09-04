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
import { fetchYouVersionPassage, YouVersionPassage } from '../../services/youversionService';
import { Typography } from '../../theme/typography';
import { Colors } from '../../theme/colors';

export interface BibleCardProps {
  reference: string; // e.g. "JHN.3.16" or "MAT.6.34"
  versionId?: number; // e.g. 111 (NIV), 2094 (Asante Twi), 2516 (Pidgin)
  style?: ViewStyle;
  onPress?: () => void;
}

export const BibleCard: React.FC<BibleCardProps> = ({
  reference,
  versionId = 111,
  style,
  onPress
}) => {
  const [passage, setPassage] = useState<YouVersionPassage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchYouVersionPassage(reference, String(versionId))
      .then((data) => {
        if (isMounted) {
          setPassage(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reference, versionId]);

  const handleShare = async () => {
    if (!passage) return;
    try {
      await Share.share({
        message: `"${passage.content}" — ${passage.reference}`
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={[styles.cardContainer, styles.loadingWrap, style]}>
        <ActivityIndicator size="small" color="#DC2626" />
        <Text style={styles.loadingText}>Loading Scripture...</Text>
      </View>
    );
  }

  if (!passage) {
    return (
      <View style={[styles.cardContainer, style]}>
        <Text style={styles.referenceText}>{reference}</Text>
        <Text style={styles.bodyText}>Scripture passage currently offline.</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.cardContainer, style]}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
    >
      {/* Header Badge with YouVersion Crimson Accent */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View style={styles.crimsonDot} />
          <Text style={styles.referenceText}>{passage.reference}</Text>
        </View>
        <TouchableOpacity
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-outline" size={17} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Scripture Text in YouVersion's Untitled Serif */}
      <Text style={styles.bodyText}>"{passage.content}"</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 6,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  loadingText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crimsonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  referenceText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 13,
    color: '#111827',
    letterSpacing: 0.2,
  },
  bodyText: {
    fontFamily: Typography.fontYouVersionSerif,
    fontSize: 18,
    lineHeight: 28,
    color: '#111827',
    letterSpacing: 0.1,
  },
});
