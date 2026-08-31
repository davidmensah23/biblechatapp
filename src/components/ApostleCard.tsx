import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ApostlePersona } from '../types';
import { Typography } from '../theme/typography';

interface ApostleCardProps {
  apostle: ApostlePersona;
  onPress: (apostle: ApostlePersona) => void;
}

export const ApostleCard: React.FC<ApostleCardProps> = ({ apostle, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(apostle)}
      activeOpacity={0.8}
    >
      {/* Grey Circular Avatar Container */}
      <View style={styles.avatarContainer}>
        <Image
          source={apostle.avatar}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>

      {/* Name in Clean Bold Sans-Serif (reduced size to prevent multi-line wrap) */}
      <Text
        style={styles.name}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.8}
      >
        {apostle.name}
      </Text>

      {/* Subtitle / Bio in Clean Small Blue/Dark Typography */}
      <Text style={styles.quote} numberOfLines={3}>
        {apostle.bio || apostle.subtitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#DCDCE1',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    width: '48%',
    marginBottom: 14,
    minHeight: 216,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: '#9E9FA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 16.5,
    color: '#111111',
    marginBottom: 5,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  quote: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: '#284682',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  }
});
