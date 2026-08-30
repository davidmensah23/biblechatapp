import { withSpring, withTiming, Easing } from 'react-native-reanimated';

export const SpringConfigs = {
  snappy: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 0.6,
  },
  cardStack: {
    damping: 18,
    stiffness: 120,
    mass: 0.9,
  }
};

export const TimingConfigs = {
  fade: {
    duration: 250,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  slide: {
    duration: 350,
    easing: Easing.out(Easing.cubic),
  },
  pulse: {
    duration: 1500,
    easing: Easing.inOut(Easing.ease),
  }
};
