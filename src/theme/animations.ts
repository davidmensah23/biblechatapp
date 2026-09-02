import { withSpring, withTiming, Easing } from 'react-native-reanimated';

export const SpringConfigs = {
  snappy: {
    damping: 24,
    stiffness: 100,
    mass: 1,
  },
  gentle: {
    damping: 28,
    stiffness: 70,
    mass: 1.1,
  },
  bouncy: {
    damping: 18,
    stiffness: 90,
    mass: 1,
  },
  cardStack: {
    damping: 26,
    stiffness: 85,
    mass: 1.1,
  },
  modal: {
    damping: 30,
    stiffness: 75,
    mass: 1.2,
  }
};

export const TimingConfigs = {
  fade: {
    duration: 450,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  slide: {
    duration: 550,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  },
  modalSheet: {
    duration: 600,
    easing: Easing.bezier(0.2, 0.9, 0.3, 1),
  },
  reveal: {
    duration: 1000,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  },
  pulse: {
    duration: 2000,
    easing: Easing.inOut(Easing.ease),
  }
};
