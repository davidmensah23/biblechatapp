import React, { useState, useEffect } from 'react';
import { View, Image, ImageSourcePropType, StyleSheet } from 'react-native';

interface FrameSequencePlayerProps {
  frames: ImageSourcePropType[];
  fps?: number; // Frames per second (e.g. 3, 4, 5, 6)
  size?: number;
  width?: number;
  height?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

export const FrameSequencePlayer: React.FC<FrameSequencePlayerProps> = ({
  frames,
  fps = 4,
  size = 120,
  width,
  height,
  loop = true,
  autoPlay = true
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  const frameWidth = width || size;
  const frameHeight = height || size;
  const intervalMs = Math.max(50, Math.floor(1000 / fps));

  useEffect(() => {
    if (!autoPlay || frames.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex((prevIndex) => {
        if (prevIndex + 1 >= frames.length) {
          return loop ? 0 : prevIndex;
        }
        return prevIndex + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [frames, fps, loop, autoPlay, intervalMs]);

  if (!frames || frames.length === 0) return null;

  return (
    <View style={[styles.container, { width: frameWidth, height: frameHeight }]}>
      <Image
        source={frames[currentFrameIndex]}
        style={{ width: frameWidth, height: frameHeight, borderRadius: 20 }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }
});
