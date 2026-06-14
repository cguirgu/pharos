/**
 * Codex controls: Btn, Chip, Segmented, Stepper, Toggle (DESIGN-SPEC §4).
 * Rectangular everything; toggles are rails with square thumbs; no iOS blue.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { K, font } from '../theme';
import { Caps, Numeral } from './primitives';

type BtnKind = 'solid' | 'line' | 'rubric';

/** Full-width letterpress button. */
export function Btn({
  children,
  kind = 'line',
  onPress,
  style,
  disabled,
}: {
  children: React.ReactNode;
  kind?: BtnKind;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const palette = {
    solid: { bg: K.gold, border: K.gold, text: K.onGold },
    line: { bg: 'transparent', border: K.rule, text: K.goldHi },
    rubric: { bg: 'transparent', border: 'rgba(184,69,58,0.5)', text: K.rubricHi },
  }[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: palette.text }]}>{children}</Text>
    </Pressable>
  );
}

/** Weekday / option cell: hairline box; selected = gold border + wash + goldHi. */
export function Chip({
  children,
  on = false,
  wide = false,
  onPress,
}: {
  children: React.ReactNode;
  on?: boolean;
  wide?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        wide && { paddingHorizontal: 16 },
        on ? { borderColor: K.gold, backgroundColor: K.selWashHi } : { borderColor: K.ruleDim },
      ]}
    >
      <Caps size={10} ls={1.4} color={on ? K.goldHi : K.ink3}>
        {children}
      </Caps>
    </Pressable>
  );
}

/** Hairline-divided segmented control; active segment solid gold with dark text. */
export function Segmented({
  options,
  active,
  onChange,
}: {
  options: readonly { key: string; label: string }[];
  active: string;
  onChange?: (key: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o, i) => {
        const isActive = o.key === active;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange?.(o.key)}
            style={[
              styles.segment,
              i > 0 && { borderLeftWidth: 1, borderLeftColor: K.rule },
              isActive && { backgroundColor: K.gold },
            ]}
          >
            <Caps size={10} ls={1.8} color={isActive ? K.onGold : K.ink2}>
              {o.label}
            </Caps>
          </Pressable>
        );
      })}
    </View>
  );
}

/** − / value+unit / + box (58px tall; sheet variant passes a bigger numeral). */
export function Stepper({
  value,
  unit,
  onDec,
  onInc,
  big = false,
}: {
  value: number;
  unit?: string;
  onDec?: () => void;
  onInc?: () => void;
  big?: boolean;
}) {
  const btn = big ? 54 : 46;
  const numSize = big ? 84 : 30;
  return (
    <View style={[styles.stepper, { height: big ? 120 : 58 }]}>
      <Pressable onPress={onDec} style={[styles.stepBtn, { width: btn }]} hitSlop={8}>
        <Text style={styles.stepSign}>−</Text>
      </Pressable>
      <View style={styles.stepValue}>
        <Numeral size={numSize} color={K.goldHi}>
          {String(value)}
        </Numeral>
        {unit ? (
          <Caps size={9} ls={1.6} color={K.ink2} style={{ marginTop: 4 }}>
            {unit}
          </Caps>
        ) : null}
      </View>
      <Pressable onPress={onInc} style={[styles.stepBtn, { width: btn }]} hitSlop={8}>
        <Text style={styles.stepSign}>＋</Text>
      </Pressable>
    </View>
  );
}

/** 46×22 rectangular rail with a square 18px thumb. */
export function Toggle({ value, onChange }: { value: boolean; onChange?: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange?.(!value)}
      style={[
        styles.toggle,
        value ? { borderColor: K.gold, backgroundColor: K.selWashHi } : { borderColor: K.ruleDim },
      ]}
    >
      <View
        style={[
          styles.thumb,
          { alignSelf: value ? 'flex-end' : 'flex-start', backgroundColor: value ? K.gold : K.ink3 },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: font.caps,
    fontSize: 11.5,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: K.rule,
  },
  segment: { flex: 1, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: K.rule,
  },
  stepBtn: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  stepSign: { color: K.goldHi, fontSize: 26, fontFamily: font.display },
  stepValue: { flex: 1, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: K.rule, alignSelf: 'stretch' },
  toggle: {
    width: 46,
    height: 22,
    borderWidth: 1,
    padding: 1,
    justifyContent: 'center',
  },
  thumb: { width: 18, height: 18 },
});
