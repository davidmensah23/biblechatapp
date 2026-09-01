import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  Ellipse,
  G,
  Rect
} from 'react-native-svg';

export type VectorActionType = 'walk_bread' | 'wave_cloud' | 'read_rock';

interface VectorSpriteSequencerProps {
  action?: VectorActionType;
  fps?: number; // 2 to 5 frames per second
  size?: number;
}

export const VectorSpriteSequencer: React.FC<VectorSpriteSequencerProps> = ({
  action = 'walk_bread',
  fps = 3,
  size = 110
}) => {
  const [frame, setFrame] = useState(0);
  const totalFrames = 4;
  const intervalMs = Math.floor(1000 / fps);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % totalFrames);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [fps, intervalMs]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          {/* Peach to Warm Apricot Gradient (Manna Bread) */}
          <LinearGradient id="breadGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FDBA74" />
            <Stop offset="100%" stopColor="#FB923C" />
          </LinearGradient>

          {/* Sky Blue to Candy Pink Gradient (Cotton Cloud) */}
          <LinearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#BAE6FD" />
            <Stop offset="60%" stopColor="#FBCFE8" />
            <Stop offset="100%" stopColor="#F472B6" />
          </LinearGradient>

          {/* Emerald to Sage Green Gradient (Shepherd Rock) */}
          <LinearGradient id="rockGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#86EFAC" />
            <Stop offset="100%" stopColor="#34D399" />
          </LinearGradient>

          {/* Golden Scripture Radiance */}
          <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>
        </Defs>

        {/* ========================================================================= */}
        {/* ACTION 1: 4-FRAME WALK CYCLE (Manna Bread) */}
        {/* ========================================================================= */}
        {action === 'walk_bread' && (
          <G transform={`translate(20, ${frame === 1 ? 14 : frame === 3 ? 24 : 20})`}>
            {/* Animated Feet / Walking Shadow */}
            <Ellipse
              cx={frame === 0 ? 32 : frame === 2 ? 48 : 40}
              cy="74"
              rx={frame === 1 ? "18" : "24"}
              ry="4"
              fill="rgba(0,0,0,0.06)"
            />

            {/* Left Foot */}
            <Path
              d={frame === 0 ? "M 28 66 Q 22 76 28 80" : frame === 2 ? "M 34 66 Q 34 72 34 76" : "M 30 66 Q 26 74 30 78"}
              stroke="#EA580C"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Right Foot */}
            <Path
              d={frame === 2 ? "M 52 66 Q 58 76 52 80" : frame === 0 ? "M 46 66 Q 46 72 46 76" : "M 50 66 Q 54 74 50 78"}
              stroke="#EA580C"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Bread Body with Walking Tilt */}
            <G transform={`rotate(${frame === 0 ? -4 : frame === 2 ? 4 : 0}, 40, 40)`}>
              <Path
                d="M 22 14 C 36 10, 50 10, 60 18 C 70 26, 72 42, 64 56 C 56 68, 30 68, 18 56 C 8 44, 10 20, 22 14 Z"
                fill="url(#breadGrad)"
              />

              {/* Eyes (Open in Step 0 & 2, Winking in Step 1, Smiling closed in Step 3) */}
              {frame === 1 ? (
                <>
                  <Path d="M 28 34 Q 33 30 38 34" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <Circle cx="50" cy="33" r="3" fill="#18181B" />
                </>
              ) : (
                <>
                  <Path d="M 28 34 Q 33 39 38 34" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <Path d="M 44 34 Q 49 39 54 34" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
              )}

              {/* Cheerful Mouth */}
              <Path
                d={frame === 1 ? "M 36 44 Q 41 52 46 44" : "M 37 45 Q 41 49 45 45"}
                stroke="#18181B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </G>
          </G>
        )}

        {/* ========================================================================= */}
        {/* ACTION 2: 4-FRAME WAVE CYCLE (Joyful Cloud) */}
        {/* ========================================================================= */}
        {action === 'wave_cloud' && (
          <G transform={`translate(15, ${frame === 1 || frame === 2 ? 18 : 22})`}>
            {/* Cloud Body */}
            <Path
              d="M 30 20 C 40 12, 58 14, 66 22 C 76 18, 88 28, 84 40 C 90 52, 78 66, 68 66 C 52 68, 28 68, 18 56 C 8 46, 12 28, 30 20 Z"
              fill="url(#cloudGrad)"
            />

            {/* Cheeks */}
            <Circle cx="32" cy="44" r="5" fill="#F43F5E" opacity="0.3" />
            <Circle cx="64" cy="44" r="5" fill="#F43F5E" opacity="0.3" />

            {/* Eyes (Blinking in Frame 2) */}
            {frame === 2 ? (
              <>
                <Path d="M 32 38 Q 36 34 40 38" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <Path d="M 56 38 Q 60 34 64 38" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                <Circle cx="36" cy="36" r="3.5" fill="#18181B" />
                <Circle cx="35" cy="35" r="1.2" fill="#FFFFFF" />
                <Circle cx="60" cy="36" r="3.5" fill="#18181B" />
                <Circle cx="59" cy="35" r="1.2" fill="#FFFFFF" />
              </>
            )}

            {/* Mouth */}
            <Path d="M 44 45 Q 48 51 52 45" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Animated Waving Hand */}
            <G transform={`translate(74, 30) rotate(${frame === 0 ? -10 : frame === 1 ? -35 : frame === 2 ? -15 : -40})`}>
              <Path d="M 0 0 C 6 -4, 14 2, 10 8 C 6 12, 0 8, 0 0 Z" fill="#F472B6" />
            </G>

            {/* Twinkle Sparkle during Wave */}
            {(frame === 1 || frame === 2) && (
              <G transform="translate(86, 14)">
                <Path d="M 4 0 L 5 3 L 8 4 L 5 5 L 4 8 L 3 5 L 0 4 L 3 3 Z" fill="#F59E0B" />
              </G>
            )}
          </G>
        )}

        {/* ========================================================================= */}
        {/* ACTION 3: 4-FRAME BIBLE READING CYCLE (Shepherd Rock) */}
        {/* ========================================================================= */}
        {action === 'read_rock' && (
          <G transform="translate(25, 20)">
            {/* Rock Body */}
            <Path
              d="M 35 12 C 50 12, 65 24, 65 44 C 65 62, 54 70, 35 70 C 16 70, 5 62, 5 44 C 5 24, 20 12, 35 12 Z"
              fill="url(#rockGrad)"
            />

            {/* Eyebrows */}
            <Path d="M 22 28 Q 28 25 32 28" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M 38 28 Q 42 25 48 28" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Looking Down at Bible Eyes */}
            <Circle cx="28" cy="36" r="3" fill="#18181B" />
            <Circle cx="42" cy="36" r="3" fill="#18181B" />

            {/* Smile */}
            <Path d="M 32 44 Q 35 48 38 44" stroke="#18181B" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Holy Bible Book in Hands */}
            <G transform="translate(18, 50)">
              {/* Gold Radiance */}
              <Circle cx="18" cy="8" r="14" fill="url(#goldGrad)" opacity={frame === 1 || frame === 2 ? "0.35" : "0.15"} />

              {/* Book Cover */}
              <Rect x="2" y="2" width="32" height="20" rx="3" fill="#1E3A8A" />
              {/* Book Pages */}
              <Rect x="4" y="4" width="13" height="16" rx="1" fill="#FFFFFF" />
              <Rect x="19" y="4" width="13" height="16" rx="1" fill="#FFFFFF" />
              {/* Cross on Page */}
              <Path d="M 10 8 L 10 16 M 7 11 L 13 11" stroke="#D97706" strokeWidth="1.2" />

              {/* Animated Turning Page (Frame 1 & 2) */}
              {(frame === 1 || frame === 2) && (
                <Path d="M 17 4 Q 22 2 24 18" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
              )}
            </G>
          </G>
        )}
      </Svg>
    </View>
  );
};
