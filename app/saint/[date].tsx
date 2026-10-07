/**
 * The commemoration of the day — every saint and feast the Church remembers on
 * this Coptic day, with the day's written account when its translation is
 * licensed.
 *
 * Two tiers (see `src/content/flags.ts`): the commemorations are a calendar of
 * facts and always render; the account is gated by `CONTENT_LICENSED` and is
 * already blanked in the domain before it reaches here. When it is withheld the
 * account section is simply absent — no placeholder, ever. The screen stands on
 * its own without it: date, commemorations, feast, season, and the fast ruling.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Register, Fleuron } from '../../src/ui/components';
import { SelectableProse } from '../../src/ui/SelectableProse';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { CONTENT_LICENSED } from '../../src/content/flags';
import { folioDate } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useHighlights } from '../../src/state/highlights';
import { useTextScale } from '../../src/state/textScale';
import { getDayInfo, addDays } from '../../src/domain/coptic';
import { parseDateKey, dateKey } from '../../src/domain/rule';
import { synaxariumDay, hasLife } from '../../src/domain/content/synaxarium';
import { synaxariumAnchorFromSelection, type RawSelection } from '../../src/domain/highlights';

/** Coptic numerals, for numbering the day's commemorations. */
const ORDINALS = ['Ⲁ', 'Ⲃ', 'Ⲅ', 'Ⲇ', 'Ⲉ', 'Ⲋ', 'Ⲍ', 'Ⲏ', 'Ⲑ', 'Ⲓ'] as const;

export default function SaintDay() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const { date } = useLocalSearchParams<{ date: string }>();
  const today = useClock((s) => s.today);
  // A malformed key lands on today rather than some arbitrary date.
  const civil = parseDateKey(date ?? '') ?? today;
  const info = getDayInfo(civil);
  const day = synaxariumDay(info.coptic);

  const saveHighlight = useHighlights((s) => s.save);
  const scale = useTextScale((s) => s.scale);

  // `replace`, not `push` — browsing days must not pile up the back stack.
  const go = (delta: number) => router.replace(`/saint/${dateKey(addDays(civil, delta))}`);

  // Marks share the Word tab's anchor space (Coptic month/day + offsets into
  // the account), so a span saved here resolves identically in Saved.
  const refLabel = `${info.coptic.monthName} ${info.coptic.day} · ${day?.commemorations[0] ?? ''}`;

  const onSaveSelection = async (sel: RawSelection) => {
    if (!day) return;
    const built = synaxariumAnchorFromSelection(
      { copticMonth: info.coptic.month, copticDay: info.coptic.day },
      sel,
      day.life,
    );
    if (!built) return;
    const id = await saveHighlight({ anchor: built.anchor, textSnapshot: built.snapshot, referenceLabel: refLabel });
    if (id) router.push(`/highlights/${id}`);
  };

  const markWholeDay = async () => {
    if (!day) return;
    const id = await saveHighlight({
      anchor: { source: 'synaxarium', copticMonth: info.coptic.month, copticDay: info.coptic.day, startOffset: 0, endOffset: day.life.length },
      textSnapshot: day.life,
      referenceLabel: refLabel,
    });
    if (id) router.push(`/highlights/${id}`);
  };

  return (
    <Page>
      <SheetBar
        left="Back"
        title={copy.saint.head}
        onBack={() => router.back()}
        right={
          <View style={styles.nav}>
            <Pressable onPress={() => go(-1)} hitSlop={12} accessibilityLabel={copy.saint.prev}>
              <Caps color={t.goldHi} size={15}>‹</Caps>
            </Pressable>
            <Pressable onPress={() => go(1)} hitSlop={12} accessibilityLabel={copy.saint.next}>
              <Caps color={t.goldHi} size={15}>›</Caps>
            </Pressable>
          </View>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Caps size={9} ls={2.2} color={t.gold}>{folioDate(civil)}</Caps>
        <Text style={styles.coptic}>{info.coptic.day} {info.coptic.monthName}</Text>
        <Caps size={8.5} ls={1.4} color={t.ink3}>Anno Martyrum {info.coptic.year}</Caps>
        <Fleuron />

        {/* TIER 1 — whom the Church remembers. Always shown. */}
        {day && day.commemorations.length > 0 ? (
          <>
            <Rubric num="Ⲙ">{copy.saint.title}</Rubric>
            {day.commemorations.map((c, i) => (
              <View key={`${i}-${c}`} style={styles.commemRow}>
                <Caps size={11} color={t.gold} style={styles.ord}>{ORDINALS[i] ?? '·'}</Caps>
                <Text style={styles.commemName}>{c}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.none}>{copy.saint.none}</Text>
        )}

        {/* The day in the calendar — this is what makes the screen whole
            without the account. */}
        {info.feast ? (
          <Register onTop>
            <Caps size={8.5} ls={1.4} color={t.feast} style={styles.regLabel}>Feast</Caps>
            <Text style={styles.detail}>{info.feast.name}</Text>
          </Register>
        ) : null}
        {info.season ? (
          <Register onTop={!info.feast}>
            <Caps size={8.5} ls={1.4} color={t.gold} style={styles.regLabel}>Season</Caps>
            <Text style={styles.detail}>
              {info.season.name} · day {info.season.dayNumber} of {info.season.total}
            </Text>
          </Register>
        ) : null}
        <Register onTop={!info.feast && !info.season}>
          <Caps size={8.5} ls={1.4} color={t.rubricHi} style={styles.regLabel}>Fast</Caps>
          <Text style={styles.detail}>{info.fast.ruling}</Text>
        </Register>

        {/* TIER 2 — the day's written account. Absent, not stubbed, until the
            translation is licensed. */}
        {CONTENT_LICENSED && hasLife(day) ? (
          <>
            <Rubric num="Ⲃ">{copy.saint.account}</Rubric>
            {day!.commemorations.length > 1 ? (
              <Caps size={8} ls={1.2} color={t.ink3} style={{ marginBottom: 8 }}>
                {copy.saint.accountNote}
              </Caps>
            ) : null}
            <SelectableProse
              text={day!.life}
              textStyle={[styles.life, { fontSize: 15 * scale, lineHeight: 22 * scale }]}
              onSaveSelection={onSaveSelection}
              onPressWhole={markWholeDay}
            />
          </>
        ) : null}

        <Fleuron />
        <Caps size={8} ls={1.2} color={t.ink3}>{copy.saint.source}</Caps>
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  nav: { flexDirection: 'row', gap: 18, alignItems: 'center' },
  coptic: { fontFamily: font.display, fontSize: 38, color: t.parch, marginTop: 6 },
  // No numberOfLines anywhere below: some commemoration lines run past 200
  // characters and must wrap rather than clip.
  commemRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  ord: { width: 26, paddingTop: 5 },
  commemName: { flex: 1, fontFamily: font.display, fontSize: 20, color: t.parch, lineHeight: 27 },
  none: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink3, marginTop: 4 },
  regLabel: { width: 70 },
  detail: { flex: 1, fontFamily: font.display, fontSize: 18, color: t.parch },
  life: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, lineHeight: 22 },
});
