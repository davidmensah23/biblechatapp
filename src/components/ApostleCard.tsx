import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ApostlePersona } from '../types';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { SpringConfigs } from '../theme/animations';

interface ApostleCardProps {
  apostle: ApostlePersona;
  onPress: (apostle: ApostlePersona) => void;
}

export const ApostleCard: React.FC<ApostleCardProps> = ({ apostle, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, SpringConfigs.bouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringConfigs.snappy);
  };

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <Pressable
        style={styles.card}
        onPress={() => onPress(apostle)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.avatarContainer}>
          <Image source={apostle.avatar} style={styles.avatar} resizeMode="cover" />
        </View>
        <Text style={styles.name}>{apostle.name}</Text>
        <Text style={styles.quote} numberOfLines={3}>
          {apostle.shortQuote}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: 6,
  },
  card: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
