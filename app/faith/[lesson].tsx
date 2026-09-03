/**
 * Faith lesson player — teaching cards first, then the questions.
 *
 * Same rhythm as the Coptic player (wrong answers requeue and hold; correct
 * ones pulse and advance), with three differences the subject matter demands:
 *   • Every step shows its SOURCES, tappable, because a doctrinal claim without
 *     a citation is exactly what this course refuses to be.
 *   • A wrong answer reveals the `explain` line — the reason is the part worth
 *     keeping, not the score.
 *   • An `order` step is answered by tapping events into sequence.
 */
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Btn, Tally, Rubric, Numeral, Copt, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useClock } from '../../src/state/clock';
import { useFaith } from '../../src/state/faith';
import {
  lessonById,
  lessonSteps,
  gradedCount,
  isCorrect,
  isLessonPassed,
  isLessonPerfect,
  unitForLesson,
  ORDER_SEP,
  type Step,
} from '../../src/domain/faith/course';
import { faithMilestonesEarnedBy, type FaithMilestone } from '../../src/domain/faith/milestones';
import { clausesUnsealedBy, type SealedClause } from '../../src/domain/faith/creed';
import { citations } from '../../src/domain/faith/sources';
import { correctFeedback, wrongFeedback } from '../../src/platform/haptics';
import { playCorrectSound, playWrongSound, playCompleteSound, playCrownSound } from '../../src/platform/sound';

interface Result {
  firstTry: number;
  total: number;
  xp: number;
  passed: boolean;
  perfect: boolean;
  milestones: FaithMilestone[];
  clauses: SealedClause[];
}

export default function FaithLessonPlayer() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const today = useClock((s) => s.today);
  const { lesson: lessonId } = useLocalSearchParams<{ lesson: string }>();
  const lesson = lessonById(String(lessonId));
  const unit = lesson ? unitForLesson(lesson.id) : undefined;

  const steps = useMemo(() => (lesson ? lessonSteps(lesson) : []), [lesson]);
  const total = gradedCount(steps);

  const queueRef = useRef<Step[]>(steps);
  const clearedRef = useRef<Set<string>>(new Set());
  const firstTryRef = useRef<Set<string>>(new Set());
  const attemptedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [runKey, setRunKey] = useState(0);
  const [pos, setPos] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [outcome, setOutcome] = useState<{ value: string; correct: boolean } | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  if (!lesson || total === 0) {
    return (
      <Page>
        <SheetBar left={copy.tabs.faith} onBack={() => router.back()} />
      </Page>
    );
  }

  const current = queueRef.current[pos]!;
  const isTeach = current.kind === 'teach';
  const isOrder = current.kind === 'order';
  const answered = outcome !== null;

  const finish = () => {
    const firstTry = firstTryRef.current.size;
    const passed = isLessonPassed({ correct: firstTry, total });
    const perfect = isLessonPerfect({ correct: firstTry, total });
    const afterPassed = new Set(useFaith.getState().passedIds());
    if (passed) afterPassed.add(lesson.id);
    const milestones = faithMilestonesEarnedBy(lesson.id, afterPassed);
    const clauses = clausesUnsealedBy(lesson.id, afterPassed);
    void useFaith.getState().completeLesson(lesson.id, firstTry, total, today);
    if (perfect) playCrownSound();
    else if (passed) playCompleteSound();
    setResult({ firstTry, total, xp: firstTry * 10, passed, perfect, milestones, clauses });
  };

  const advance = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOutcome(null);
    if (clearedRef.current.size >= total) finish();
    else setPos((p) => p + 1);
  };

  const onAnswer = (value: string) => {
    if (answered) return;
    const cur = current;
    const correct = isCorrect(cur, value);
    const wasAttempted = attemptedRef.current.has(cur.key);
    attemptedRef.current.add(cur.key);
    setOutcome({ value, correct });

    if (correct) {
      correctFeedback();
      const willComplete = !clearedRef.current.has(cur.key) && clearedRef.current.size + 1 >= total;
      if (!willComplete) playCorrectSound();
      if (!clearedRef.current.has(cur.key)) {
        clearedRef.current.add(cur.key);
        setClearedCount(clearedRef.current.size);
      }
      if (!wasAttempted) firstTryRef.current.add(cur.key);
    } else {
      wrongFeedback();
      playWrongSound();
      queueRef.current = [...queueRef.current, cur];
    }
    // A correct answer still pauses long enough to read the reason; a wrong one
    // waits for a tap, so the explanation can be studied for as long as needed.
    if (correct) timerRef.current = setTimeout(advance, 1400);
  };

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = steps;
    clearedRef.current = new Set();
    firstTryRef.current = new Set();
    attemptedRef.current = new Set();
    setPos(0);
    setClearedCount(0);
    setOutcome(null);
    setResult(null);
    setRunKey((k) => k + 1);
  };

  const optionState = (option: string): 'idle' | 'correct' | 'wrong' | 'dim' => {
    if (!answered) return 'idle';
    if (option === current.answer) return 'correct';
    if (option === outcome!.value) return 'wrong';
    return 'dim';
  };

  return (
    <Page>
      <SheetBar left={copy.tabs.faith} title={unit?.title ?? lesson.title} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.progress}>
          <Tally total={total} filled={clearedCount} />
          <Caps size={9} ls={1.4} color={t.ink3}>{copy.faith.of(clearedCount, total)}</Caps>
        </View>

        {isTeach ? (
          <>
            <View style={styles.teachHead}>
              {current.glyph ? <Copt size={40} color={t.gold}>{current.glyph}</Copt> : null}
              <Text style={styles.teachHeading}>{current.prompt}</Text>
            </View>
            <Fleuron />
            <Text style={styles.teachBody}>{current.body}</Text>
            {current.pull ? (
              <View style={styles.pull}>
                <Text style={styles.pullText}>{current.pull}</Text>
              </View>
            ) : null}
            <SourceList sources={current.sources} reviewed={current.reviewed} />
            <Btn kind="solid" style={{ marginTop: 22 }} onPress={advance}>
              {copy.faith.gotIt}
            </Btn>
          </>
        ) : (
          <>
            <View style={styles.stage}>
              <Text style={styles.questionText}>{current.prompt}</Text>
            </View>
            <Fleuron />
            <Caps size={10.5} ls={2.4} color={t.rubricHi} style={{ textAlign: 'center' }}>
              {copy.faith.prompts[current.kind]}
            </Caps>

            {isOrder ? (
              <OrderPanel
                key={`${runKey}:${current.key}`}
                tiles={current.tiles ?? []}
                disabled={answered}
                onCheck={onAnswer}
              />
            ) : (
              <View style={{ marginTop: 18, gap: 10 }}>
                {current.options.map((option) => {
                  const st = optionState(option);
                  const border = st === 'correct' ? t.gold : st === 'wrong' ? t.rubric : t.ruleDim;
                  const bg = st === 'correct' ? t.selWashHi : 'transparent';
                  const color =
                    st === 'correct' ? t.goldHi : st === 'wrong' ? t.rubricHi : st === 'dim' ? t.ink3 : t.parch;
                  return (
                    <Pressable
                      key={option}
                      disabled={answered}
                      onPress={() => onAnswer(option)}
                      style={[styles.option, { borderColor: border, backgroundColor: bg, opacity: st === 'dim' ? 0.5 : 1 }]}
                    >
                      <Text style={[styles.optionText, { color }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {answered ? (
              <View style={{ marginTop: 16, gap: 10 }}>
                <Caps size={9} ls={1.8} color={outcome!.correct ? t.gold : t.rubricHi} style={{ textAlign: 'center' }}>
                  {outcome!.correct ? copy.faith.correct : copy.faith.wrong}
                </Caps>
                {!outcome!.correct && isOrder ? (
                  <Text style={[styles.explainText, { color: t.gold, textAlign: 'center' }]}>{current.answer}</Text>
                ) : null}
                {current.explain ? (
                  <View style={styles.explain}>
                    <Caps size={8} ls={2} color={t.ink3}>{copy.faith.why}</Caps>
                    <Text style={styles.explainText}>{current.explain}</Text>
                  </View>
                ) : null}
                <SourceList sources={current.sources} reviewed={current.reviewed} />
                {!outcome!.correct ? (
                  <Btn kind="solid" style={{ marginTop: 4 }} onPress={advance}>
                    {copy.faith.continueLesson}
                  </Btn>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* completion */}
      <Modal visible={result !== null} transparent animationType="slide" onRequestClose={() => router.back()}>
        <View style={styles.sheetWrap}>
          <ScrollView style={styles.sheet} contentContainerStyle={{ paddingBottom: 40 }}>
            {result ? (
              <>
                <Rubric>{result.perfect ? copy.faith.perfect : copy.faith.complete}</Rubric>
                <View style={styles.celebrate}>
                  <Numeral size={64} color={t.goldHi}>{copy.faith.earned(result.xp)}</Numeral>
                  <Caps size={9} ls={1.6} color={t.ink3}>{copy.faith.score(result.firstTry, result.total)}</Caps>
                  {result.perfect ? (
                    <Caps size={9} ls={1.8} color={t.gold} style={{ marginTop: 6 }}>
                      {copy.faith.lampEarned} · {copy.faith.unlocked}
                    </Caps>
                  ) : result.passed ? (
                    <>
                      <Caps size={9} ls={1.8} color={t.gold} style={{ marginTop: 6 }}>{copy.faith.unlocked}</Caps>
                      <Caps size={8} ls={1.6} color={t.ink3} style={{ marginTop: 4 }}>{copy.faith.lampHint}</Caps>
                    </>
                  ) : (
                    <Caps size={9} ls={1.8} color={t.rubricHi} style={{ marginTop: 6 }}>{copy.faith.needNinety}</Caps>
                  )}
                </View>

                {/* a clause of the Creed unsealed — this course's own reward */}
                {result.clauses.map((c) => (
                  <View key={c.id} style={styles.clause}>
                    <Caps size={8} ls={1.6} color={t.gold}>{copy.faith.clauseUnsealed}</Caps>
                    <Text style={styles.clauseTitle}>{c.title}</Text>
                    <Text style={styles.clauseGist}>{c.gist}</Text>
                  </View>
                ))}

                {result.milestones.map((m) => (
                  <View key={m.key} style={styles.milestone}>
                    <Copt size={18} color={t.gold}>{m.glyph ?? '☩'}</Copt>
                    <View style={{ flex: 1 }}>
                      <Caps size={8} ls={1.6} color={t.gold}>{copy.faith.milestoneEarned}</Caps>
                      <Text style={styles.milestoneName}>{m.name}</Text>
                    </View>
                  </View>
                ))}

                {result.passed ? (
                  <>
                    <Btn kind="solid" style={{ marginTop: 18 }} onPress={() => router.back()}>
                      {copy.faith.done}
                    </Btn>
                    {!result.perfect ? (
                      <Btn kind="line" style={{ marginTop: 10 }} onPress={restart}>
                        {copy.faith.tryAgain}
                      </Btn>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Btn kind="solid" style={{ marginTop: 18 }} onPress={restart}>
                      {copy.faith.tryAgain}
                    </Btn>
                    <Btn kind="line" style={{ marginTop: 10 }} onPress={() => router.back()}>
                      {copy.faith.done}
                    </Btn>
                  </>
                )}
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </Page>
  );
}

/**
 * The citation strip under every card. Tapping a source opens it — the course's
 * closing instruction is "go and read the page it came from", and this is how.
 */
function SourceList({ sources, reviewed }: { sources: readonly string[]; reviewed: boolean }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const resolved = citations(sources);
  if (resolved.length === 0 && reviewed) return null;
  return (
    <View style={styles.sources}>
      {!reviewed ? (
        <View style={{ marginBottom: 8 }}>
          <Caps size={8} ls={1.8} color={t.rubricHi}>{copy.faith.unreviewed}</Caps>
          <Text style={styles.unreviewedNote}>{copy.faith.unreviewedNote}</Text>
        </View>
      ) : null}
      <Caps size={8} ls={2} color={t.ink3}>
        {resolved.length === 1 ? copy.faith.sourceLabel : copy.faith.sourcesLabel}
      </Caps>
      {resolved.map((s) => (
        <Pressable key={s.id} onPress={() => void Linking.openURL(s.url)} hitSlop={4}>
          <Text style={styles.sourceTitle}>{s.title}</Text>
          <Text style={styles.sourcePublisher}>{s.publisher}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Tap events into sequence; tap a placed one to take it back out. */
function OrderPanel({
  tiles,
  disabled,
  onCheck,
}: {
  tiles: readonly string[];
  disabled: boolean;
  onCheck: (assembled: string) => void;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const [used, setUsed] = useState<number[]>([]);
  const usedSet = new Set(used);
  const assembled = used.map((i) => tiles[i]).join(ORDER_SEP);

  return (
    <View style={{ marginTop: 18 }}>
      <View style={styles.assembly}>
        {used.length === 0 ? (
          <Caps size={9} ls={1.6} color={t.ink3}>·</Caps>
        ) : (
          used.map((i, slot) => (
            <Pressable
              key={`${i}-${slot}`}
              disabled={disabled}
              onPress={() => setUsed((u) => u.filter((_, s) => s !== slot))}
              style={styles.tilePlaced}
            >
              <Caps size={8} ls={1.2} color={t.gold}>{String(slot + 1)}</Caps>
              <Text style={[styles.tileText, { color: t.goldHi }]}>{tiles[i]}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.bank}>
        {tiles.map((tile, i) => {
          const isUsed = usedSet.has(i);
          return (
            <Pressable
              key={i}
              disabled={disabled || isUsed}
              onPress={() => setUsed((u) => [...u, i])}
              style={[styles.tile, isUsed && { opacity: 0.25 }]}
            >
              <Text style={[styles.tileText, { color: t.parch }]}>{tile}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Btn kind="line" style={{ flex: 1 }} disabled={disabled || used.length === 0} onPress={() => setUsed([])}>
          {copy.faith.clear}
        </Btn>
        <Btn
          kind="solid"
          style={{ flex: 2 }}
          disabled={disabled || used.length !== tiles.length}
          onPress={() => onCheck(assembled)}
        >
          {copy.faith.check}
        </Btn>
      </View>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 6 },
  // teaching card
  teachHead: { alignItems: 'center', marginTop: 26, gap: 8 },
  teachHeading: { fontFamily: font.display, fontSize: 30, color: t.parch, textAlign: 'center' },
  teachBody: { fontFamily: font.body, fontSize: 16, lineHeight: 26, color: t.parch, marginTop: 4 },
  pull: {
    borderLeftWidth: 2,
    borderLeftColor: t.gold,
    paddingLeft: 14,
    paddingVertical: 6,
    marginTop: 18,
  },
  pullText: { fontFamily: font.bodyItalic, fontSize: 16, lineHeight: 24, color: t.goldHi },
  // question
  stage: { marginTop: 26 },
  questionText: { fontFamily: font.display, fontSize: 26, lineHeight: 34, color: t.parch, textAlign: 'center' },
  option: { borderWidth: 1, paddingVertical: 15, paddingHorizontal: 18 },
  optionText: { fontFamily: font.body, fontSize: 16, lineHeight: 23 },
  explain: { borderTopWidth: 1, borderTopColor: t.ruleDim, paddingTop: 12, gap: 6 },
  explainText: { fontFamily: font.body, fontSize: 15, lineHeight: 23, color: t.ink2 },
  // sources
  sources: { marginTop: 20, borderTopWidth: 1, borderTopColor: t.ruleDim, paddingTop: 12, gap: 6 },
  sourceTitle: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: t.gold, textDecorationLine: 'underline' },
  sourcePublisher: { fontFamily: font.bodyItalic, fontSize: 12, color: t.ink3, marginBottom: 4 },
  unreviewedNote: { fontFamily: font.bodyItalic, fontSize: 12, lineHeight: 18, color: t.ink3, marginTop: 4 },
  // order tiles
  assembly: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: t.rule, paddingBottom: 12 },
  tilePlaced: { borderWidth: 1, borderColor: t.gold, backgroundColor: t.selWashHi, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', gap: 2 },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 18 },
  tile: { borderWidth: 1, borderColor: t.ruleDim, paddingVertical: 10, paddingHorizontal: 14 },
  tileText: { fontFamily: font.body, fontSize: 14 },
  // completion sheet
  sheetWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.68)' },
  sheet: {
    maxHeight: '86%',
    backgroundColor: t.bg2,
    paddingHorizontal: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: t.rule,
  },
  celebrate: { alignItems: 'center', paddingVertical: 18, gap: 4 },
  clause: { borderTopWidth: 1, borderTopColor: t.ruleDim, paddingVertical: 14, gap: 4 },
  clauseTitle: { fontFamily: font.display, fontSize: 21, color: t.parch },
  clauseGist: { fontFamily: font.bodyItalic, fontSize: 14, lineHeight: 21, color: t.ink2 },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.ruleDim },
  milestoneName: { fontFamily: font.display, fontSize: 20, color: t.parch },
});
