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

      {/* Name in Clean Bold Sans-Serif */}
      <Text style={styles.name}>{apostle.name}</Text>

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
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 14,
    minHeight: 224,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    width: 94,
    height: 94,
    borderRadius: 47,
    overflow: 'hidden',
    backgroundColor: '#9E9FA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: Typography.fontSansSemiBold,
    fontSize: 22,
    color: '#111111',
    marginBottom: 6,
    textAlign: 'center',
  },
  quote: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: '#284682',
    textAlign: 'center',
    lineHeight: 14,
  }
});
