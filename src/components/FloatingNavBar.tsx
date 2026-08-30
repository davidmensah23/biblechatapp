import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SpringConfigs } from '../theme/animations';

export type NavTabType = 'home' | 'bible' | 'profile';

interface FloatingNavBarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
}

const TAB_BTN_SIZE = 48;
const TAB_GAP = 14;
const STEP_DISTANCE = TAB_BTN_SIZE + TAB_GAP; // 62px

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({ activeTab, onTabChange }) => {
  const indicatorOffset = useSharedValue(0);

  useEffect(() => {
    if (activeTab === 'home') {
      indicatorOffset.value = withSpring(0, SpringConfigs.bouncy);
    } else if (activeTab === 'bible') {
      indicatorOffset.value = withSpring(STEP_DISTANCE, SpringConfigs.bouncy);
    } else if (activeTab === 'profile') {
      indicatorOffset.value = withSpring(STEP_DISTANCE * 2, SpringConfigs.bouncy);
    }
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorOffset.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Solid Pure White Sliding Active Circle */}
        <Animated.View style={[styles.activeWhiteCircle, indicatorStyle]} />

        {/* 1. Feed / Disciples Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('home')}
          activeOpacity={0.85}
        >
          <Ionicons
            name={activeTab === 'home' ? 'people' : 'people-outline'}
            size={24}
            color={activeTab === 'home' ? '#000000' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* 2. Bible Reader Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('bible')}
          activeOpacity={0.85}
        >
          <Ionicons
            name={activeTab === 'bible' ? 'book' : 'book-outline'}
            size={22}
            color={activeTab === 'bible' ? '#000000' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* 3. Profile Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('profile')}
          activeOpacity={0.85}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person-circle' : 'person-circle-outline'}
            size={24}
            color={activeTab === 'profile' ? '#000000' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: TAB_GAP,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  activeWhiteCircle: {
    position: 'absolute',
    left: 8,
    top: 6,
    width: TAB_BTN_SIZE,
    height: TAB_BTN_SIZE,
    borderRadius: TAB_BTN_SIZE / 2,
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    width: TAB_BTN_SIZE,
    height: TAB_BTN_SIZE,
    borderRadius: TAB_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  }
});
