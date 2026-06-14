/**
 * Codex primitives — type, folios, rubricated headers, ruled registers.
 * Faithful to handoff/design refs/ds2.jsx. Sharp corners, hairlines, no emoji.
 */
import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle, type StyleProp } from 'react-native';
import { K, font } from '../theme';

/** ALL-CAPS letterspaced label — the workhorse (DESIGN-SPEC §3). */
export function Caps({
  children,
  color = K.ink3,
  size = 10.5,
  ls = 2.6,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  ls?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        { color, fontSize: size, letterSpacing: ls, fontFamily: font.caps, textTransform: 'uppercase' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Coptic ornament glyph. */
export function Copt({
  children,
  size = 14,
  color = K.gold,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[{ fontFamily: font.coptic, fontSize: size, color, lineHeight: size * 1.05 }, style]}>
      {children}
    </Text>
  );
}

/** Big engraved serif numeral (oldstyle figures where supported). */
export function Numeral({
  children,
  size = 64,
  color = K.parch,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        { fontFamily: font.display, fontSize: size, color, lineHeight: size * 0.9, fontVariant: ['oldstyle-nums'] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Small caps label inside a hairline box. */
export function Tag({ children, color = K.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <View style={styles.tag}>
      <Caps size={8.5} ls={1.6} color={color}>
        {children}
      </Caps>
    </View>
  );
}

/** Running head: caps-left (+ optional glyph), caps-right, gold rule beneath. */
export function Folio({
  left,
  right,
  glyph,
}: {
  left: string;
  right?: string;
  glyph?: string;
}) {
  return (
    <View style={styles.folio}>
      <View style={styles.folioRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          {glyph ? <Copt size={13} color={K.gold}>{glyph}</Copt> : null}
          <Caps color={K.ink2}>{left}</Caps>
        </View>
        {right ? <Caps color={K.ink3}>{right}</Caps> : null}
      </View>
      <View style={styles.folioRule} />
    </View>
  );
}

/** Section header: optional Coptic numeral (gold) + red caps + gold leader rule. */
export function Rubric({
  children,
  num,
  color = K.rubricHi,
  style,
}: {
  children: React.ReactNode;
  num?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.rubric, style]}>
      {num ? <Copt size={14} color={K.gold}>{num}</Copt> : null}
      <Caps color={color} size={10.5} ls={2.6}>
        {children}
      </Caps>
      <View style={styles.leader} />
    </View>
  );
}

/** A ruled table row between hairlines. */
export function Register({
  children,
  onTop = false,
  style,
}: {
  children: React.ReactNode;
  onTop?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.register, onTop && styles.registerTop, style]}>{children}</View>
  );
}

/** Ornamental divider: hairline · cross · hairline. */
export function Fleuron() {
  return (
    <View style={styles.fleuron}>
      <View style={styles.fleuronRule} />
      <Copt size={15} color={K.gold} style={{ marginHorizontal: 12 }}>
        ☩
      </Copt>
      <View style={styles.fleuronRule} />
    </View>
  );
}

/** Image placeholder: gold-tinted box, hairline border, centered caps. */
export function Plate({ h = 120, label = 'plate' }: { h?: number; label?: string }) {
  return (
    <View style={[styles.plate, { height: h }]}>
      <Caps color={K.ink3} size={9} ls={2}>
        {label}
      </Caps>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderColor: K.ruleDim,
    paddingVertical: 3,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
  },
  folio: { paddingTop: 4 },
  folioRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: 8,
    gap: 12,
  },
  folioRule: { height: 1, backgroundColor: K.rule },
  rubric: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 10 },
  leader: { flex: 1, height: 1, backgroundColor: K.rule, marginLeft: 4 },
  register: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: K.ruleDim,
  },
  registerTop: { borderTopWidth: 1, borderTopColor: K.ruleDim },
  fleuron: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  fleuronRule: { flex: 1, height: 1, backgroundColor: K.rule },
  plate: {
    borderWidth: 1,
    borderColor: K.rule,
    backgroundColor: K.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
