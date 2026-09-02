import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Platform,
  BackHandler
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: targetY,
          damping: 26,
          stiffness: 220,
          mass: 0.9,
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
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: CLOSED_Y,
        duration: 280,
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
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const startY = currentSnapRef.current === 'full' ? FULL_Y : MID_Y;
        const nextY = startY + gestureState.dy;

        if (nextY < FULL_Y) {
          const overdrag = FULL_Y - nextY;
          translateY.setValue(FULL_Y - Math.sqrt(overdrag) * 3);
        } else {
          translateY.setValue(nextY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        if (vy > 1.2 || (currentSnapRef.current === 'mid' && dy > 100)) {
          dismissSheet();
          return;
        }

        if (vy < -1.1 || dy < -90) {
          snapTo('full');
          return;
        }

        if (currentSnapRef.current === 'full') {
          if (dy > 120) {
            snapTo('mid');
          } else {
            snapTo('full');
          }
        } else {
          if (dy > 80) {
            dismissSheet();
          } else if (dy < -60) {
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
        <TouchableWithoutFeedback onPress={dismissSheet}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity
              }
            ]}
          />
        </TouchableWithoutFeedback>

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
          <View style={styles.dragHeader} {...panResponder.panHandlers}>
            {showGrabBar && <View style={styles.grabBar} />}
          </View>

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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 12,
  },
  dragHeader: {
    width: '100%',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  grabBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
  },
  sheetContent: {
    flex: 1,
  }
});
