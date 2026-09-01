import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Ellipse,
  G
} from 'react-native-svg';

interface FaithMascotsProps {
  size?: number;
  variant?: 'cluster' | 'single_pink' | 'single_peach' | 'single_purple' | 'banner';
}

export const FaithMascots: React.FC<FaithMascotsProps> = ({
  size = 140,
  variant = 'cluster'
}) => {
  const width = size;
  const height = size * 0.65;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 240 160">
        <Defs>
          {/* Peach to Warm Apricot Gradient (Manna / Clover Mascot) */}
          <LinearGradient id="peachGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FDBA74" />
            <Stop offset="100%" stopColor="#FB923C" />
          </LinearGradient>

          {/* Rose Pink to Coral Fuchsia Gradient (Center Flower / Cloud) */}
          <LinearGradient id="pinkGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0%" stopColor="#C084FC" />
            <Stop offset="35%" stopColor="#F472B6" />
            <Stop offset="100%" stopColor="#FB7185" />
          </LinearGradient>

          {/* Lilac Violet to Lavender Gradient (Small Pebble Mascot) */}
          <LinearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#C084FC" />
            <Stop offset="100%" stopColor="#A855F7" />
          </LinearGradient>

          {/* Soft Airbrushed Rosy Blush Gradient */}
          <RadialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E11D48" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* ========================================================================= */}
        {/* 1. LEFT MASCOT: Soft Rounded Manna Loaf / 4-Lobe Pillow (Peach) */}
        {/* ========================================================================= */}
        <G transform="translate(10, 50)">
          {/* Organic Rounded 4-Lobe Clover / Bread Shape */}
          <Path
            d="M 42 12 
               C 56 12, 68 22, 68 36 
               C 68 42, 76 46, 82 52 
               C 92 62, 92 78, 80 88 
               C 70 96, 56 96, 46 96 
               C 34 96, 20 94, 12 84 
               C 2 72, 4 58, 12 48 
               C 16 40, 16 32, 22 22 
               C 28 12, 34 12, 42 12 Z"
            fill="url(#peachGrad)"
          />

          {/* Sleepy Peaceful Curved Closed Eyes (u_u) */}
          <Path
            d="M 32 54 Q 38 60 44 54"
            stroke="#1F2937"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 54 54 Q 60 60 66 54"
            stroke="#1F2937"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Happy Little Smile */}
          <Path
            d="M 38 68 Q 50 82 62 68"
            stroke="#1F2937"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* ========================================================================= */}
        {/* 2. CENTER MASCOT: 5-Petal Organic Cloud / Blossom (Pink / Fuchsia) */}
        {/* ========================================================================= */}
        <G transform="translate(75, 10)">
          {/* Smooth 5-Lobe Organic Blossom Shape */}
          <Path
            d="M 60 14 
               C 72 14, 82 24, 82 36 
               C 88 34, 102 40, 106 52 
               C 112 66, 104 80, 94 88 
               C 98 96, 94 110, 80 116 
               C 68 122, 52 120, 42 114 
               C 32 120, 18 116, 12 104 
               C 6 92, 10 82, 18 76 
               C 10 64, 14 48, 28 40 
               C 36 34, 46 36, 52 28 
               C 54 18, 56 14, 60 14 Z"
            fill="url(#pinkGrad)"
          />

          {/* Rosy Airbrushed Cheek Blushes */}
          <Ellipse cx="40" cy="78" rx="12" ry="7" fill="url(#blushGrad)" />
          <Ellipse cx="80" cy="78" rx="12" ry="7" fill="url(#blushGrad)" />

          {/* Sparkling Big Kawaii Eyes */}
          {/* Left Eye */}
          <Ellipse cx="42" cy="68" rx="7.5" ry="9" fill="#18181B" />
          <Circle cx="40" cy="65" r="3" fill="#FFFFFF" />
          <Circle cx="45" cy="72" r="1.5" fill="#FFFFFF" />

          {/* Right Eye */}
          <Ellipse cx="78" cy="68" rx="7.5" ry="9" fill="#18181B" />
          <Circle cx="76" cy="65" r="3" fill="#FFFFFF" />
          <Circle cx="81" cy="72" r="1.5" fill="#FFFFFF" />

          {/* Tiny Joyful Mouth */}
          <Path
            d="M 57 76 Q 60 81 63 76"
            stroke="#18181B"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* ========================================================================= */}
        {/* 3. RIGHT MASCOT: Playful Rounded Squircle Pebble (Lilac / Purple) */}
        {/* ========================================================================= */}
        <G transform="translate(170, 75)">
          {/* Soft Rounded Squircle Pebble */}
          <Path
            d="M 16 6 
               C 26 4, 38 8, 42 16 
               C 46 24, 44 36, 38 44 
               C 32 50, 20 52, 12 48 
               C 4 44, 0 34, 2 24 
               C 4 14, 8 8, 16 6 Z"
            fill="url(#purpleGrad)"
          />

          {/* Left Open Eye */}
          <Circle cx="18" cy="25" r="4.5" fill="#18181B" />
          <Circle cx="17" cy="23.5" r="1.8" fill="#FFFFFF" />

          {/* Right Playful Winking Eye (^_~) */}
          <Path
            d="M 28 26 Q 32 20 36 26"
            stroke="#18181B"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
    </View>
  );
};
