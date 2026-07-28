/**
 * NavLedger — the bottom nav (DESIGN-SPEC §4, "Nav3").
 * 1px gold rule on top, equal columns (one per tab) divided by structural
 * hairlines, a lozenge indicator above the active label, caps labels (no icons).
 */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { type Palette } from '../theme';
import { useStyles, useThemeColors } from '../useStyles';
import { Caps } from './primitives';

export interface NavTab {
  key: string;
  label: string;
}

export function NavLedger({
  tabs,
  active,
  onPress,
}: {
  tabs: readonly NavTab[];
  active: string;
  onPress: (key: string) => void;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.bar}>
      {tabs.map((tab, i) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onPress(tab.key)}
            style={[styles.col, i > 0 && styles.divider]}
          >
            <View style={[styles.marker, { backgroundColor: isActive ? t.goldHi : 'transparent' }]} />
            <Caps size={9} ls={1.6} color={isActive ? t.goldHi : t.ink3}>
              {tab.label}
            </Caps>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: t.rule,
    backgroundColor: t.bg,
  },
  col: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 8, gap: 6 },
  divider: { borderLeftWidth: 1, borderLeftColor: t.ruleDim },
  marker: { width: 6, height: 6, transform: [{ rotate: '45deg' }] },
});
