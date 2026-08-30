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
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    backgroundColor: '#ECECF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E2E8',
  },
  avatar: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.4 }, { translateY: 3 }],
  },
  name: {
    fontFamily: Typography.fontSerif,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  quote: {
    fontFamily: Typography.fontSansRegular,
    fontSize: 12.5,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 17.5,
  }
});
