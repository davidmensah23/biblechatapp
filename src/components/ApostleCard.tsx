import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ApostlePersona } from '../types';
import { Colors } from '../theme/colors';
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
      <View style={styles.avatarContainer}>
        <Image source={apostle.avatar} style={styles.avatar} resizeMode="cover" />
      </View>
      <Text style={styles.name}>{apostle.name}</Text>
      <Text style={styles.quote} numberOfLines={3}>
        {apostle.shortQuote}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    margin: 6,
    minHeight: 200,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: Typography.fontSerif,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  quote: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 10.5,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  }
});
