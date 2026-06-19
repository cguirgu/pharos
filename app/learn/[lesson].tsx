/**
 * Lesson player — a sequential quiz: multiple choice, plus tile-based SPELLING
 * for the word levels. Correct answers pulse and fill the progress strip; wrong
 * answers are gently requeued and held longer. Finishing opens a celebration —
 * a flawless run "perfects" the lesson (100%) and unlocks the next; otherwise it
 * invites a retry for 100%.
 */
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Btn, Tally, Rubric, Numeral, Copt, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useClock } from '../../src/state/clock';
import { useLearning } from '../../src/state/learning';
import { lessonById, lessonExercises, gradedCount, isLessonPassed, isLessonPerfect, type Exercise } from '../../src/domain/learn/course';
import { milestonesEarnedBy, type LearnMilestone } from '../../src/domain/learn/milestones';
import { correctFeedback, wrongFeedback } from '../../src/platform/haptics';
import { playCorrectSound, playWrongSound, playCompleteSound, playCrownSound } from '../../src/platform/sound';
import { hasAudio, playCoptic } from '../../src/platform/audio';

interface Result {
  firstTry: number;
  total: number;
  xp: number;
  passed: boolean;
  perfect: boolean;
  milestones: LearnMilestone[];
}

export default function LessonPlayer() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const today = useClock((s) => s.today);
  const { lesson: lessonId } = useLocalSearchParams<{ lesson: string }>();
  const lesson = lessonById(String(lessonId));

  const exercises = useMemo(() => (lesson ? lessonExercises(lesson) : []), [lesson]);
  // Concept (teaching) cards aren't scored — the level is measured by its graded cards.
  const total = gradedCount(exercises);

  // Mutable queue (wrong answers are appended) + answered bookkeeping in refs.
  const queueRef = useRef<Exercise[]>(exercises);
  const clearedRef = useRef<Set<string>>(new Set());
  const firstTryRef = useRef<Set<string>>(new Set());
  const attemptedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [runKey, setRunKey] = useState(0); // bumps on restart to remount inputs
  const [pos, setPos] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [outcome, setOutcome] = useState<{ value: string; correct: boolean } | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  if (!lesson || total === 0) {
    return (
      <Page>
        <SheetBar left="Learn" onBack={() => router.back()} />
      </Page>
    );
  }

  const current = queueRef.current[pos]!;
  const isConcept = current.kind === 'concept';
  const isSpell = current.kind === 'word-spell';
  const isGlyphOptions = current.kind === 'name-letter';
  const isTextPrompt = isGlyphOptions || isSpell;
  const answered = outcome !== null;

  const finish = () => {
    const firstTry = firstTryRef.current.size;
    const passed = isLessonPassed({ correct: firstTry, total });
    const perfect = isLessonPerfect({ correct: firstTry, total });
    const afterPassed = new Set(useLearning.getState().passedIds());
    if (passed) afterPassed.add(lesson.id);
    const milestones = milestonesEarnedBy(lesson.id, afterPassed);
    void useLearning.getState().completeLesson(lesson.id, firstTry, total, today);
    // Celebration sound — a grand crown ring at 100%, a warm cadence on a pass.
    if (perfect) playCrownSound();
    else if (passed) playCompleteSound();
    setResult({ firstTry, total, xp: firstTry * 10, passed, perfect, milestones });
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
    const correct = value === cur.answer;
    const wasAttempted = attemptedRef.current.has(cur.key);
    attemptedRef.current.add(cur.key);
    setOutcome({ value, correct });

    if (correct) {
      correctFeedback();
      // If this is the last card, let the level's celebration sound ring instead
      // of doubling it with the per-answer ding.
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
      queueRef.current = [...queueRef.current, cur]; // see it again later
    }
    // Correct answers auto-advance; a WRONG answer waits for the learner to tap
    // Continue, so they can study the correct answer for as long as they like.
    if (correct) timerRef.current = setTimeout(advance, 700);
  };

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = exercises;
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
      <SheetBar left="Learn" title={lesson.title} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.progress}>
          <Tally total={total} filled={clearedCount} />
          <Caps size={9} ls={1.4} color={t.ink3}>{copy.learn.of(clearedCount, total)}</Caps>
        </View>

        {/* prompt */}
        <View style={styles.stage}>
          {isTextPrompt ? (
            <Text style={styles.namePrompt} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.5}>
              {current.prompt}
            </Text>
          ) : (
            <Copt size={84} color={t.parch} fit style={{ width: '100%', textAlign: 'center' }}>
              {current.prompt}
            </Copt>
          )}
          {current.hint ? (
            <Caps size={9} ls={1.6} color={t.ink3} style={{ marginTop: 8 }}>{current.hint}</Caps>
          ) : null}

          {/* pronunciation */}
          {hasAudio(current.audioKey) ? (
            <Pressable onPress={() => playCoptic(current.audioKey)} style={styles.audioBtn} hitSlop={8}>
              <Caps size={9} ls={1.8} color={t.goldHi}>♪ {copy.learn.listen}</Caps>
            </Pressable>
          ) : isSpell || isConcept ? null : (
            <Caps size={8} ls={1.6} color={t.ink3} style={{ marginTop: 12 }}>{copy.learn.audioSoon}</Caps>
          )}
        </View>

        <Fleuron />

        {/* The rule (concept card) or the question prompt for this card. */}
        {isConcept ? (
          <Text style={styles.conceptBody}>{current.body}</Text>
        ) : (
          <Caps size={10.5} ls={2.4} color={t.rubricHi} style={{ textAlign: 'center' }}>
            {copy.learn.prompts[current.kind]}
          </Caps>
        )}

        {isConcept ? (
          <Btn kind="solid" style={{ marginTop: 22 }} onPress={advance}>
            {copy.learn.gotIt}
          </Btn>
        ) : isSpell ? (
          <SpellPanel
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
              const color = st === 'correct' ? t.goldHi : st === 'wrong' ? t.rubricHi : st === 'dim' ? t.ink3 : t.parch;
              return (
                <Pressable
                  key={option}
                  disabled={answered}
                  onPress={() => onAnswer(option)}
                  style={[styles.option, { borderColor: border, backgroundColor: bg, opacity: st === 'dim' ? 0.5 : 1 }]}
                >
                  {isGlyphOptions ? (
                    <Copt size={30} color={color} fit style={{ maxWidth: '100%' }}>{option}</Copt>
                  ) : (
                    <Text style={[styles.optionText, { color }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6}>
                      {option}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {!isConcept && answered ? (
          <View style={{ marginTop: 16, alignItems: 'center', gap: 10 }}>
            <Caps size={9} ls={1.8} color={outcome!.correct ? t.gold : t.rubricHi}>
              {outcome!.correct ? copy.learn.correct : copy.learn.wrong}
            </Caps>
            {/* Reveal the correct spelling on a wrong spell answer. */}
            {!outcome!.correct && isSpell ? (
              <Copt size={30} color={t.gold}>{current.answer}</Copt>
            ) : null}
            {!outcome!.correct ? (
              <Btn kind="solid" style={{ alignSelf: 'stretch', marginTop: 4 }} onPress={advance}>
                {copy.learn.continueLesson}
              </Btn>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {/* completion */}
      <Modal visible={result !== null} transparent animationType="slide" onRequestClose={() => router.back()}>
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            {result ? (
              <>
                <Rubric>{result.perfect ? copy.learn.perfect : copy.learn.complete}</Rubric>
                <View style={styles.celebrate}>
                  <Numeral size={64} color={t.goldHi}>{copy.learn.earned(result.xp)}</Numeral>
                  <Caps size={9} ls={1.6} color={t.ink3}>{copy.learn.score(result.firstTry, result.total)}</Caps>
                  {result.perfect ? (
                    <Caps size={9} ls={1.8} color={t.gold} style={{ marginTop: 6 }}>
                      {copy.learn.crownEarned} · {copy.learn.unlocked}
                    </Caps>
                  ) : result.passed ? (
                    <>
                      <Caps size={9} ls={1.8} color={t.gold} style={{ marginTop: 6 }}>
                        {copy.learn.unlocked}
                      </Caps>
                      <Caps size={8} ls={1.6} color={t.ink3} style={{ marginTop: 4 }}>
                        {copy.learn.crownHint}
                      </Caps>
                    </>
                  ) : (
                    <Caps size={9} ls={1.8} color={t.rubricHi} style={{ marginTop: 6 }}>
                      {copy.learn.needNinety}
                    </Caps>
                  )}
                </View>
                {result.milestones.map((m) => (
                  <View key={m.key} style={styles.milestone}>
                    <Copt size={18} color={t.gold}>☩</Copt>
                    <View style={{ flex: 1 }}>
                      <Caps size={8} ls={1.6} color={t.gold}>{copy.learn.milestoneEarned}</Caps>
                      <Text style={styles.milestoneName}>{m.name}</Text>
                    </View>
                  </View>
                ))}
                {result.passed ? (
                  <>
                    <Btn kind="solid" style={{ marginTop: 18 }} onPress={() => router.back()}>
                      {copy.learn.done}
                    </Btn>
                    {!result.perfect ? (
                      <Btn kind="line" style={{ marginTop: 10 }} onPress={restart}>
                        {copy.learn.tryAgain}
                      </Btn>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Btn kind="solid" style={{ marginTop: 18 }} onPress={restart}>
                      {copy.learn.tryAgain}
                    </Btn>
                    <Btn kind="line" style={{ marginTop: 10 }} onPress={() => router.back()}>
                      {copy.learn.done}
                    </Btn>
                  </>
                )}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </Page>
  );
}

/** Tile-based spelling: tap tiles to build the word; tap a placed letter to remove it. */
function SpellPanel({
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
  // Tiles tracked by INDEX (so repeated letters work).
  const [used, setUsed] = useState<number[]>([]);
  const usedSet = new Set(used);
  const assembled = used.map((i) => tiles[i]).join('');

  return (
    <View style={{ marginTop: 18 }}>
      {/* assembly row */}
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
              <Copt size={26} color={t.goldHi}>{tiles[i]}</Copt>
            </Pressable>
          ))
        )}
      </View>

      {/* tile bank */}
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
              <Copt size={26} color={t.parch}>{tile}</Copt>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Btn kind="line" style={{ flex: 1 }} disabled={disabled || used.length === 0} onPress={() => setUsed([])}>
          {copy.learn.clear}
        </Btn>
        <Btn kind="solid" style={{ flex: 2 }} disabled={disabled || used.length === 0} onPress={() => onCheck(assembled)}>
          {copy.learn.check}
        </Btn>
      </View>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 6 },
  stage: { alignItems: 'center', marginTop: 30 },
  namePrompt: { fontFamily: font.display, fontSize: 44, color: t.parch, textAlign: 'center' },
  conceptBody: { fontFamily: font.body, fontSize: 16, lineHeight: 24, color: t.parch, textAlign: 'center', paddingHorizontal: 6 },
  audioBtn: { marginTop: 14, borderWidth: 1, borderColor: t.rule, paddingVertical: 7, paddingHorizontal: 14 },
  option: { borderWidth: 1, paddingVertical: 16, paddingHorizontal: 18, alignItems: 'center' },
  optionText: { fontFamily: font.display, fontSize: 22 },
  // spelling
  assembly: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: t.rule, paddingBottom: 10 },
  tilePlaced: { borderWidth: 1, borderColor: t.gold, backgroundColor: t.selWashHi, paddingVertical: 6, paddingHorizontal: 12 },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 18 },
  tile: { borderWidth: 1, borderColor: t.ruleDim, paddingVertical: 8, paddingHorizontal: 14 },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.68)' },
  sheet: {
    backgroundColor: t.bg2,
    paddingHorizontal: 26,
    paddingTop: 18,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: t.rule,
  },
  celebrate: { alignItems: 'center', paddingVertical: 18, gap: 4 },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.ruleDim },
  milestoneName: { fontFamily: font.display, fontSize: 20, color: t.parch },
});
