/**
 * Faith — the theology course. Same shape as the Coptic-tongue path (standing +
 * ledger + units of lessons that unlock as you go), with one addition that is
 * this course's own: the CREED SEAL. Finishing a unit unseals one clause of the
 * Creed, so the confession assembles itself as the learner earns it.
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Mark, Copt } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useFaith } from '../../src/state/faith';
import {
  UNITS,
  isLessonReady,
  isLessonPassed,
  isLessonPerfect,
  isLessonUnlocked,
  lessonPercent,
  courseLevel,
  xpFor,
  READY_LESSONS,
} from '../../src/domain/faith/course';
import { evaluateFaithMilestones } from '../../src/domain/faith/milestones';
import { faithRankFor } from '../../src/domain/faith/ranks';
import { CREED_CLAUSES, unsealedCount } from '../../src/domain/faith/creed';
import { isReviewLesson } from '../../src/domain/faith/review';
import { Emphasis } from '../../src/ui/Emphasis';

export default function FaithScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  // Subscribe only to the stable `lessons` record and derive sets locally — a
  // selector returning a fresh Set would make every snapshot look changed.
  const lessons = useFaith((s) => s.lessons);
  const { passed, lamps, level, xp } = useMemo(() => {
    const p = new Set<string>();
    const l = new Set<string>();
    for (const [id, r] of Object.entries(lessons)) {
      if (isLessonPassed(r)) p.add(id);
      if (isLessonPerfect(r)) l.add(id);
    }
    return {
      passed: p,
      lamps: l,
      level: courseLevel(Object.keys(lessons).length),
      xp: xpFor(Object.values(lessons)),
    };
  }, [lessons]);

  const milestonesEarned = evaluateFaithMilestones(passed).filter((m) => m.earned).length;
  const standing = faithRankFor(lamps.size, READY_LESSONS.length);
  const sealed = unsealedCount(passed);

  return (
    <Page>
      <Folio left={copy.faith.head} glyph="☩" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* standing — the catechumen ladder */}
        <View style={styles.rankCard}>
          <Caps size={8.5} ls={2.2} color={t.ink3}>{copy.faith.rankLabel}</Caps>
          <Text style={styles.rankTitle}>{standing.rank.title}</Text>
          <Text style={styles.rankNote}>{standing.rank.note}</Text>
          {standing.next ? (
            <Caps size={8.5} ls={1.4} color={t.gold} style={{ marginTop: 6 }}>
              {copy.faith.toNextRank(standing.toNext, standing.next.title)}
            </Caps>
          ) : null}
        </View>

        <View style={styles.ledger}>
          <Stat value={String(level)} label={copy.faith.level} />
          <Stat value={String(xp)} label={copy.faith.xp} />
          <Stat value={`✹ ${lamps.size}`} label={copy.faith.lampsLabel} />
          <Stat
            value={`${sealed}/${CREED_CLAUSES.length}`}
            label={copy.faith.creedLabel}
            onPress={() => router.push('/faith/creed')}
          />
          <Stat
            value={String(milestonesEarned)}
            label={copy.faith.milestonesLabel}
            onPress={() => router.push('/faith/milestones')}
          />
        </View>

        {/* the path */}
        {UNITS.map((unit) => {
          const unitLessons = unit.lessons.filter(isLessonReady);
          if (unitLessons.length === 0) return null;
          return (
            <View key={unit.id}>
              {/* `num` renders in Noto Sans Coptic (no Latin glyphs), so the
                  unit's Coptic mark goes there and the Roman numeral is set in
                  the caps face beside the subtitle. */}
              <Rubric num={unit.glyph}>{unit.title}</Rubric>
              <View style={styles.unitSubRow}>
                <Caps size={8.5} ls={1.8} color={t.gold}>{unit.numeral}</Caps>
                <Text style={styles.unitSub}>{unit.subtitle}</Text>
              </View>
              {/* What the unit is FOR — stated before it is taught, so the
                  learner knows what they are meant to carry out of it. */}
              <View style={styles.essentials}>
                <Caps size={7.5} ls={1.8} color={t.ink3}>{copy.faith.essentialsLabel}</Caps>
                {unit.essentials.map((e) => (
                  <Emphasis key={e} style={styles.essential}>{`· ${e}`}</Emphasis>
                ))}
              </View>
              {unitLessons.map((lesson) => {
                const record = lessons[lesson.id];
                const perfect = isLessonPerfect(record);
                const didPass = isLessonPassed(record);
                const attempted = !!record;
                const unlocked = isLessonUnlocked(lesson.id, passed);
                const pct = lessonPercent(record);
                const markState = didPass ? 'kept' : attempted ? 'part' : 'open';
                const isReview = isReviewLesson(lesson.id);
                const subtitle = perfect
                  ? copy.faith.perfect
                  : didPass
                    ? `${pct}% · ${copy.faith.lampHint}`
                    : attempted
                      ? `${pct}% · ${copy.faith.needNinety}`
                      : unlocked
                        ? (isReview ? copy.faith.reviewLabel : copy.faith.begin)
                        : copy.faith.locked;
                return (
                  <Pressable
                    key={lesson.id}
                    disabled={!unlocked}
                    onPress={() => router.push(`/faith/${lesson.id}`)}
                    style={[styles.row, !unlocked && { opacity: 0.4 }]}
                  >
                    <Mark state={markState} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowName, isReview && styles.rowNameReview]}>{lesson.title}</Text>
                      <Caps size={8.5} ls={1.4} color={perfect ? t.gold : t.ink3}>{subtitle}</Caps>
                    </View>
                    {perfect ? (
                      <Text style={[styles.lamp, { color: t.gold }]}>✹</Text>
                    ) : attempted ? (
                      <Caps size={11} ls={1} color={didPass ? t.gold : t.ink2}>{pct}%</Caps>
                    ) : unlocked ? (
                      <Caps size={13} color={t.ink3}>›</Caps>
                    ) : (
                      <Copt size={13} color={t.ink3}>⳾</Copt>
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </Page>
  );
}

function Stat({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const body = (
    <>
      <Numeral size={28} color={t.goldHi}>{value}</Numeral>
      <Caps size={7.5} ls={1.2} color={onPress ? t.gold : t.ink3}>{label}</Caps>
    </>
  );
  return onPress ? (
    <Pressable style={styles.stat} onPress={onPress} hitSlop={8}>{body}</Pressable>
  ) : (
    <View style={styles.stat}>{body}</View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  rankCard: { borderWidth: 1, borderColor: t.rule, padding: 16, marginTop: 10, alignItems: 'center' },
  rankTitle: { fontFamily: font.display, fontSize: 32, color: t.parch, marginTop: 4, textAlign: 'center' },
  rankNote: { fontFamily: font.bodyItalic, fontSize: 14, color: t.ink2, marginTop: 4, textAlign: 'center' },
  ledger: { flexDirection: 'row', marginVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.ruleDim, paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  unitSubRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2, marginBottom: 4 },
  unitSub: { flex: 1, fontFamily: font.bodyItalic, fontSize: 14, color: t.ink2 },
  lamp: { fontFamily: font.body, fontSize: 15 },
  essentials: { marginTop: 8, marginBottom: 10, paddingLeft: 2, gap: 3 },
  essential: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: t.ink2 },
  rowNameReview: { fontFamily: font.displayItalic, color: t.goldHi },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  rowName: { fontFamily: font.display, fontSize: 21, color: t.parch },
});
