/**
 * The lozenge mark motif — the only "icon" in the app (DESIGN-SPEC §1/§4).
 * Mark (practice status), Tally (progress strip), Dots (multi-part progress).
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { type Palette } from '../theme';
import { useStyles, useThemeColors } from '../useStyles';

export type MarkState = 'open' | 'part' | 'kept';

/**
 * A 45°-rotated square.
 *  - open: `rule` outline
 *  - part: half gold fill
 *  - kept: gold fill + small bg square at centre
 * Tap target should be ≥44px in the parent (DESIGN-SPEC §6).
 */
export function Mark({ state, size = 22 }: { state: MarkState; size?: number }) {
  const t = useThemeColors();
  const base = {
    width: size,
    height: size,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }] as const,
  };
  let glyph: React.ReactNode;
  if (state === 'open') {
    glyph = <View style={[base, { borderColor: t.rule }]} />;
  } else if (state === 'kept') {
    glyph = (
      <View style={[base, { borderColor: t.gold, backgroundColor: t.gold, alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: size * 0.28, height: size * 0.28, backgroundColor: t.bg }} />
      </View>
    );
  } else {
    // part — left half filled
    glyph = (
      <View style={[base, { borderColor: t.gold, overflow: 'hidden' }]}>
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: size / 2, backgroundColor: t.gold }} />
      </View>
    );
  }
  // Reserve the rotated bounding box (a 45° square's diagonal = size·√2) so the
  // diamond's points are never clipped by a flush ScrollView/row edge.
  const box = Math.ceil(size * 1.42);

  // A single confident "pop" the moment a mark becomes kept — a finite,
  // tactile-feeling settle (overshoot → rest). Skips the initial mount so
  // already-kept items don't all pop when the screen first renders.
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(state);
  useEffect(() => {
    if (prev.current !== 'kept' && state === 'kept') {
      scale.setValue(0.8);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 16,
      }).start();
    }
    prev.current = state;
  }, [state, scale]);

  return (
    <Animated.View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
      {glyph}
    </Animated.View>
  );
}

/**
 * A strip of thin rectangular cells; filled cells gold with an opacity ramp
 * (0.45→1 across the filled run), the `today` cell outlined.
 */
export function Tally({
  total,
  filled,
  today,
  w = 8,
  h = 16,
  gap = 3,
}: {
  total: number;
  filled: number;
  today?: number;
  w?: number;
  h?: number;
  gap?: number;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const cells = [];
  for (let i = 0; i < total; i++) {
    const isFilled = i < filled;
    const ramp = filled <= 1 ? 1 : 0.45 + (0.55 * i) / (filled - 1);
    const isToday = today === i;
    cells.push(
      <View
        key={i}
        style={{
          width: w,
          height: h,
          marginRight: i === total - 1 ? 0 : gap,
          backgroundColor: isFilled ? t.gold : 'transparent',
          opacity: isFilled ? ramp : 1,
          borderWidth: isFilled ? 0 : 1,
          borderColor: isToday ? t.gold : t.ruleDim,
        }}
      />,
    );
  }
  return <View style={styles.row}>{cells}</View>;
}

/** Small lozenges for multi-part progress (e.g. Agpeya 2 of 3). */
export function Dots({ total, filled, size = 6 }: { total: number; filled: number; size?: number }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(
      <View
        key={i}
        style={{
          width: size,
          height: size,
          marginLeft: i === 0 ? 0 : 5,
          transform: [{ rotate: '45deg' }],
          backgroundColor: i < filled ? t.gold : 'transparent',
          borderWidth: i < filled ? 0 : 1,
          borderColor: t.rule,
        }}
      />,
    );
  }
  return <View style={styles.row}>{dots}</View>;
}

const makeStyles = (t: Palette) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
