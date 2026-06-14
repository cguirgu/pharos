/**
 * Form helpers for auth & onboarding: a diamond step indicator and a labelled
 * text field, both in the codex language.
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { K, font } from '../theme';
import { Caps } from './primitives';

/** Diamond step indicator: ◇ ─ ◇ ─ ◇ (active steps filled). */
export function StepDots({ total, active }: { total: number; active: number }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const on = i <= active;
    if (i > 0) items.push(<View key={`r${i}`} style={styles.stepRule} />);
    items.push(
      <View
        key={`d${i}`}
        style={[
          styles.diamond,
          on ? { backgroundColor: K.gold } : { borderWidth: 1, borderColor: K.rule },
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
  return (
    <View style={styles.field}>
      <Caps size={8.5} ls={1.6} color={K.ink2}>
        {label}
      </Caps>
      <TextInput
        placeholderTextColor={K.ink3}
        style={styles.input}
        selectionColor={K.gold}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 26 },
  diamond: { width: 8, height: 8, transform: [{ rotate: '45deg' }] },
  stepRule: { width: 22, height: 1, backgroundColor: K.ruleDim },
  field: { marginTop: 18, gap: 8 },
  input: {
    fontFamily: font.body,
    fontSize: 17,
    color: K.parch,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: K.ruleDim,
  },
});
