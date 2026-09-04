import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
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

export type NavTabType = 'home' | 'chats' | 'bible' | 'community' | 'profile';

export interface FloatingNavBarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  visible?: boolean;
  userInitial?: string;
  avatarUrl?: string;
}

const TAB_BTN_SIZE = 46;
const TAB_GAP = 10;
const STEP_DISTANCE = TAB_BTN_SIZE + TAB_GAP; // 56px

const FAST_TAB_SPRING = {
  damping: 25,
  stiffness: 350,
  mass: 0.6,
};

// =========================================================================
// CUSTOM ANIMATED SVG ICONS
// =========================================================================

// 1. Home Icon (Modern Architectural House with Instant Responsive Bounce)
const AnimatedHomeIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 12, stiffness: 380 }),
        withSpring(1.0, { damping: 16, stiffness: 280 })
      );
    } else {
      scale.value = withTiming(1.0, { duration: 120 });
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

// 2. Chats Icon (Dialogue Bubble with Instant Acoustic Pop)
const AnimatedChatsIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      rotation.value = withSequence(
        withSpring(-6, { damping: 10, stiffness: 350 }),
        withSpring(4, { damping: 12, stiffness: 300 }),
        withSpring(0, { damping: 14, stiffness: 260 })
      );
      scale.value = withSequence(
        withSpring(1.18, { damping: 12, stiffness: 380 }),
        withSpring(1.0, { damping: 16, stiffness: 280 })
      );
    } else {
      rotation.value = withTiming(0, { duration: 120 });
      scale.value = withTiming(1.0, { duration: 120 });
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

// 3. Bible Icon (Open Scripture Book with Instant Response)
const AnimatedBibleIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 12, stiffness: 380 }),
        withSpring(1.0, { damping: 16, stiffness: 280 })
      );
    } else {
      scale.value = withTiming(1.0, { duration: 120 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
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

// 4. Profile Icon (Dynamic Initial / Avatar Image)
const AnimatedProfileIcon: React.FC<{ active: boolean; userInitial?: string; avatarUrl?: string }> = ({
  active,
  userInitial = 'D',
  avatarUrl
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 12, stiffness: 380 }),
        withSpring(1.0, { damping: 16, stiffness: 280 })
      );
    } else {
      scale.value = withTiming(1.0, { duration: 120 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const initialLetter = (userInitial || 'D').charAt(0).toUpperCase();
  const hasValidImage = Boolean(avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')));

  return (
    <Animated.View style={animatedStyle}>
      {hasValidImage ? (
        <View style={[styles.navAvatarCircle, active ? styles.navAvatarActive : styles.navAvatarInactive]}>
          <Image source={{ uri: avatarUrl }} style={styles.navAvatarImage} resizeMode="cover" />
        </View>
      ) : (
        <View style={[styles.navInitialCircle, active ? styles.navInitialActive : styles.navInitialInactive]}>
          <Text style={[styles.navInitialText, active ? styles.navInitialTextActive : styles.navInitialTextInactive]}>
            {initialLetter}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// =========================================================================
// 3b. Community / Fellowship Flame Icon
const AnimatedCommunityIcon: React.FC<{ active: boolean }> = ({ active }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 12, stiffness: 380 }),
        withSpring(1.0, { damping: 16, stiffness: 280 })
      );
    } else {
      scale.value = withTiming(1.0, { duration: 120 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        {active ? (
          // Solid Black Active Flame
          <Path
            d="M12 2C10.5 4.5 8 7.5 8 11.5a4 4 0 008 0c0-4-2.5-7-4-9.5zM7 17a5 5 0 0010 0v-1H7v1zm-2 4h14a1 1 0 010 2H5a1 1 0 010-2z"
            fill="#000000"
          />
        ) : (
          // Crisp White Outline
          <Path
            d="M12 2C10.5 4.5 8 7.5 8 11.5a4 4 0 008 0c0-4-2.5-7-4-9.5zM7 17a5 5 0 0010 0v-1H7v1zm-2 4h14a1 1 0 010 2H5a1 1 0 010-2z"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
    </Animated.View>
  );
};

// MAIN FLOATING NAVIGATION BAR
// =========================================================================
export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  activeTab,
  onTabChange,
  visible = true,
  userInitial,
  avatarUrl
}) => {
  const indicatorOffset = useSharedValue(0);
  const barTranslateY = useSharedValue(0);
  const barOpacity = useSharedValue(1);

  useEffect(() => {
    if (activeTab === 'home') {
      indicatorOffset.value = withSpring(0, FAST_TAB_SPRING);
    } else if (activeTab === 'chats') {
      indicatorOffset.value = withSpring(STEP_DISTANCE, FAST_TAB_SPRING);
    } else if (activeTab === 'bible') {
      indicatorOffset.value = withSpring(STEP_DISTANCE * 2, FAST_TAB_SPRING);
    } else if (activeTab === 'community') {
      indicatorOffset.value = withSpring(STEP_DISTANCE * 3, FAST_TAB_SPRING);
    } else if (activeTab === 'profile') {
      indicatorOffset.value = withSpring(STEP_DISTANCE * 4, FAST_TAB_SPRING);
    }
  }, [activeTab]);

  useEffect(() => {
    if (visible) {
      barTranslateY.value = withSpring(0, { damping: 22, stiffness: 260 });
      barOpacity.value = withTiming(1, { duration: 180 });
    } else {
      barTranslateY.value = withTiming(85, { duration: 220, easing: Easing.in(Easing.cubic) });
      barOpacity.value = withTiming(0, { duration: 160 });
    }
  }, [visible]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorOffset.value }],
  }));

  const barAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: barTranslateY.value }],
    opacity: barOpacity.value,
  }));

  return (
    <Animated.View
      style={[styles.wrapper, barAnimatedStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
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

        {/* 4. Community Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('community')}
          activeOpacity={0.85}
        >
          <AnimatedCommunityIcon active={activeTab === 'community'} />
        </TouchableOpacity>

        {/* 5. Profile Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange('profile')}
          activeOpacity={0.85}
        >
          <AnimatedProfileIcon
            active={activeTab === 'profile'}
            userInitial={userInitial}
            avatarUrl={avatarUrl}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
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
  navAvatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  navAvatarActive: {
    borderColor: '#000000',
  },
  navAvatarInactive: {
    borderColor: '#FFFFFF',
  },
  navAvatarImage: {
    width: '100%',
    height: '100%',
  },
  navInitialCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.8,
  },
  navInitialActive: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  navInitialInactive: {
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  navInitialText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navInitialTextActive: {
    color: '#000000',
  },
  navInitialTextInactive: {
    color: '#FFFFFF',
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
