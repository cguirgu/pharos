/**
 * Codex primitives — type, folios, rubricated headers, ruled registers.
 * Faithful to handoff/design refs/ds2.jsx. Sharp corners, hairlines, no emoji.
 *
 * Colours come from the active theme: default colour props resolve via
 * `useThemeColors()` (so `color ?? t.x` reacts to light/dark), and style blocks
 * are built per-palette through `useStyles(makeStyles)`.
 */
import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle, type StyleProp } from 'react-native';
import { font, type Palette } from '../theme';
import { useStyles, useThemeColors } from '../useStyles';

/** ALL-CAPS letterspaced label — the workhorse (DESIGN-SPEC §3). */
export function Caps({
  children,
  color,
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
  const t = useThemeColors();
  return (
    <Text
      style={[
        { color: color ?? t.ink3, fontSize: size, letterSpacing: ls, fontFamily: font.caps, textTransform: 'uppercase' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Coptic ornament glyph. Pass `fit` to shrink long words onto one line. */
export function Copt({
  children,
  size = 14,
  color,
  style,
  fit = false,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  /** Auto-shrink to fit one line (for long Coptic words). */
  fit?: boolean;
}) {
  const t = useThemeColors();
  return (
    <Text
      numberOfLines={fit ? 1 : undefined}
      adjustsFontSizeToFit={fit || undefined}
      minimumFontScale={fit ? 0.4 : undefined}
      // A fixed lineHeight fights adjustsFontSizeToFit, so omit it when fitting.
      style={[{ fontFamily: font.coptic, fontSize: size, color: color ?? t.gold }, !fit && { lineHeight: size * 1.05 }, style]}
    >
      {children}
    </Text>
  );
}

/** Big engraved serif numeral (oldstyle figures where supported). */
export function Numeral({
  children,
  size = 64,
  color,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  const t = useThemeColors();
  return (
    <Text
      style={[
        { fontFamily: font.display, fontSize: size, color: color ?? t.parch, lineHeight: size * 0.9, fontVariant: ['oldstyle-nums'] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Small caps label inside a hairline box. */
export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.tag}>
      <Caps size={8.5} ls={1.6} color={color ?? t.gold}>
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
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.folio}>
      <View style={styles.folioRow}>
        <View style={styles.folioLeft}>
          {glyph ? <Copt size={12} color={t.gold} style={{ marginTop: 1 }}>{glyph}</Copt> : null}
          <Caps color={t.ink2} size={9.5} ls={1.5} style={{ flexShrink: 1 }}>{left}</Caps>
        </View>
        {right ? (
          <Caps color={t.ink3} size={9.5} ls={1.5} style={styles.folioRight}>
            {right}
          </Caps>
        ) : null}
      </View>
      <View style={styles.folioRule} />
    </View>
  );
}

/** Section header: optional Coptic numeral (gold) + red caps + gold leader rule. */
export function Rubric({
  children,
  num,
  color,
  style,
}: {
  children: React.ReactNode;
  num?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={[styles.rubric, style]}>
      {num ? <Copt size={14} color={t.gold}>{num}</Copt> : null}
      <Caps color={color ?? t.rubricHi} size={10.5} ls={2.6}>
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
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.register, onTop && styles.registerTop, style]}>{children}</View>
  );
}

/** Ornamental divider: hairline · cross · hairline. */
export function Fleuron() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.fleuron}>
      <View style={styles.fleuronRule} />
      <Copt size={15} color={t.gold} style={{ marginHorizontal: 12 }}>
        ☩
      </Copt>
      <View style={styles.fleuronRule} />
    </View>
  );
}

/** Image placeholder: gold-tinted box, hairline border, centered caps. */
export function Plate({ h = 120, label = 'plate' }: { h?: number; label?: string }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={[styles.plate, { height: h }]}>
      <Caps color={t.ink3} size={9} ls={2}>
        {label}
      </Caps>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderColor: t.ruleDim,
    paddingVertical: 3,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
  },
  folio: { paddingTop: 4 },
  folioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 8,
    gap: 16,
  },
  folioLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexShrink: 1 },
  folioRight: { flexShrink: 1, textAlign: 'right', maxWidth: '46%' },
  folioRule: { height: 1, backgroundColor: t.rule },
  rubric: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 10 },
  leader: { flex: 1, height: 1, backgroundColor: t.rule, marginLeft: 4 },
  register: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: t.ruleDim,
  },
  registerTop: { borderTopWidth: 1, borderTopColor: t.ruleDim },
  fleuron: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  fleuronRule: { flex: 1, height: 1, backgroundColor: t.rule },
  plate: {
    borderWidth: 1,
    borderColor: t.rule,
    backgroundColor: t.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
