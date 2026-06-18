/**
 * Count / parts check-in sheet (DESIGN-SPEC §4 Stepper + PRD §4.3). Slides up
 * over a dimmed backdrop; sharp corners; the only allowed shadow.
 */
import React, { useState } from 'react';
import { Modal, View, Pressable, Text, StyleSheet } from 'react-native';
import { font, space, type Palette } from './theme';
import { useStyles, useThemeColors } from './useStyles';
import { Caps, Rubric, Btn, Stepper, Tally, Mark } from './components';
import { copy } from './copy';
import type { Practice } from '../domain/rule';
import type { CivilDate } from '../domain/coptic';
import { useRule } from '../state/rule';
import { keptFeedback, tapFeedback } from '../platform/haptics';

export function CheckinSheet({
  practice,
  date,
  onClose,
}: {
  practice: Practice | null;
  date: CivilDate;
  onClose: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { logValue, logParts, logsFor } = useRule();
  const open = practice !== null;
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {practice ? (
          practice.measure === 'parts' ? (
            <PartsBody
              practice={practice}
              initial={logsFor(practice.id).find((l) => sameKey(l.date, date))?.parts ?? []}
              onDone={async (parts) => {
                await logParts(practice, date, parts);
                onClose();
              }}
              onClose={onClose}
            />
          ) : (
            <CountBody
              practice={practice}
              initial={logsFor(practice.id).find((l) => sameKey(l.date, date))?.value ?? 0}
              onLog={async (value) => {
                await logValue(practice, date, value);
                onClose();
              }}
              onClose={onClose}
            />
          )
        ) : null}
      </View>
    </Modal>
  );
}

function sameKey(a: CivilDate, b: CivilDate) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function CountBody({
  practice,
  initial,
  onLog,
  onClose,
}: {
  practice: Practice;
  initial: number;
  onLog: (value: number) => void;
  onClose: () => void;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const target = practice.target ?? 1;
  const [value, setValue] = useState(initial);
  const unit = practice.measure === 'duration' ? 'minutes' : 'of ' + target;
  return (
    <>
      <Rubric>{practice.name}</Rubric>
      <Stepper
        big
        value={value}
        unit={unit}
        onDec={() => setValue((v) => Math.max(0, v - 1))}
        onInc={() => setValue((v) => v + 1)}
      />
      <View style={{ height: 14 }} />
      <Tally total={target} filled={Math.min(value, target)} />
      <View style={{ height: 20 }} />
      <Btn kind="solid" onPress={() => { keptFeedback(); onLog(target); }}>
        {copy.checkin.keep}
      </Btn>
      <View style={{ height: 10 }} />
      <Btn kind="line" onPress={() => { tapFeedback(); onLog(value); }} disabled={value <= 0}>
        {copy.checkin.part}
      </Btn>
      <Pressable onPress={onClose} style={styles.close}>
        <Caps color={t.ink3}>{copy.checkin.cancel}</Caps>
      </Pressable>
    </>
  );
}

function PartsBody({
  practice,
  initial,
  onDone,
  onClose,
}: {
  practice: Practice;
  initial: readonly string[];
  onDone: (parts: string[]) => void;
  onClose: () => void;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const [done, setDone] = useState<string[]>([...initial]);
  const toggle = (part: string) =>
    setDone((d) => {
      const has = d.includes(part);
      if (has) tapFeedback();
      else keptFeedback(); // a part checked off → the finite pulse
      return has ? d.filter((x) => x !== part) : [...d, part];
    });
  return (
    <>
      <Rubric>{practice.name}</Rubric>
      {(practice.parts ?? []).map((part) => {
        const on = done.includes(part);
        return (
          <Pressable key={part} onPress={() => toggle(part)} style={styles.partRow}>
            <Mark state={on ? 'kept' : 'open'} />
            <Text style={[styles.partName, on && { color: t.ink3, textDecorationLine: 'line-through' }]}>
              {part}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ height: 18 }} />
      <Btn kind="solid" onPress={() => { keptFeedback(); onDone(done); }}>
        {copy.checkin.keep}
      </Btn>
      <Pressable onPress={onClose} style={styles.close}>
        <Caps color={t.ink3}>{copy.checkin.cancel}</Caps>
      </Pressable>
    </>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)' },
  sheet: {
    backgroundColor: t.bg2,
    paddingHorizontal: space.page,
    paddingTop: 18,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: t.rule,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  close: { alignItems: 'center', paddingVertical: 16 },
  partRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  partName: { fontFamily: font.display, fontSize: 20, color: t.parch },
});
