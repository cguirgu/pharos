/**
 * The lozenge mark motif — the only "icon" in Pharos (DESIGN-SPEC §1/§4).
 * Mark (practice status), Tally (progress strip), Dots (multi-part progress).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { K } from '../theme';

export type MarkState = 'open' | 'part' | 'kept';

/**
 * A 45°-rotated square.
 *  - open: `rule` outline
 *  - part: half gold fill
 *  - kept: gold fill + small bg square at centre
 * Tap target should be ≥44px in the parent (DESIGN-SPEC §6).
 */
export function Mark({ state, size = 22 }: { state: MarkState; size?: number }) {
  const base = {
    width: size,
    height: size,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }] as const,
  };
  if (state === 'open') {
    return <View style={[base, { borderColor: K.rule }]} />;
  }
  if (state === 'kept') {
    return (
      <View style={[base, { borderColor: K.gold, backgroundColor: K.gold, alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: size * 0.28, height: size * 0.28, backgroundColor: K.bg }} />
      </View>
    );
  }
  // part — left half filled
  return (
    <View style={[base, { borderColor: K.gold, overflow: 'hidden' }]}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: size / 2, backgroundColor: K.gold }} />
    </View>
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
          backgroundColor: isFilled ? K.gold : 'transparent',
          opacity: isFilled ? ramp : 1,
          borderWidth: isFilled ? 0 : 1,
          borderColor: isToday ? K.gold : K.ruleDim,
        }}
      />,
    );
  }
  return <View style={styles.row}>{cells}</View>;
}

/** Small lozenges for multi-part progress (e.g. Agpeya 2 of 3). */
export function Dots({ total, filled, size = 6 }: { total: number; filled: number; size?: number }) {
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
          backgroundColor: i < filled ? K.gold : 'transparent',
          borderWidth: i < filled ? 0 : 1,
          borderColor: K.rule,
        }}
      />,
    );
  }
  return <View style={styles.row}>{dots}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
