/**
 * Lighten the rule (PRD §4.5): Rest Day · pause · lighter rule. "Tend, don't
 * storm." Rest days keep the flame lit.
 */
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { font, space, type Palette } from './theme';
import { useStyles, useThemeColors } from './useStyles';
import { Caps, Rubric, Toggle } from './components';
import { copy } from './copy';
import { useClock } from '../state/clock';
import { useRule } from '../state/rule';
import { dateKey } from '../domain/rule';

export function LightenSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const today = useClock((s) => s.today);
  const { restDays, setRestDay } = useRule();
  const resting = restDays.has(dateKey(today));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Rubric>{copy.lighten.title}</Rubric>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{copy.lighten.rest}</Text>
            <Caps size={8.5} ls={1.2} color={t.ink3}>
              {copy.lighten.note}
            </Caps>
          </View>
          <Toggle value={resting} onChange={(v) => setRestDay(today, v)} />
        </View>

        <RowSoon label={copy.lighten.pause} />
        <RowSoon label={copy.lighten.lighter} />

        <Pressable onPress={onClose} style={styles.close}>
          <Caps color={t.ink3}>{copy.checkin.cancel}</Caps>
        </Pressable>
      </View>
    </Modal>
  );
}

function RowSoon({ label }: { label: string }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={[styles.row, { opacity: 0.5 }]}>
      <Text style={styles.label}>{label}</Text>
      <Caps size={8.5} ls={1.4} color={t.ink3}>
        {copy.placeholder.soon}
      </Caps>
    </View>
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
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  label: { fontFamily: font.display, fontSize: 19, color: t.parch },
  close: { alignItems: 'center', paddingVertical: 16 },
});
