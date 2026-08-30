import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SpringConfigs } from '../theme/animations';

interface FloatingNavBarProps {
  activeTab: 'home' | 'bible' | 'profile';
  onTabChange: (tab: 'home' | 'bible' | 'profile') => void;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({ activeTab, onTabChange }) => {
  const indicatorOffset = useSharedValue(0);

  useEffect(() => {
    if (activeTab === 'home') {
      indicatorOffset.value = withSpring(0, SpringConfigs.bouncy);
    } else if (activeTab === 'bible') {
      indicatorOffset.value = withSpring(60, SpringConfigs.bouncy);
    } else if (activeTab === 'profile') {
      indicatorOffset.value = withSpring(120, SpringConfigs.bouncy);
    }
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorOffset.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Animated Sliding Pill Highlight */}
        <Animated.View style={[styles.activePillHighlight, indicatorStyle]} />

        {/* Disciples / Feed Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('home')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'home' ? 'people' : 'people-outline'}
            size={22}
            color={activeTab === 'home' ? '#FFFFFF' : Colors.pillNavIconInactive}
          />
        </TouchableOpacity>

        {/* Bible Reader Tab */}
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

        {/* Profile / Settings Tab */}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    zIndex: 1,
  }
});
