import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

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

  const handleBookmark = () => {
    const newState = !bookmarked;
    setBookmarked(newState);
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

          <TouchableOpacity onPress={handleBookmark} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={bookmarked ? 'heart' : 'heart-outline'}
              size={20}
              color={bookmarked ? Colors.heartActive : Colors.heartInactive}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#333333',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  verseText: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  referenceText: {
    fontFamily: Typography.fontSansMedium,
    color: Colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMoreText: {
    fontFamily: Typography.fontSerifItalic,
    fontSize: 16,
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  }
});
