/**
 * Seal — the Coptic-cross roundel, echoing the app icon: ruled roundel · four
 * diamond accents · the Coptic Orthodox cross (four equal flared arms, each
 * ending in three points — twelve in all — around the central circle).
 *
 * Pass `animated` to play a kindle sequence on mount: the medallion glows, the
 * cross arms fade up, then the diamonds settle — the opening/welcome screen and
 * the onboarding "lamp lit" finish use this. The static default is unchanged.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useThemeColors } from '../useStyles';

/** The four arms of the Coptic cross: equal, flared, three-pointed ends. */
const ARMS = [
  'M 30.1 25 L 26.6 11.6 L 27 10 L 30.2 12.4 L 32 10 L 33.8 12.4 L 37 10 L 37.4 11.6 L 33.9 25 Z',
  'M 39 30.1 L 52.4 26.6 L 54 27 L 51.6 30.2 L 54 32 L 51.6 33.8 L 54 37 L 52.4 37.4 L 39 33.9 Z',
  'M 33.9 39 L 37.4 52.4 L 37 54 L 33.8 51.6 L 32 54 L 30.2 51.6 L 27 54 L 26.6 52.4 L 30.1 39 Z',
  'M 25 33.9 L 11.6 37.4 L 10 37 L 12.4 33.8 L 10 32 L 12.4 30.2 L 10 27 L 11.6 26.6 L 25 30.1 Z',
];
/** Diamond accents on the ring between the two circles, at the compass points. */
const DIAMONDS = [
  'M32 2.6 L33.9 4.5 L32 6.4 L30.1 4.5 Z',
  'M59.5 30.1 L61.4 32 L59.5 33.9 L57.6 32 Z',
  'M32 57.6 L33.9 59.5 L32 61.4 L30.1 59.5 Z',
  'M4.5 30.1 L6.4 32 L4.5 33.9 L2.6 32 Z',
];

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
        <Circle cx={32} cy={32} r={26} stroke={stroke} strokeWidth={0.6} opacity={0.3} fill="none" />
        {/* diamond accents */}
        {DIAMONDS.map((d, i) => (
          <Path key={i} d={d} fill={stroke} opacity={0.6} />
        ))}
        {/* the cross */}
        {ARMS.map((d, i) => (
          <Path key={i} d={d} fill={stroke} />
        ))}
        {/* center medallion */}
        <Circle cx={32} cy={32} r={4.4} stroke={stroke} strokeWidth={1.4} fill="none" />
        <Circle cx={32} cy={32} r={1.4} fill={stroke} />
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
  const dotRadius = medallionProgress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.4] });
  const armProgress = clamp(0.3, 0.7); // the cross rises out of the center
  const trimProgress = clamp(0.65, 0.92); // the diamonds settle last

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <AnimatedCircle cx={32} cy={32} r={30} stroke={stroke} strokeWidth={1} opacity={Animated.multiply(roundelOpacity, 0.5)} fill="none" />
      <AnimatedCircle cx={32} cy={32} r={26} stroke={stroke} strokeWidth={0.6} opacity={Animated.multiply(roundelOpacity, 0.3)} fill="none" />
      {DIAMONDS.map((d, i) => (
        <AnimatedPath key={i} d={d} fill={stroke} opacity={Animated.multiply(trimProgress, 0.6)} />
      ))}
      {ARMS.map((d, i) => (
        <AnimatedPath key={i} d={d} fill={stroke} opacity={armProgress} />
      ))}
      <AnimatedCircle cx={32} cy={32} r={4.4} stroke={stroke} strokeWidth={1.4} fill="none" opacity={medallionProgress} />
      <AnimatedCircle cx={32} cy={32} r={dotRadius} fill={stroke} opacity={medallionProgress} />
    </Svg>
  );
}
