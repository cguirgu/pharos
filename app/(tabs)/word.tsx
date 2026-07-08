/**
 * Word — the reading plan, the scripture reader, the day's commemoration
 * (the Synaxarium life, moved here from Hours), and the journal (PRD §5.4).
 * Scripture text is supplied later from a verified, approved source.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Btn, Fleuron } from '../../src/ui/components';
import { SelectableProse } from '../../src/ui/SelectableProse';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { CONTENT_LICENSED } from '../../src/content/flags';
import { liturgicalLabel } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useReading } from '../../src/state/reading';
import { useHighlights } from '../../src/state/highlights';
import { useTextScale } from '../../src/state/textScale';
import { getDayInfo } from '../../src/domain/coptic';
import { PLANS, isPlanComplete } from '../../src/domain/content/readingPlan';
import { readingsOn, readingLabel } from '../../src/domain/content';
import { BOOKS, type BookId } from '../../src/domain/content/bible';
import { primarySaint } from '../../src/domain/content/synaxarium';
import { synaxariumAnchorFromSelection, type RawSelection } from '../../src/domain/highlights';
import { fetchTodaysReadings } from '../../src/platform/katameros';

// Base reading-prose metrics; the user's text-size setting scales these.
const LIFE_FONT = 15;
const LIFE_LINE = 22;

export default function WordScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const today = useClock((s) => s.today);
  const plans = useReading((s) => s.plans);
  const progressOf = useReading((s) => s.progress);
  const startPlan = useReading((s) => s.start);
  const saveHighlight = useHighlights((s) => s.save);
  const scale = useTextScale((s) => s.scale);
  const info = getDayInfo(today);
  const saint = primarySaint(info.coptic);

  // Deep-link from Today's commemoration card → scroll to that section. The
  // section's y is captured on layout; we scroll once it's known and the
  // `focus` param is set, then clear the param so it won't re-fire.
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const commemY = useRef(0);
  const pendingFocus = useRef(false);

  const maybeScrollToCommem = () => {
    if (!pendingFocus.current || commemY.current <= 0) return;
    pendingFocus.current = false;
    scrollRef.current?.scrollTo({ y: Math.max(commemY.current - 12, 0), animated: true });
    router.setParams({ focus: undefined });
  };

  useEffect(() => {
    if (focus === 'commemoration') {
      pendingFocus.current = true;
      maybeScrollToCommem();
    }
  }, [focus]);

  const onCommemLayout = (e: LayoutChangeEvent) => {
    commemY.current = e.nativeEvent.layout.y;
    maybeScrollToCommem();
  };

  // Best-effort: fetch today's Katameros readings (references) when online.
  const [, setTick] = useState(0);
  useEffect(() => {
    void fetchTodaysReadings(today).then((ok) => ok && setTick((n) => n + 1));
  }, [today]);
  const readings = readingsOn(info.coptic);
  const bookId = (name: string): BookId | null => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (id in BOOKS ? (id as BookId) : null);
  };

  const refLabelFor = (name: string) => `${info.coptic.monthName} ${info.coptic.day} · ${name}`;

  // Drag-select within the life → save just that span. The whole-life save is
  // kept as a secondary fallback (onPressWhole) when nothing is selected.
  const onSaveLifeSelection = async (sel: RawSelection) => {
    if (!saint) return;
    const built = synaxariumAnchorFromSelection(
      { copticMonth: info.coptic.month, copticDay: info.coptic.day },
      sel,
      saint.life,
    );
    if (!built) return;
    const id = await saveHighlight({ anchor: built.anchor, textSnapshot: built.snapshot, referenceLabel: refLabelFor(saint.name) });
    if (id) router.push(`/highlights/${id}`);
  };

  const markWholeSaint = async () => {
    if (!saint) return;
    const id = await saveHighlight({
      anchor: { source: 'synaxarium', copticMonth: info.coptic.month, copticDay: info.coptic.day, startOffset: 0, endOffset: saint.life.length },
      textSnapshot: saint.life,
      referenceLabel: refLabelFor(saint.name),
    });
    if (id) router.push(`/highlights/${id}`);
  };

  // Split the catalogue into active / completed / available (opt-in).
  const enrolled = PLANS.filter((p) => plans[p.id]);
  const activePlans = enrolled.filter((p) => !isPlanComplete(p, plans[p.id]!.completedDays.length));
  const completedPlans = enrolled.filter((p) => isPlanComplete(p, plans[p.id]!.completedDays.length));
  const availablePlans = PLANS.filter((p) => !plans[p.id]);

  return (
    <Page>
      <Folio left={copy.word.head} right={liturgicalLabel(info)} glyph="Ⲅ" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Whole-Bible browse */}
        <Rubric>{copy.word.bible}</Rubric>
        <Btn kind="line" onPress={() => router.push('/word')}>
          {copy.word.browse}
        </Btn>

        {/* Active plans */}
        {activePlans.length > 0 ? (
          <>
            <Rubric num="Ⲁ" style={{ marginTop: 26 }}>{copy.word.plansActive}</Rubric>
            {activePlans.map((plan) => {
              const progress = progressOf(plan.id, today);
              const done = plans[plan.id]!.completedDays.length;
              return (
                <View key={plan.id} style={styles.card}>
                  <View style={styles.cardHead}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {progress ? (
                        <Caps size={9} ls={1.4} color={t.ink3} style={{ marginTop: 4 }}>
                          {copy.word.dayOf(progress.dayNumber, progress.total)} · {progress.todayLabel}
                        </Caps>
                      ) : null}
                      <Caps size={8} ls={1.4} color={t.ink3} style={{ marginTop: 2 }}>
                        {copy.word.planDayProgress(done, plan.schedule.length)}
                      </Caps>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Numeral size={40} color={t.goldHi}>{String(progress?.percent ?? 0)}</Numeral>
                      <Caps size={8} ls={1.4} color={t.ink3}>per cent</Caps>
                    </View>
                  </View>
                  <View style={styles.bar}>
                    <View style={[styles.barFill, { width: `${progress?.percent ?? 0}%` }]} />
                  </View>
                  <Btn
                    kind="solid"
                    style={{ marginTop: 16 }}
                    onPress={() => {
                      const ref = progress?.todayRef;
                      if (ref) router.push(`/word/${ref.book}/${ref.chapter}?plan=${plan.id}`);
                    }}
                  >
                    {copy.word.continue}
                  </Btn>
                </View>
              );
            })}
          </>
        ) : null}

        {/* Available plans (opt-in) */}
        {availablePlans.length > 0 ? (
          <>
            <Rubric num="Ⲃ" style={{ marginTop: 26 }}>{copy.word.plansAvailable}</Rubric>
            {availablePlans.map((plan) => (
              <View key={plan.id} style={styles.card}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Caps size={9} ls={1.4} color={t.ink3} style={{ marginTop: 4 }}>
                  {copy.word.dayOf(1, plan.schedule.length)}
                </Caps>
                <Btn kind="line" style={{ marginTop: 16 }} onPress={() => void startPlan(plan.id, today)}>
                  {copy.word.start}
                </Btn>
              </View>
            ))}
          </>
        ) : null}

        {/* Completed plans */}
        {completedPlans.length > 0 ? (
          <>
            <Rubric num="Ⲅ" style={{ marginTop: 26 }}>{copy.word.plansCompleted}</Rubric>
            {completedPlans.map((plan) => (
              <View key={plan.id} style={styles.completedRow}>
                <Text style={styles.completedName}>{plan.name}</Text>
                <View style={styles.completedTag}>
                  <Caps size={8.5} ls={1.6} color={t.goldHi}>{copy.word.completed}</Caps>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {readings && readings.refs.length > 0 ? (
          <>
            <Rubric num="Ⲕ">The day’s readings</Rubric>
            {readings.refs.map((r, i) => {
              const id = bookId(String(r.book));
              return (
                <Pressable
                  key={i}
                  style={styles.readingRow}
                  disabled={!id}
                  onPress={() => id && router.push(`/word/${id}/${r.chapter}`)}
                >
                  <Text style={styles.readingLabel}>{readingLabel(r)}</Text>
                  {r.slot ? (
                    <Caps size={8} ls={1.2} color={t.ink3}>
                      {r.slot}
                    </Caps>
                  ) : null}
                </Pressable>
              );
            })}
          </>
        ) : null}

        {/* Commemoration of the day — the Synaxarium life. Hidden until the
            saint-life text is licensed (only structural facts exist otherwise),
            so no placeholder is shown. */}
        {CONTENT_LICENSED && saint?.life ? (
          <View onLayout={onCommemLayout}>
            <Rubric num="Ⲙ">{copy.word.commemoration}</Rubric>
            <View style={styles.saint}>
              <Text style={styles.saintName}>{saint.name}</Text>
              {saint.title ? (
                <Caps size={8.5} ls={1.4} color={t.ink3} style={{ marginTop: 4 }}>
                  {saint.title}
                </Caps>
              ) : null}
              <Fleuron />
              <SelectableProse
                text={saint.life}
                textStyle={[styles.saintLife, { fontSize: LIFE_FONT * scale, lineHeight: LIFE_LINE * scale }]}
                onSaveSelection={onSaveLifeSelection}
                onPressWhole={markWholeSaint}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  card: { borderWidth: 1, borderColor: t.rule, padding: 18 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  planName: { fontFamily: font.display, fontSize: 30, color: t.parch },
  bar: { height: 2, backgroundColor: t.ruleDim, marginTop: 16 },
  barFill: { height: 2, backgroundColor: t.gold },
  completedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim, gap: 12 },
  completedName: { fontFamily: font.display, fontSize: 21, color: t.parch, flexShrink: 1 },
  completedTag: { borderWidth: 1, borderColor: t.rule, paddingVertical: 4, paddingHorizontal: 8 },
  readingRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.ruleDim, gap: 3 },
  readingLabel: { fontFamily: font.display, fontSize: 19, color: t.parch },
  saint: { marginTop: 6 },
  saintName: { fontFamily: font.display, fontSize: 24, color: t.parch },
  saintLife: { fontFamily: font.bodyItalic, fontSize: LIFE_FONT, color: t.ink2, lineHeight: LIFE_LINE },
});
