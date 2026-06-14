/**
 * Hidden dev date-override (only rendered when __DEV__). Lets you/Claude jump
 * to any date on-device to verify fasts & feasts — the golden dates from the
 * kickoff prompt are one tap away. Never shipped to users.
 */
import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { K } from './theme';
import { Caps } from './components';
import { useClock } from '../state/clock';
import { addDays, type CivilDate } from '../domain/coptic';

const GOLDEN: { label: string; date: CivilDate }[] = [
  { label: 'Apostles', date: { year: 2026, month: 6, day: 10 } },
  { label: 'Pascha', date: { year: 2026, month: 4, day: 12 } },
  { label: 'Holy 50', date: { year: 2026, month: 4, day: 29 } },
  { label: 'Nativity', date: { year: 2026, month: 12, day: 25 } },
  { label: 'Nayrouz', date: { year: 2026, month: 9, day: 11 } },
];

export function DevDate() {
  const { today, override, setOverride, clearOverride } = useClock();
  if (!__DEV__) return null;

  return (
    <View style={styles.bar}>
      <Caps size={8.5} ls={1.4} color={override ? K.rubricHi : K.ink3}>
        {override ? 'DEV DATE' : 'DEV'}
      </Caps>
      <Pressable hitSlop={8} onPress={() => setOverride(addDays(today, -1))}>
        <Caps size={11} ls={1} color={K.ink2}>−1d</Caps>
      </Pressable>
      <Pressable hitSlop={8} onPress={() => setOverride(addDays(today, 1))}>
        <Caps size={11} ls={1} color={K.ink2}>+1d</Caps>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, alignItems: 'center' }}>
        {GOLDEN.map((g) => (
          <Pressable key={g.label} hitSlop={6} onPress={() => setOverride(g.date)}>
            <Caps size={9} ls={1} color={K.goldHi}>{g.label}</Caps>
          </Pressable>
        ))}
        {override ? (
          <Pressable hitSlop={6} onPress={clearOverride}>
            <Caps size={9} ls={1} color={K.rubricHi}>RESET</Caps>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 26,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: K.ruleDim,
  },
});
