import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { SpringConfigs } from '../theme/animations';

export type NavTabType = 'home' | 'chats' | 'bible' | 'profile';

interface FloatingNavBarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
}

const TAB_BTN_SIZE = 46;
const TAB_GAP = 10;
const STEP_DISTANCE = TAB_BTN_SIZE + TAB_GAP; // 56px

// =========================================================================
// CUSTOM ANIMATED SVG ICONS
// =========================================================================

// 1. Home Icon (Modern Architectural House with Elastic Bounce)
const AnimatedHomeIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withTiming(0.85, { duration: 100 }),
        withSpring(1.15, { damping: 10, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 180 })
      );
    } else {
      scale.value = withTiming(1.0, { duration: 150 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {active ? (
          // Solid Black Active Silhouette
          <Path
            d="M12 2.69l8.5 7.15a1 1 0 01.35.76V20a2 2 0 01-2 2h-4.5a1 1 0 01-1-1v-4.5a1.5 1.5 0 00-1.5-1.5h-2a1.5 1.5 0 00-1.5 1.5V21a1 1 0 01-1 1H3.65a2 2 0 01-2-2v-9.4a1 1 0 01.35-.76L10.5 2.69a1.16 1.16 0 011.5 0z"
            fill="#000000"
          />
        ) : (
          // Crisp White Outline Stroke
          <Path
            d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </Animated.View>
  );
};

// 2. Chats Icon (Dialogue Bubble with Acoustic Wobble)
const AnimatedChatsIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      rotation.value = withSequence(
        withTiming(-8, { duration: 90 }),
        withTiming(6, { duration: 90 }),
        withTiming(-3, { duration: 80 }),
        withTiming(0, { duration: 80 })
      );
      scale.value = withSequence(
        withTiming(0.88, { duration: 100 }),
        withSpring(1.14, { damping: 10, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 180 })
      );
    } else {
      rotation.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(1.0, { duration: 150 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {active ? (
          // Solid Black Active Bubble with White Conversation Dots
          <>
            <Path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="#000000"
            />
            <Circle cx="7.5" cy="10" r="1.25" fill="#FFFFFF" />
            <Circle cx="12" cy="10" r="1.25" fill="#FFFFFF" />
            <Circle cx="16.5" cy="10" r="1.25" fill="#FFFFFF" />
          </>
        ) : (
          // Crisp White Outline Speech Bubble
          <>
            <Path
              d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5 20 9.08 19.65 7.85 19.03L3.5 20.5L4.85 16.52C3.7 15.13 3 13.4 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="8" cy="11.5" r="1" fill="#FFFFFF" />
            <Circle cx="12" cy="11.5" r="1" fill="#FFFFFF" />
            <Circle cx="16" cy="11.5" r="1" fill="#FFFFFF" />
          </>
        )}
      </Svg>
    </Animated.View>
  );
};

// 3. Bible Icon (Open Scripture Book with Page Spread Motion)
const AnimatedBibleIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const scaleX = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scaleX.value = withSequence(
        withTiming(0.82, { duration: 110 }),
        withSpring(1.12, { damping: 10, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 180 })
      );
      scale.value = withSequence(
        withTiming(0.88, { duration: 100 }),
        withSpring(1.12, { damping: 10, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 180 })
      );
    } else {
      scaleX.value = withTiming(1.0, { duration: 150 });
      scale.value = withTiming(1.0, { duration: 150 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: scaleX.value },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {active ? (
          // Solid Active Open Scripture
          <>
            <Path
              d="M12 4.5C10.5 3.3 8.3 3 6 3C4 3 2.5 3.5 2 4.2V18.8C2.5 18.2 4 17.7 6 17.7C8.3 17.7 10.5 18.2 12 19.3V4.5Z"
              fill="#000000"
            />
            <Path
              d="M12 4.5C13.5 3.3 15.7 3 18 3C20 3 21.5 3.5 22 4.2V18.8C21.5 18.2 20 17.7 18 17.7C15.7 17.7 13.5 18.2 12 19.3V4.5Z"
              fill="#000000"
            />
            <Path d="M12 4.5V19.3" stroke="#FFFFFF" strokeWidth={1.5} />
          </>
        ) : (
          // Crisp White Outline Scripture Pages
          <Path
            d="M12 6.25V19.75M12 6.25C10.36 4.91 7.93 4.25 5.5 4.25C3.5 4.25 2 4.75 2 5.5V19C2 18.25 3.5 17.75 5.5 17.75C7.93 17.75 10.36 18.41 12 19.75M12 6.25C13.64 4.91 16.07 4.25 18.5 4.25C20.5 4.25 22 4.75 22 5.5V19C22 18.25 20.5 17.75 18.5 17.75C16.07 17.75 13.64 18.41 12 19.75"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </Animated.View>
  );
};

// 4. Profile Icon (Minimal User Disc with Head Rise)
const AnimatedProfileIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      translateY.value = withSequence(
        withTiming(2, { duration: 90 }),
        withSpring(-3, { damping: 10, stiffness: 220 }),
        withSpring(0, { damping: 12, stiffness: 180 })
      );
      scale.value = withSequence(
        withTiming(0.88, { duration: 100 }),
        withSpring(1.14, { damping: 10, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 180 })
      );
    } else {
      translateY.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(1.0, { duration: 150 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {active ? (
          // Solid Black Active Portrait Badge
          <>
            <Circle cx="12" cy="7.5" r="4.25" fill="#000000" />
            <Path
              d="M4.5 19.5C4.5 15.63 7.86 12.5 12 12.5C16.14 12.5 19.5 15.63 19.5 19.5C19.5 20.33 18.83 21 18 21H6C5.17 21 4.5 20.33 4.5 19.5Z"
              fill="#000000"
            />
          </>
        ) : (
          // Crisp White Outline User Silhouette
          <>
            <Circle cx="12" cy="7.5" r="4" stroke="#FFFFFF" strokeWidth={2} />
            <Path
              d="M5 20C5 16.5 8.13 13.5 12 13.5C15.87 13.5 19 16.5 19 20"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        )}
      </Svg>
    </Animated.View>
  );
};

// =========================================================================
// MAIN FLOATING NAVIGATION BAR
// =========================================================================
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
        {/* Solid Pure White Sliding Active Circle */}
        <Animated.View style={[styles.activeWhiteCircle, indicatorStyle]} />

        {/* 1. Home Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('home')}
          activeOpacity={0.85}
        >
          <AnimatedHomeIcon active={activeTab === 'home'} />
        </TouchableOpacity>

        {/* 2. Chats / Discussions Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('chats')}
          activeOpacity={0.85}
        >
          <AnimatedChatsIcon active={activeTab === 'chats'} />
        </TouchableOpacity>

        {/* 3. Bible Reader Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('bible')}
          activeOpacity={0.85}
        >
          <AnimatedBibleIcon active={activeTab === 'bible'} />
        </TouchableOpacity>

        {/* 4. Profile Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('profile')}
          activeOpacity={0.85}
        >
          <AnimatedProfileIcon active={activeTab === 'profile'} />
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
    backgroundColor: '#0B0B0B',
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
