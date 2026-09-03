import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { SpringConfigs } from '../theme/animations';

interface DailyScriptureCardProps {
  quote: string;
  reference: string;
  theme?: string;
  imageUrl?: string;
  onReadMore: () => void;
  onBookmarkToggle?: (saved: boolean) => void;
}

export const DailyScriptureCard: React.FC<DailyScriptureCardProps> = ({
  quote,
  reference,
  theme,
  imageUrl,
  onReadMore,
  onBookmarkToggle
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const heartScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleBookmark = () => {
    const newState = !bookmarked;
    setBookmarked(newState);

    heartScale.value = withSequence(
      withSpring(1.4, SpringConfigs.bouncy),
      withSpring(1, SpringConfigs.snappy)
    );

    if (onBookmarkToggle) {
      onBookmarkToggle(newState);
    }
  };

  return (
    <View style={styles.card}>
      {/* Full-bleed background image */}
      <Image
        source={
          imageUrl && !imageError
            ? { uri: imageUrl }
            : require('../../assets/images/daily_scripture_banner.png')
        }
        onError={() => setImageError(true)}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Dark Scrim Overlay for guaranteed legibility */}
      <View style={styles.scrimOverlay} />

      {/* Top Header / Theme Badge */}
      <View style={styles.topRow}>
        {theme ? (
          <View style={styles.themeBadge}>
            <Text style={styles.themeBadgeText}>{theme.toUpperCase()}</Text>
          </View>
        ) : <View />}
      </View>

      {/* Scripture Quote in White Serif directly on top */}
      <View style={styles.quoteBody}>
        <Text style={styles.verseText}>
          "{quote}"
        </Text>
        <Text style={styles.referenceText}>— {reference}</Text>
      </View>

      {/* Footer Actions */}
      <View style={styles.footerRow}>
        <TouchableOpacity onPress={onReadMore} activeOpacity={0.75} style={styles.readMoreBtn}>
          <Text style={styles.readMoreText}>Read more</Text>
          <Ionicons name="arrow-forward" size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <Pressable onPress={handleBookmark} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.heartBtn}>
          <Animated.View style={heartAnimatedStyle}>
            <Ionicons
              name={bookmarked ? 'heart' : 'heart-outline'}
              size={22}
              color={bookmarked ? '#EF4444' : '#FFFFFF'}
            />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
  },
  scrimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  themeBadgeText: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 10.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  quoteBody: {
    marginVertical: 14,
  },
  verseText: {
    fontFamily: Typography.fontYouVersionSerifBold,
    fontSize: 22,
    lineHeight: 31,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  referenceText: {
    fontFamily: Typography.fontSansMedium,
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 17,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});
