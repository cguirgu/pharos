/**
 * NavLedger — the bottom nav (DESIGN-SPEC §4, "Nav3").
 * 1px gold rule on top, 5 equal columns divided by structural hairlines, a
 * lozenge indicator above the active label, caps labels (no icons).
 */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { K } from '../theme';
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
  return (
    <View style={styles.bar}>
      {tabs.map((t, i) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onPress(t.key)}
            style={[styles.col, i > 0 && styles.divider]}
          >
            <View style={[styles.marker, { backgroundColor: isActive ? K.goldHi : 'transparent' }]} />
            <Caps size={9} ls={1.6} color={isActive ? K.goldHi : K.ink3}>
              {t.label}
            </Caps>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: K.rule,
    backgroundColor: K.bg,
  },
  col: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 8, gap: 6 },
  divider: { borderLeftWidth: 1, borderLeftColor: K.ruleDim },
  marker: { width: 6, height: 6, transform: [{ rotate: '45deg' }] },
});
