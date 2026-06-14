/**
 * PharosSeal — the beacon/lighthouse seal (ported from screens2_foundations.jsx
 * `PharosSeal`). Concentric roundel · four light rays · bulb · lighthouse tower
 * with two window lines. Used for brand, app icon, and splash.
 */
import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { K } from '../theme';

export function PharosSeal({ size = 64, color = K.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* ruled roundel */}
      <Circle cx={32} cy={32} r={30} stroke={color} strokeWidth={1} opacity={0.5} fill="none" />
      <Circle cx={32} cy={32} r={25} stroke={color} strokeWidth={0.6} opacity={0.3} fill="none" />
      {/* beacon rays */}
      <Path d="M32 22 L21 13" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      <Path d="M32 22 L43 13" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      <Path d="M32 22 L15 22" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      <Path d="M32 22 L49 22" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      {/* bulb */}
      <Circle cx={32} cy={22} r={3.4} fill={color} />
      {/* lighthouse tower */}
      <Path
        d="M28 26 L36 26 L38 48 L26 48 Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="none"
      />
      {/* window lines */}
      <Line x1={27} y1={34} x2={37} y2={34} stroke={color} strokeWidth={1} />
      <Line x1={26.5} y1={41} x2={37.5} y2={41} stroke={color} strokeWidth={1} />
    </Svg>
  );
}
