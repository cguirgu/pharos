/**
 * Form helpers for auth & onboarding: a diamond step indicator and a labelled
 * text field, both in the codex language.
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { font, type Palette } from '../theme';
import { useStyles, useThemeColors } from '../useStyles';
import { Caps } from './primitives';

/** Diamond step indicator: ◇ ─ ◇ ─ ◇ (active steps filled). */
export function StepDots({ total, active }: { total: number; active: number }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const items: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const on = i <= active;
    if (i > 0) items.push(<View key={`r${i}`} style={styles.stepRule} />);
    items.push(
      <View
        key={`d${i}`}
        style={[
          styles.diamond,
          on ? { backgroundColor: t.gold } : { borderWidth: 1, borderColor: t.rule },
        ]}
      />,
    );
  }
  return <View style={styles.steps}>{items}</View>;
}

/** A labelled text input (caps label + ruled field). */
export function Field({
  label,
  ...props
}: { label: string } & TextInputProps) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.field}>
      <Caps size={8.5} ls={1.6} color={t.ink2}>
        {label}
      </Caps>
      <TextInput
        placeholderTextColor={t.ink3}
        style={styles.input}
        selectionColor={t.gold}
        {...props}
      />
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 26 },
  diamond: { width: 8, height: 8, transform: [{ rotate: '45deg' }] },
  stepRule: { width: 22, height: 1, backgroundColor: t.ruleDim },
  field: { marginTop: 18, gap: 8 },
  input: {
    fontFamily: font.body,
    fontSize: 17,
    color: t.parch,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: t.ruleDim,
  },
});
