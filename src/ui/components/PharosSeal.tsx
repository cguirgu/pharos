/**
 * PharosSeal — the beacon/lighthouse seal. Concentric roundel · four light rays ·
 * bulb · lighthouse tower with two window lines. Used for brand, app icon, splash.
 *
 * Pass `animated` to play an ignite sequence on mount: the rays draw outward, the
 * bulb glows, then the tower fades up — the opening/welcome screen and the
 * onboarding "lamp lit" finish use this. The static default is unchanged.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { useThemeColors } from '../useStyles';

const RAYS = ['M32 22 L21 13', 'M32 22 L43 13', 'M32 22 L15 22', 'M32 22 L49 22'];
const DASH = 22; // ≥ the longest ray, so offset DASH→0 draws each fully

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function PharosSeal({
  size = 64,
  color,
  animated = false,
  delay = 0,
}: {
  size?: number;
  color?: string;
  animated?: boolean;
  delay?: number;
}) {
  const t = useThemeColors();
  const stroke = color ?? t.gold;

  if (!animated) {
    return (
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {/* ruled roundel */}
        <Circle cx={32} cy={32} r={30} stroke={stroke} strokeWidth={1} opacity={0.5} fill="none" />
        <Circle cx={32} cy={32} r={25} stroke={stroke} strokeWidth={0.6} opacity={0.3} fill="none" />
        {/* beacon rays */}
        {RAYS.map((d, i) => (
          <Path key={i} d={d} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
        ))}
        {/* bulb */}
        <Circle cx={32} cy={22} r={3.4} fill={stroke} />
        {/* lighthouse tower */}
        <Path d="M28 26 L36 26 L38 48 L26 48 Z" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
        {/* window lines */}
        <Line x1={27} y1={34} x2={37} y2={34} stroke={stroke} strokeWidth={1} />
        <Line x1={26.5} y1={41} x2={37.5} y2={41} stroke={stroke} strokeWidth={1} />
      </Svg>
    );
  }

  return <AnimatedSeal size={size} stroke={stroke} delay={delay} />;
}

function AnimatedSeal({ size, stroke, delay }: { size: number; stroke: string; delay: number }) {
  // SVG props can't use the native driver — animate on the JS thread (cheap, brief).
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    p.setValue(0);
    Animated.timing(p, { toValue: 1, duration: 950, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [p, delay]);

  // A 0→1 ramp over the sub-window [a, b]; clamped flat before a and after b.
  const clamp = (a: number, b: number) =>
    p.interpolate({ inputRange: [a, b], outputRange: [0, 1], extrapolate: 'clamp' });

  const roundelOpacity = clamp(0, 0.3); // 0 → 1 over the first third
  const rayDraw = clamp(0, 0.45); // 0 → 1 (drives dashoffset + opacity)
  const rayOffset = rayDraw.interpolate({ inputRange: [0, 1], outputRange: [DASH, 0] });
  const rayOpacity = rayDraw.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] });
  const bulbProgress = clamp(0.35, 0.62);
  const bulbOpacity = bulbProgress;
  const bulbRadius = bulbProgress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 3.4] });
  const towerProgress = clamp(0.5, 0.85);

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <AnimatedCircle cx={32} cy={32} r={30} stroke={stroke} strokeWidth={1} opacity={Animated.multiply(roundelOpacity, 0.5)} fill="none" />
      <AnimatedCircle cx={32} cy={32} r={25} stroke={stroke} strokeWidth={0.6} opacity={Animated.multiply(roundelOpacity, 0.3)} fill="none" />
      {RAYS.map((d, i) => (
        <AnimatedPath
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeDasharray={DASH}
          strokeDashoffset={rayOffset}
          opacity={rayOpacity}
        />
      ))}
      <AnimatedCircle cx={32} cy={22} r={bulbRadius} fill={stroke} opacity={bulbOpacity} />
      <AnimatedPath
        d="M28 26 L36 26 L38 48 L26 48 Z"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="none"
        opacity={towerProgress}
      />
      <AnimatedPath d="M27 34 L37 34" stroke={stroke} strokeWidth={1} opacity={towerProgress} />
      <AnimatedPath d="M26.5 41 L37.5 41" stroke={stroke} strokeWidth={1} opacity={towerProgress} />
    </Svg>
  );
}
