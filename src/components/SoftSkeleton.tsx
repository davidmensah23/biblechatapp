import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface SoftSkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SoftSkeleton: React.FC<SoftSkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style
}) => {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 850, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.baseSkeleton,
        {
          width,
          height,
          borderRadius
        },
        animatedStyle,
        style
      ]}
    />
  );
};

export const SkeletonLine: React.FC<{
  width?: DimensionValue;
  height?: number;
  marginBottom?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ width = '100%', height = 14, marginBottom = 8, style }) => (
  <SoftSkeleton width={width} height={height} borderRadius={6} style={[{ marginBottom }, style]} />
);

export const SkeletonCircle: React.FC<{
  size?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ size = 44, style }) => (
  <SoftSkeleton width={size} height={size} borderRadius={size / 2} style={style} />
);

export const SkeletonCard: React.FC<{
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ height = 110, borderRadius = 20, style }) => (
  <SoftSkeleton width="100%" height={height} borderRadius={borderRadius} style={style} />
);

/**
 * Editorial Bible Chapter Loading Skeleton (YouVersion style)
 * Mimics real scripture paragraph layout with verse numbers and varying line lengths
 */
export const BibleChapterSkeleton: React.FC = () => {
  return (
    <View style={styles.bibleSkeletonWrapper}>
      {/* Hero Chapter Heading Skeleton */}
      <View style={styles.bibleHeroSkeleton}>
        <SkeletonLine width={110} height={18} marginBottom={10} style={{ alignSelf: 'center' }} />
        <SkeletonLine width={50} height={42} marginBottom={14} style={{ alignSelf: 'center', borderRadius: 10 }} />
        <SkeletonLine width={180} height={13} marginBottom={28} style={{ alignSelf: 'center' }} />
      </View>

      {/* Paragraph 1 */}
      <View style={styles.verseParagraphSkeleton}>
        <View style={styles.verseLeadRow}>
          <SoftSkeleton width={18} height={18} borderRadius={4} style={{ marginRight: 10 }} />
          <SkeletonLine width="92%" height={16} marginBottom={0} />
        </View>
        <SkeletonLine width="100%" height={16} marginBottom={8} />
        <SkeletonLine width="96%" height={16} marginBottom={8} />
        <SkeletonLine width="68%" height={16} marginBottom={20} />
      </View>

      {/* Paragraph 2 */}
      <View style={styles.verseParagraphSkeleton}>
        <View style={styles.verseLeadRow}>
          <SoftSkeleton width={18} height={18} borderRadius={4} style={{ marginRight: 10 }} />
          <SkeletonLine width="90%" height={16} marginBottom={0} />
        </View>
        <SkeletonLine width="98%" height={16} marginBottom={8} />
        <SkeletonLine width="94%" height={16} marginBottom={8} />
        <SkeletonLine width="80%" height={16} marginBottom={20} />
      </View>

      {/* Paragraph 3 */}
      <View style={styles.verseParagraphSkeleton}>
        <View style={styles.verseLeadRow}>
          <SoftSkeleton width={18} height={18} borderRadius={4} style={{ marginRight: 10 }} />
          <SkeletonLine width="88%" height={16} marginBottom={0} />
        </View>
        <SkeletonLine width="100%" height={16} marginBottom={8} />
        <SkeletonLine width="54%" height={16} marginBottom={20} />
      </View>

      {/* Paragraph 4 */}
      <View style={styles.verseParagraphSkeleton}>
        <View style={styles.verseLeadRow}>
          <SoftSkeleton width={18} height={18} borderRadius={4} style={{ marginRight: 10 }} />
          <SkeletonLine width="92%" height={16} marginBottom={0} />
        </View>
        <SkeletonLine width="97%" height={16} marginBottom={8} />
        <SkeletonLine width="85%" height={16} marginBottom={8} />
      </View>
    </View>
  );
};

/**
 * Activity List Skeleton for Profile / Feed (Notes, Highlights, Bookmarks)
 */
export const ActivityListSkeleton: React.FC = () => {
  return (
    <View style={styles.activitySkeletonWrapper}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.activityCardSkeleton}>
          <View style={styles.activityHeaderSkeleton}>
            <SkeletonCircle size={36} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <SkeletonLine width="50%" height={14} marginBottom={6} />
              <SkeletonLine width="30%" height={11} marginBottom={0} />
            </View>
          </View>
          <SkeletonLine width="100%" height={13} marginBottom={6} />
          <SkeletonLine width="90%" height={13} marginBottom={6} />
          <SkeletonLine width="65%" height={13} marginBottom={0} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  baseSkeleton: {
    backgroundColor: '#E5E7EB',
  },
  bibleSkeletonWrapper: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bibleHeroSkeleton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  verseParagraphSkeleton: {
    marginBottom: 10,
  },
  verseLeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activitySkeletonWrapper: {
    paddingHorizontal: 20,
    gap: 14,
  },
  activityCardSkeleton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  activityHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  }
});
