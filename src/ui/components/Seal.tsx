/**
 * Seal — the app emblem: the Coptic Orthodox cross of the app icon, traced
 * 1:1 from assets/icon.png (see sealPaths.ts). Interlaced arms, rosette
 * medallion, ruled circle with diamond accents — the exact icon artwork,
 * recolorable to the theme gold.
 *
 * Pass `animated` to kindle it on mount (fade + slight settle) — the
 * opening/welcome screen and the onboarding "lamp lit" finish use this.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useThemeColors } from '../useStyles';
import { SEAL_PATHS } from './sealPaths';

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
  const fill = color ?? t.gold;

  const emblem = (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <G transform="translate(0,1024) scale(1,-1)">
        {SEAL_PATHS.map((d, i) => (
          <Path key={i} d={d} fill={fill} />
        ))}
      </G>
    </Svg>
  );

  if (!animated) return emblem;
  return (
    <KindleIn delay={delay} size={size}>
      {emblem}
    </KindleIn>
  );
}

/** Fade + settle the emblem into place (drives the wrapper, so the intricate
 *  traced SVG never re-renders during the animation — native driver, cheap). */
function KindleIn({ children, delay, size }: { children: React.ReactNode; delay: number; size: number }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    p.setValue(0);
    Animated.timing(p, { toValue: 1, duration: 950, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [p, delay]);
  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  return (
    <Animated.View style={{ width: size, height: size, opacity: p, transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}
