import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate
} from 'react-native-reanimated';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Path,
  Circle,
  G,
  Filter,
  FeGaussianBlur
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VISUALIZER_SIZE = 340;
const CENTER = VISUALIZER_SIZE / 2;

interface AstroidSpectrumProps {
  isSpeaking: boolean;
}

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * High-performance Mathematical Harmonic Astroid & Diffraction Caustic Shader
 * Generates continuous 4-pointed radiant wave caustics similar to ChatGPT Voice & Apple Siri Glow.
 */
export const AstroidSpectrumVisualizer: React.FC<AstroidSpectrumProps> = ({ isSpeaking }) => {
  // Harmonic oscillation shared values running on native 60fps UI thread
  const t1 = useSharedValue(0);
  const t2 = useSharedValue(0);
  const voiceEnergy = useSharedValue(0.4);
  const pulseScale = useSharedValue(1);
  const rotationAngle = useSharedValue(0);
  const shimmerIntensity = useSharedValue(0.7);

  useEffect(() => {
    // 1. Primary harmonic wave oscillation
    t1.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3200, easing: Easing.linear }),
      -1,
      false
    );

    // 2. Secondary counter-harmonic wave oscillation
    t2.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4800, easing: Easing.linear }),
      -1,
      false
    );

    // 3. Subtle cosmic rotation
    rotationAngle.value = withRepeat(
      withTiming(360, { duration: 24000, easing: Easing.linear }),
      -1,
      false
    );

    // 4. Shimmering luminosity
    shimmerIntensity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Voice energy reactive modulation
    if (isSpeaking) {
      voiceEnergy.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 350, easing: Easing.out(Easing.quad) }),
          withTiming(0.65, { duration: 450, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.95, { duration: 380, easing: Easing.out(Easing.quad) }),
          withTiming(0.5, { duration: 500, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 400, easing: Easing.out(Easing.sin) }),
          withTiming(0.95, { duration: 400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      voiceEnergy.value = withTiming(0.3, { duration: 800 });
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.96, { duration: 2200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isSpeaking]);

  // Primary Caustic Astroid Star Path generator
  // Curve equation: Astroid / Lamé curve with cubic harmonic pinch:
  // Points at (CENTER, R), (R, CENTER), (CENTER, -R), (-R, CENTER) connected with hyperbolic inward concavity
  const generateAstroidPath = (rx: number, ry: number, pinch: number) => {
    const top = `${CENTER},${CENTER - ry}`;
    const right = `${CENTER + rx},${CENTER}`;
    const bottom = `${CENTER},${CENTER + ry}`;
    const left = `${CENTER - rx},${CENTER}`;

    const c1 = `${CENTER + rx * pinch},${CENTER - ry * pinch}`;
    const c2 = `${CENTER + rx * pinch},${CENTER + ry * pinch}`;
    const c3 = `${CENTER - rx * pinch},${CENTER + ry * pinch}`;
    const c4 = `${CENTER - rx * pinch},${CENTER - ry * pinch}`;

    return `M ${top} Q ${c1} ${right} Q ${c2} ${bottom} Q ${c3} ${left} Q ${c4} ${top} Z`;
  };

  const primaryAstroid = generateAstroidPath(155, 155, 0.16);
  const innerBrightAstroid = generateAstroidPath(110, 110, 0.22);
  const coreDiamond = generateAstroidPath(65, 65, 0.32);
  const microDiamond = generateAstroidPath(32, 32, 0.4);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${rotationAngle.value}deg` }
    ],
    opacity: shimmerIntensity.value,
  }));

  const verticalBeamStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: isSpeaking ? 1.0 + voiceEnergy.value * 0.45 : 1.0 },
      { scaleX: 1.0 + voiceEnergy.value * 0.15 }
    ],
    opacity: interpolate(voiceEnergy.value, [0.3, 1.0], [0.75, 1.0]),
  }));

  const horizontalBeamStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: isSpeaking ? 1.0 + voiceEnergy.value * 0.45 : 1.0 },
      { scaleY: 1.0 + voiceEnergy.value * 0.15 }
    ],
    opacity: interpolate(voiceEnergy.value, [0.3, 1.0], [0.75, 1.0]),
  }));

  const diagonalGlowStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: '45deg' },
      { scale: 0.85 + voiceEnergy.value * 0.25 }
    ],
    opacity: interpolate(voiceEnergy.value, [0.3, 1.0], [0.4, 0.8]),
  }));

  return (
    <View style={styles.container}>
      <Svg width={VISUALIZER_SIZE} height={VISUALIZER_SIZE} viewBox={`0 0 ${VISUALIZER_SIZE} ${VISUALIZER_SIZE}`}>
        <Defs>
          {/* Deep Volumetric Ambient Glow */}
          <RadialGradient id="deepAmbient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#D946EF" stopOpacity="0.75" />
            <Stop offset="25%" stopColor="#8B5CF6" stopOpacity="0.55" />
            <Stop offset="55%" stopColor="#1E3A8A" stopOpacity="0.25" />
            <Stop offset="85%" stopColor="#0F172A" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Primary Magenta-Violet Caustic Gradient */}
          <RadialGradient id="causticMagenta" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="12%" stopColor="#FDF2F8" stopOpacity="0.98" />
            <Stop offset="28%" stopColor="#F472B6" stopOpacity="0.9" />
            <Stop offset="55%" stopColor="#C084FC" stopOpacity="0.6" />
            <Stop offset="80%" stopColor="#6366F1" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
          </RadialGradient>

          {/* Cyan-Electric Light Ray Gradient */}
          <RadialGradient id="causticCyan" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="18%" stopColor="#E0F2FE" stopOpacity="0.95" />
            <Stop offset="45%" stopColor="#38BDF8" stopOpacity="0.75" />
            <Stop offset="75%" stopColor="#6366F1" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </RadialGradient>

          {/* Ultra-Bright Center Core */}
          <RadialGradient id="hyperCore" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="70%" stopColor="#FCE7F3" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
          </RadialGradient>

          {/* Horizontal Flare Gradient */}
          <LinearGradient id="horizFlare" x1="0%" y1="50%" x2="100%" y2="50%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
            <Stop offset="25%" stopColor="#60A5FA" stopOpacity="0.2" />
            <Stop offset="45%" stopColor="#F472B6" stopOpacity="0.85" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="55%" stopColor="#F472B6" stopOpacity="0.85" />
            <Stop offset="75%" stopColor="#60A5FA" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </LinearGradient>

          {/* Vertical Flare Gradient */}
          <LinearGradient id="vertFlare" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#C084FC" stopOpacity="0" />
            <Stop offset="25%" stopColor="#A855F7" stopOpacity="0.25" />
            <Stop offset="45%" stopColor="#F472B6" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="55%" stopColor="#F472B6" stopOpacity="0.9" />
            <Stop offset="75%" stopColor="#A855F7" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Ambient Volumetric Backdrop */}
        <Circle cx={CENTER} cy={CENTER} r={VISUALIZER_SIZE * 0.48} fill="url(#deepAmbient)" />

        {/* 45-deg Secondary Harmonic Diffraction Astroid */}
        <AnimatedG style={diagonalGlowStyle}>
          <Path d={generateAstroidPath(130, 130, 0.28)} fill="url(#causticCyan)" />
        </AnimatedG>

        {/* Rotating Harmonic Caustic Mesh */}
        <AnimatedG style={containerAnimatedStyle}>
          {/* Outer Astroid Envelope */}
          <Path d={primaryAstroid} fill="url(#causticMagenta)" />

          {/* Mid-range Radiant Astroid */}
          <Path d={innerBrightAstroid} fill="url(#causticCyan)" />

          {/* Core Diamond Astroid */}
          <Path d={coreDiamond} fill="url(#causticMagenta)" />
        </AnimatedG>

        {/* Vertical Diffraction Needle Spike */}
        <AnimatedG style={verticalBeamStyle}>
          <Path
            d={`M ${CENTER},10 L ${CENTER + 2.5},${CENTER} L ${CENTER},${VISUALIZER_SIZE - 10} L ${CENTER - 2.5},${CENTER} Z`}
            fill="url(#vertFlare)"
          />
        </AnimatedG>

        {/* Horizontal Diffraction Needle Spike */}
        <AnimatedG style={horizontalBeamStyle}>
          <Path
            d={`M 10,${CENTER} L ${CENTER},${CENTER - 2.5} L ${VISUALIZER_SIZE - 10},${CENTER} L ${CENTER},${CENTER + 2.5} Z`}
            fill="url(#horizFlare)"
          />
        </AnimatedG>

        {/* Ultra-Bright Center Fusion Star */}
        <Path d={microDiamond} fill="url(#hyperCore)" />
        <Circle cx={CENTER} cy={CENTER} r={9} fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: VISUALIZER_SIZE,
    height: VISUALIZER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
