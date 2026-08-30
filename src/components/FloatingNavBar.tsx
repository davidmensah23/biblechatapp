import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SpringConfigs } from '../theme/animations';

export type NavTabType = 'home' | 'chats' | 'bible' | 'profile';

interface FloatingNavBarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
}

const TAB_BTN_SIZE = 44;
const TAB_GAP = 10;
const STEP_DISTANCE = TAB_BTN_SIZE + TAB_GAP; // 54px

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({ activeTab, onTabChange }) => {
  const indicatorOffset = useSharedValue(0);

  useEffect(() => {
    if (activeTab === 'home') {
      indicatorOffset.value = withSpring(0, SpringConfigs.bouncy);
    } else if (activeTab === 'chats') {
      indicatorOffset.value = withSpring(STEP_DISTANCE, SpringConfigs.bouncy);
    } else if (activeTab === 'bible') {
      indicatorOffset.value = withSpring(STEP_DISTANCE * 2, SpringConfigs.bouncy);
    } else if (activeTab === 'profile') {
      indicatorOffset.value = withSpring(STEP_DISTANCE * 3, SpringConfigs.bouncy);
    }
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorOffset.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Perfectly Centered Sliding Highlight Circle */}
        <Animated.View style={[styles.activePillHighlight, indicatorStyle]} />

        {/* 1. Home Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('home')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'home' ? '#FFFFFF' : Colors.pillNavIconInactive}
          />
        </TouchableOpacity>

        {/* 2. Chats Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('chats')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'chats' ? 'chatbubbles' : 'chatbubbles-outline'}
            size={21}
            color={activeTab === 'chats' ? '#FFFFFF' : Colors.pillNavIconInactive}
          />
        </TouchableOpacity>

        {/* 3. Bible Reader Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('bible')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'bible' ? 'book' : 'book-outline'}
            size={20}
            color={activeTab === 'bible' ? '#FFFFFF' : Colors.pillNavIconInactive}
          />
        </TouchableOpacity>

        {/* 4. Profile / Settings Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('profile')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person-circle' : 'person-circle-outline'}
            size={23}
            color={activeTab === 'profile' ? '#FFFFFF' : Colors.pillNavIconInactive}
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
    backgroundColor: Colors.pillNav,
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: TAB_GAP,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  activePillHighlight: {
    position: 'absolute',
    left: 8,
    top: 6,
    width: TAB_BTN_SIZE,
    height: TAB_BTN_SIZE,
    borderRadius: TAB_BTN_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
