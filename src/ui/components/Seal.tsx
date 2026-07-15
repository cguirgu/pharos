/**
 * Seal — the Coptic-cross roundel, echoing the app icon: ruled roundel · four
 * diamond accents · flared cross · center medallion. Used for brand imagery.
 *
 * Pass `animated` to play a kindle sequence on mount: the medallion glows, the
 * cross arms draw outward, then the flares and diamonds fade up — the
 * opening/welcome screen and the onboarding "lamp lit" finish use this.
 * The static default is unchanged.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useThemeColors } from '../useStyles';

/** The four cross arms, drawn outward from the center medallion. */
const ARMS = ['M32 27 L32 16', 'M32 37 L32 48', 'M27 32 L16 32', 'M37 32 L48 32'];
/** Perpendicular end-caps that flare each arm (cross formée, in line art). */
const CAPS = ['M28.8 16 L35.2 16', 'M28.8 48 L35.2 48', 'M16 28.8 L16 35.2', 'M48 28.8 L48 35.2'];
/** Diamond accents on the ring between the two circles, at the compass points. */
const DIAMONDS = [
  'M32 2.6 L33.9 4.5 L32 6.4 L30.1 4.5 Z',
  'M59.5 30.1 L61.4 32 L59.5 33.9 L57.6 32 Z',
  'M32 57.6 L33.9 59.5 L32 61.4 L30.1 59.5 Z',
  'M4.5 30.1 L6.4 32 L4.5 33.9 L2.6 32 Z',
];
const DASH = 12; // ≥ the arm length, so offset DASH→0 draws each fully

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function Seal({
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
        {/* diamond accents */}
        {DIAMONDS.map((d, i) => (
          <Path key={i} d={d} fill={stroke} opacity={0.6} />
        ))}
        {/* cross arms + flared caps */}
        {ARMS.map((d, i) => (
          <Path key={i} d={d} stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
        ))}
        {CAPS.map((d, i) => (
          <Path key={i} d={d} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
        ))}
        {/* center medallion */}
        <Circle cx={32} cy={32} r={4.6} stroke={stroke} strokeWidth={1.2} fill="none" />
        <Circle cx={32} cy={32} r={1.3} fill={stroke} />
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
  const medallionProgress = clamp(0.15, 0.45); // the center kindles first
  const dotRadius = medallionProgress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.3] });
  const armDraw = clamp(0.3, 0.65); // the arms draw outward from the center
  const armOffset = armDraw.interpolate({ inputRange: [0, 1], outputRange: [DASH, 0] });
  const trimProgress = clamp(0.6, 0.9); // flares + diamonds settle last

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <AnimatedCircle cx={32} cy={32} r={30} stroke={stroke} strokeWidth={1} opacity={Animated.multiply(roundelOpacity, 0.5)} fill="none" />
      <AnimatedCircle cx={32} cy={32} r={25} stroke={stroke} strokeWidth={0.6} opacity={Animated.multiply(roundelOpacity, 0.3)} fill="none" />
      {DIAMONDS.map((d, i) => (
        <AnimatedPath key={i} d={d} fill={stroke} opacity={Animated.multiply(trimProgress, 0.6)} />
      ))}
      {ARMS.map((d, i) => (
        <AnimatedPath
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray={DASH}
          strokeDashoffset={armOffset}
          opacity={armDraw}
        />
      ))}
      {CAPS.map((d, i) => (
        <AnimatedPath key={i} d={d} stroke={stroke} strokeWidth={1.2} strokeLinecap="round" opacity={trimProgress} />
      ))}
      <AnimatedCircle cx={32} cy={32} r={4.6} stroke={stroke} strokeWidth={1.2} fill="none" opacity={medallionProgress} />
      <AnimatedCircle cx={32} cy={32} r={dotRadius} fill={stroke} opacity={medallionProgress} />
    </Svg>
  );
}
