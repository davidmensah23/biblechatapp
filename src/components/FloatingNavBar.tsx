import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface FloatingNavBarProps {
  activeTab: 'home' | 'bible' | 'profile';
  onTabChange: (tab: 'home' | 'bible' | 'profile') => void;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Disciples / Feed Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.activeTab]}
          onPress={() => onTabChange('home')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'home' ? 'people' : 'people-outline'}
            size={22}
            color={activeTab === 'home' ? Colors.pillNavIconActive : Colors.pillNavIconInactive}
          />
        </TouchableOpacity>

        {/* Bible Reader Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bible' && styles.activeTab]}
          onPress={() => onTabChange('bible')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'bible' ? 'book' : 'book-outline'}
            size={20}
            color={activeTab === 'bible' ? Colors.pillNavIconActive : Colors.pillNavIconInactive}
          />
        </TouchableOpacity>

        {/* Profile / Settings Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTab]}
          onPress={() => onTabChange('profile')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person-circle' : 'person-circle-outline'}
            size={23}
            color={activeTab === 'profile' ? Colors.pillNavIconActive : Colors.pillNavIconInactive}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  }
});
