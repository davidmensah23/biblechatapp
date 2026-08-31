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
  onReadMore: () => void;
  onBookmarkToggle?: (saved: boolean) => void;
}

export const DailyScriptureCard: React.FC<DailyScriptureCardProps> = ({
  quote,
  reference,
  onReadMore,
  onBookmarkToggle
}) => {
  const [bookmarked, setBookmarked] = useState(false);
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
      {/* Painting Artwork Header */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/daily_scripture_banner.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Quote Body */}
      <View style={styles.content}>
        <Text style={styles.verseText}>
          {quote} - <Text style={styles.referenceText}>{reference}</Text>
        </Text>

        <View style={styles.footerRow}>
          <TouchableOpacity onPress={onReadMore} activeOpacity={0.7}>
            <Text style={styles.readMoreText}>Read more</Text>
          </TouchableOpacity>

          <Pressable onPress={handleBookmark} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Animated.View style={heartAnimatedStyle}>
              <Ionicons
                name={bookmarked ? 'heart' : 'heart-outline'}
                size={22}
                color={bookmarked ? Colors.heartActive : '#444444'}
              />
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#DCDCE1',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 22,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#222222',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 18,
  },
  verseText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 15.5,
    lineHeight: 23,
    color: '#111111',
    marginBottom: 14,
  },
  referenceText: {
    fontFamily: Typography.fontSansRegular,
    color: '#111111',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMoreText: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 18,
    color: '#111111',
    textDecorationLine: 'underline',
  }
});
