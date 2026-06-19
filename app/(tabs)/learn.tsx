/**
 * Learn — the course path: level + XP + milestones, then units of lessons that
 * unlock as you go. Tapping an unlocked lesson opens the player.
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Mark, Copt } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useLearning } from '../../src/state/learning';
import { UNITS, LESSONS, lessonPercent, isLessonPassed, isLessonPerfect, isLessonUnlocked, courseLevel, xpFor } from '../../src/domain/learn/course';
import { evaluateMilestones } from '../../src/domain/learn/milestones';
import { proficiencyFor } from '../../src/domain/learn/proficiency';

export default function LearnScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  // Subscribe only to the stable `lessons` record; derive sets locally (a store
  // method that returns a fresh Set must NOT be used as a selector — it would
  // make every snapshot look changed and loop forever).
  const lessons = useLearning((s) => s.lessons);
  const { passed, crowns, level, xp } = useMemo(() => {
    const p = new Set<string>();
    const c = new Set<string>();
    for (const [id, r] of Object.entries(lessons)) {
      if (isLessonPassed(r)) p.add(id);
      if (isLessonPerfect(r)) c.add(id);
    }
    return {
      passed: p,
      crowns: c,
      level: courseLevel(Object.keys(lessons).length),
      xp: xpFor(Object.values(lessons)),
    };
  }, [lessons]);

  const milestonesEarned = evaluateMilestones(passed).filter((m) => m.earned).length;
  const prof = proficiencyFor(passed.size);

  return (
    <Page>
      <Folio left={copy.learn.head} glyph="Ⲁ" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* proficiency rank — tags the learner's Coptic level */}
        <View style={styles.rankCard}>
          <Caps size={8.5} ls={2.2} color={t.ink3}>{copy.learn.rankLabel}</Caps>
          <Text style={styles.rankTitle}>{prof.rank.title}</Text>
          {prof.next ? (
            <Caps size={8.5} ls={1.4} color={t.gold} style={{ marginTop: 4 }}>
              {copy.learn.toNextRank(prof.toNext, prof.next.title)}
            </Caps>
          ) : null}
        </View>

        {/* level / xp / milestones ledger */}
        <View style={styles.ledger}>
          <Stat value={String(level)} label={copy.learn.level} />
          <Stat value={String(xp)} label={copy.learn.xp} />
          <Stat value={`☩${crowns.size}`} label={copy.learn.crownsLabel} />
          <Stat value={String(milestonesEarned)} label={copy.learn.milestonesLabel} />
        </View>

        {/* the path */}
        {UNITS.map((unit) => {
          const unitLessons = LESSONS.filter((l) => l.unitId === unit.id);
          return (
            <View key={unit.id}>
              <Rubric num={unit.glyph}>{unit.title}</Rubric>
              <Text style={styles.unitSub}>{unit.subtitle}</Text>
              {unitLessons.map((lesson) => {
                const record = lessons[lesson.id];
                const perfect = isLessonPerfect(record);
                const didPass = isLessonPassed(record);
                const attempted = !!record;
                const unlocked = isLessonUnlocked(lesson.id, passed);
                const pct = lessonPercent(record);
                const markState = didPass ? 'kept' : attempted ? 'part' : 'open';
                const subtitle = perfect
                  ? copy.learn.perfect
                  : didPass
                    ? `${pct}% · ${copy.learn.crownHint}`
                    : attempted
                      ? `${pct}% · ${copy.learn.needNinety}`
                      : unlocked
                        ? copy.learn.begin.replace(' →', '')
                        : copy.learn.locked;
                return (
                  <Pressable
                    key={lesson.id}
                    disabled={!unlocked}
                    onPress={() => router.push(`/learn/${lesson.id}`)}
                    style={[styles.row, !unlocked && { opacity: 0.4 }]}
                  >
                    <Mark state={markState} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{lesson.title}</Text>
                      <Caps size={8.5} ls={1.4} color={perfect ? t.gold : t.ink3}>{subtitle}</Caps>
                    </View>
                    {perfect ? (
                      <Copt size={15} color={t.gold}>☩</Copt>
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

function Stat({ value, label }: { value: string; label: string }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.stat}>
      <Numeral size={34} color={t.goldHi}>{value}</Numeral>
      <Caps size={8} ls={1.4} color={t.ink3}>{label}</Caps>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  subtitle: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 6 },
  rankCard: { borderWidth: 1, borderColor: t.rule, padding: 16, marginTop: 10, alignItems: 'center' },
  rankTitle: { fontFamily: font.display, fontSize: 34, color: t.parch, marginTop: 4, textAlign: 'center' },
  ledger: { flexDirection: 'row', marginVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.ruleDim, paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  unitSub: { fontFamily: font.bodyItalic, fontSize: 14, color: t.ink2, marginTop: 2, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  rowName: { fontFamily: font.display, fontSize: 21, color: t.parch },
});
