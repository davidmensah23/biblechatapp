import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Easing,
  Platform,
  BackHandler
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Premium Easy-Ease cubic bezier curve (smooth acceleration, organic deceleration)
const EASY_EASE_CURVE = Easing.bezier(0.25, 1, 0.5, 1);

interface InteractiveGestureSheetProps {
  visible: boolean;
  onClose: () => void;
  initialSnap?: 'mid' | 'full';
  midHeightRatio?: number;
  fullHeightRatio?: number;
  showGrabBar?: boolean;
  children: React.ReactNode;
  containerStyle?: object;
}

export const InteractiveGestureSheet: React.FC<InteractiveGestureSheetProps> = ({
  visible,
  onClose,
  initialSnap = 'mid',
  midHeightRatio = 0.62,
  fullHeightRatio = 0.92,
  showGrabBar = true,
  children,
  containerStyle
}) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const currentSnapRef = useRef<'mid' | 'full'>(initialSnap);

  const MID_Y = SCREEN_HEIGHT * (1 - midHeightRatio);
  const FULL_Y = SCREEN_HEIGHT * (1 - fullHeightRatio);
  const CLOSED_Y = SCREEN_HEIGHT;

  const translateY = useRef(new Animated.Value(CLOSED_Y)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      currentSnapRef.current = initialSnap;
      const targetY = initialSnap === 'full' ? FULL_Y : MID_Y;

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          easing: EASY_EASE_CURVE,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: targetY,
          damping: 24,
          stiffness: 240,
          mass: 0.8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      dismissSheet();
    }
  }, [visible]);

  useEffect(() => {
    if (!modalVisible) return;
    const onBackPress = () => {
      dismissSheet();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [modalVisible]);

  const dismissSheet = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        easing: EASY_EASE_CURVE,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: CLOSED_Y,
        duration: 240,
        easing: EASY_EASE_CURVE,
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const snapTo = (target: 'mid' | 'full') => {
    currentSnapRef.current = target;
    const targetY = target === 'full' ? FULL_Y : MID_Y;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Animated.spring(translateY, {
      toValue: targetY,
      damping: 24,
      stiffness: 260,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  // Highly responsive, non-sticky PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Instant gesture capture on minor vertical move
        return Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const startY = currentSnapRef.current === 'full' ? FULL_Y : MID_Y;
        const nextY = startY + gestureState.dy;

        if (nextY < FULL_Y) {
          // Subtle rubber-band resistance when pulling above full height
          const overdrag = FULL_Y - nextY;
          translateY.setValue(FULL_Y - Math.sqrt(overdrag) * 2.5);
        } else {
          translateY.setValue(nextY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        // Fluid flick-down to dismiss (low velocity threshold, not sticky!)
        if (vy > 0.35 || dy > 60) {
          dismissSheet();
          return;
        }

        // Quick flick-up to expand
        if (vy < -0.35 || dy < -50) {
          snapTo('full');
          return;
        }

        // Position-based snap
        if (currentSnapRef.current === 'full') {
          if (dy > 80) {
            snapTo('mid');
          } else {
            snapTo('full');
          }
        } else {
          if (dy > 45) {
            dismissSheet();
          } else if (dy < -45) {
            snapTo('full');
          } else {
            snapTo('mid');
          }
        }
      }
    })
  ).current;

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={dismissSheet}
    >
      <View style={styles.modalRoot}>
        {/* Full-screen backdrop: Tapping the empty space closes the sheet */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={dismissSheet}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity
              }
            ]}
          />
        </TouchableOpacity>

        {/* Sliding Sheet Card */}
        <Animated.View
          style={[
            styles.sheetCard,
            {
              height: SCREEN_HEIGHT,
              transform: [{ translateY }]
            },
            containerStyle
          ]}
        >
          {/* Draggable Header with Grab Bar */}
          <View style={styles.dragHeader} {...panResponder.panHandlers}>
            {showGrabBar && <View style={styles.grabBar} />}
          </View>

          {/* Sheet Body Content */}
          <View style={styles.sheetContent}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 12,
  },
  dragHeader: {
    width: '100%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  grabBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
  },
  sheetContent: {
    flex: 1,
  }
});
