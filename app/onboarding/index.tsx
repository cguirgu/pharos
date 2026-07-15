/**
 * Onboarding (PRD §5.1) — a guided, rewarding first run. A cursor walks an
 * ordered run of screens built from the user's answers (src/domain/onboarding):
 * name/journey → goals ("what brought you here") → experience → a preview of what
 * we support for each chosen goal → starter rule (pre-seeded from the goals) →
 * reminder time → permission, then a "lamp lit" finish. Steps slide + fade; the
 * full questionnaire is saved to the DB on finish. Responsive (iPhone SE → tablet).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from '../../src/ui/Page';
import { ProgressBar, Field, Caps, Copt, Mark, Toggle, Btn, Fleuron, Segmented, Seal } from '../../src/ui/components';
import { SlideFade, Stagger } from '../../src/ui/anim';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { useResponsive } from '../../src/ui/useResponsive';
import { copy } from '../../src/ui/copy';
import { useAuth } from '../../src/state/auth';
import { useNotifications } from '../../src/state/notifications';
import { keptFeedback } from '../../src/platform/haptics';
import { playCompleteSound } from '../../src/platform/sound';
import { STARTERS, DEFAULT_SELECTION, type StarterKey } from '../../src/db/seed';
import type { JourneyStage } from '../../src/db/repo';
import {
  ALL_GOALS,
  PART_OF_DAY_TIME,
  buildSequence,
  startersForGoals,
  progressFraction,
  type GoalKey,
  type ExperienceLevel,
  type PartOfDay,
  type OnboardingAnswers,
} from '../../src/domain/onboarding';

const JOURNEY: { key: JourneyStage; glyph: string }[] = [
  { key: 'grew-up', glyph: 'Ⲁ' },
  { key: 'returning', glyph: 'Ⲃ' },
  { key: 'exploring', glyph: 'Ⲅ' },
];

const GOAL_GLYPH: Record<GoalKey, string> = {
  fasts: 'Ⲫ', prayer: 'Ⲁ', word: 'Ⲃ', coptic: 'Ϯ', saints: 'Ⲇ', journal: 'Ⲉ',
};

const EXPERIENCE: ExperienceLevel[] = ['new', 'some', 'rooted'];
const PARTS: PartOfDay[] = ['morning', 'noon', 'evening'];

/** Cap OS font scaling on the display titles: their tight manual lineHeight
 *  clips the display face's ascenders at large Dynamic Type sizes. */
const TITLE_MAX_FONT_SCALE = 1.4;

export default function Onboarding() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAuth((s) => s.completeOnboarding);

  const [name, setName] = useState('');
  const [journey, setJourney] = useState<JourneyStage>('returning');
  const [goals, setGoals] = useState<Set<GoalKey>>(new Set());
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [part, setPart] = useState<PartOfDay>('morning');
  const [selected, setSelected] = useState<Set<StarterKey>>(new Set(DEFAULT_SELECTION));

  const [cursor, setCursor] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const [lit, setLit] = useState(false);
  // Refs, not state: guards must hold within a single render batch, where two
  // taps would otherwise both see the same pre-update state.
  const transitioning = useRef(false); // one step per slide — a double-tap can't skip a screen
  const finishing = useRef(false); // finish() runs at most once at a time
  const seededGoalsKey = useRef<string | null>(null); // the goals the rule was last seeded from

  // The screen run depends only on the chosen goals (which insert previews).
  const orderedGoals = useMemo(() => ALL_GOALS.filter((g) => goals.has(g)), [goals]);
  const goalsKey = orderedGoals.join(',');
  const sequence = useMemo(
    () => buildSequence({ goals: orderedGoals, experience: null, reminder: null }),
    [goalsKey], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const screen = sequence[Math.min(cursor, sequence.length - 1)]!;

  const titleSize = r.scale(36);
  const title = [styles.title, { fontSize: titleSize, lineHeight: titleSize + 3 }];
  const scrollPad = { paddingBottom: insets.bottom + 24 };

  const next = () => {
    if (transitioning.current) return;
    transitioning.current = true;
    setDir(1);
    setCursor((c) => Math.min(sequence.length - 1, c + 1));
  };
  const back = () => {
    if (transitioning.current) return;
    transitioning.current = true;
    setDir(-1);
    setCursor((c) => Math.max(0, c - 1));
  };

  const toggleGoal = (key: GoalKey) =>
    setGoals((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  const toggleStarter = (key: StarterKey) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  // Leaving the goals step: pre-seed the starter rule from the chosen goals —
  // but only when the goals changed since the last seeding, so Back → Continue
  // never clobbers manual edits made on the rule screen.
  const leaveGoals = () => {
    if (seededGoalsKey.current !== goalsKey) {
      const seeded = startersForGoals(orderedGoals);
      setSelected(new Set(seeded.length ? seeded : DEFAULT_SELECTION));
      seededGoalsKey.current = goalsKey;
    }
    next();
  };

  const finish = async (allowReminders: boolean) => {
    if (finishing.current) return;
    finishing.current = true;
    setBusy(true);
    const reminder = { partOfDay: part, time: PART_OF_DAY_TIME[part] };
    const answers: OnboardingAnswers = { goals: orderedGoals, experience, reminder };
    try {
      if (allowReminders) {
        // Enabling the channel requests OS permission and reschedules the cue.
        await useNotifications.getState().setChannel('prayerHours', { enabled: true, time: reminder.time });
      }
      await completeOnboarding({ displayName: name, journeyStage: journey, selection: [...selected], answers });
      setLit(true); // the rewarding "lamp lit" moment
    } finally {
      finishing.current = false; // a failed attempt may be retried
      setBusy(false);
    }
  };

  // Ring the lamp-lit moment once.
  useEffect(() => {
    if (lit) {
      keptFeedback();
      playCompleteSound();
    }
  }, [lit]);

  if (lit) {
    return (
      <Page>
        <View style={styles.litWrap}>
          <Seal size={r.scale(108)} animated delay={120} />
          <Fleuron />
          <Text style={[title, { textAlign: 'center' }]} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.finishTitle}</Text>
          <Text style={[styles.sub, { textAlign: 'center', maxWidth: r.textWidth }]}>{copy.onboarding.finishSub}</Text>
        </View>
        <View style={{ paddingBottom: insets.bottom + 8 }}>
          <Btn kind="solid" onPress={() => router.replace('/(tabs)/today')}>{copy.onboarding.finishCta}</Btn>
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <View style={{ paddingTop: 12 }}>
        {cursor > 0 ? (
          <Pressable onPress={back} hitSlop={10} style={styles.backBtn}>
            <Caps size={9.5} ls={2} color={t.ink3}>‹ {copy.onboarding.back}</Caps>
          </Pressable>
        ) : (
          <View style={{ height: 18 }} />
        )}
        <ProgressBar fraction={progressFraction(sequence, cursor)} />
      </View>

      <SlideFade key={cursor} dir={dir} style={{ flex: 1 }} onDone={() => { transitioning.current = false; }}>
        {screen.kind === 'name-journey' ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={scrollPad}>
              <Caps color={t.rubricHi} size={10} ls={2.4}>{copy.onboarding.journeyKicker}</Caps>
              <Text style={title} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.journeyTitle}</Text>
              <Text style={styles.sub}>{copy.onboarding.journeySub}</Text>
              <Stagger>
                {JOURNEY.map((j) => {
                  const on = journey === j.key;
                  const c = copy.onboarding.journey[j.key];
                  return (
                    <Pressable key={j.key} onPress={() => setJourney(j.key)} style={[styles.row, on && { backgroundColor: t.selWashLo }]}>
                      <Copt size={r.scale(24)} color={on ? t.goldHi : t.ink3} style={{ width: 32, textAlign: 'center' }}>{j.glyph}</Copt>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rowTitle, on && { color: t.goldHi }]}>{c.title}</Text>
                        <Caps size={8.5} ls={1.2} color={t.ink2}>{c.sub}</Caps>
                      </View>
                      <Mark state={on ? 'kept' : 'open'} size={18} />
                    </Pressable>
                  );
                })}
              </Stagger>
              <Field label={copy.onboarding.nameLabel} value={name} onChangeText={setName} autoCapitalize="words" placeholder={copy.onboarding.namePlaceholder} />
              <View style={{ height: 26 }} />
              <Btn kind="solid" onPress={next} disabled={name.trim().length === 0}>{copy.onboarding.continue}</Btn>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : null}

        {screen.kind === 'goals' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollPad}>
            <Caps color={t.rubricHi} size={10} ls={2.4}>{copy.onboarding.goalsKicker}</Caps>
            <Text style={title} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.goalsTitle}</Text>
            <Text style={styles.sub}>{copy.onboarding.goalsSub}</Text>
            <View style={{ marginTop: 12 }}>
              <Stagger>
                {ALL_GOALS.map((g) => {
                  const on = goals.has(g);
                  const c = copy.onboarding.goals[g]!;
                  return (
                    <Pressable key={g} onPress={() => toggleGoal(g)} style={[styles.row, on && { backgroundColor: t.selWashLo }]}>
                      <Copt size={r.scale(22)} color={on ? t.goldHi : t.ink3} style={{ width: 32, textAlign: 'center' }}>{GOAL_GLYPH[g]}</Copt>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rowTitle, on && { color: t.goldHi }]}>{c.title}</Text>
                        <Caps size={8.5} ls={1.2} color={t.ink2}>{c.sub}</Caps>
                      </View>
                      <Mark state={on ? 'kept' : 'open'} size={18} />
                    </Pressable>
                  );
                })}
              </Stagger>
            </View>
            <View style={{ height: 26 }} />
            <Btn kind="solid" onPress={leaveGoals} disabled={goals.size === 0}>{copy.onboarding.continue}</Btn>
          </ScrollView>
        ) : null}

        {screen.kind === 'experience' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollPad}>
            <Caps color={t.rubricHi} size={10} ls={2.4}>{copy.onboarding.experienceKicker}</Caps>
            <Text style={title} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.experienceTitle}</Text>
            <Text style={styles.sub}>{copy.onboarding.experienceSub}</Text>
            <View style={{ marginTop: 12 }}>
              <Stagger>
                {EXPERIENCE.map((e) => {
                  const on = experience === e;
                  const c = copy.onboarding.experience[e]!;
                  return (
                    <Pressable key={e} onPress={() => setExperience(e)} style={[styles.row, on && { backgroundColor: t.selWashLo }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rowTitle, on && { color: t.goldHi }]}>{c.title}</Text>
                        <Caps size={8.5} ls={1.2} color={t.ink2}>{c.sub}</Caps>
                      </View>
                      <Mark state={on ? 'kept' : 'open'} size={18} />
                    </Pressable>
                  );
                })}
              </Stagger>
            </View>
            <View style={{ height: 26 }} />
            <Btn kind="solid" onPress={next} disabled={experience === null}>{copy.onboarding.continue}</Btn>
          </ScrollView>
        ) : null}

        {screen.kind === 'preview' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 6, ...scrollPad }}>
            <View style={styles.previewTop}>
              <Seal size={r.scale(60)} animated delay={80} />
              <Caps color={t.rubricHi} size={10} ls={2.4} style={{ marginTop: 18 }}>{copy.onboarding.previewKicker}</Caps>
              <Text style={[title, { textAlign: 'center' }]} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.previews[screen.goal]!.title}</Text>
              <View style={{ marginTop: 10, gap: 12, maxWidth: r.textWidth }}>
                <Stagger base={1}>
                  {copy.onboarding.previews[screen.goal]!.lines.map((line, i) => (
                    <View key={i} style={styles.previewLine}>
                      <Copt size={13} color={t.gold} style={{ width: 18, textAlign: 'center' }}>☩</Copt>
                      <Text style={styles.previewText}>{line}</Text>
                    </View>
                  ))}
                </Stagger>
              </View>
            </View>
            <Btn kind="solid" onPress={next}>{copy.onboarding.continue}</Btn>
          </ScrollView>
        ) : null}

        {screen.kind === 'rule' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollPad}>
            <Caps color={t.rubricHi} size={10} ls={2.4}>{copy.onboarding.rhythmKicker}</Caps>
            <Text style={title} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.rhythmTitle}</Text>
            <Text style={styles.sub}>{copy.onboarding.rhythmSub}</Text>
            <View style={{ marginTop: 18 }}>
              <Stagger>
                {STARTERS.map((st, i) => (
                  <View key={st.key} style={[styles.toggleRow, i === 0 && styles.toggleRowTop]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{st.name}</Text>
                      <Caps size={8.5} ls={1.2} color={t.ink2}>{st.subtitle}</Caps>
                    </View>
                    <Toggle value={selected.has(st.key)} onChange={() => toggleStarter(st.key)} />
                  </View>
                ))}
              </Stagger>
            </View>
            <View style={{ height: 26 }} />
            <Btn kind="solid" onPress={next} disabled={selected.size === 0}>{copy.onboarding.lightLamp}</Btn>
          </ScrollView>
        ) : null}

        {screen.kind === 'reminder' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollPad}>
            <Caps color={t.rubricHi} size={10} ls={2.4}>{copy.onboarding.reminderKicker}</Caps>
            <Text style={title} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.reminderTitle}</Text>
            <Text style={styles.sub}>{copy.onboarding.reminderSub}</Text>
            <View style={{ marginTop: 22 }}>
              <Segmented
                options={PARTS.map((p) => ({ key: p, label: copy.onboarding.reminderParts[p]! }))}
                active={part}
                onChange={(k) => setPart(k as PartOfDay)}
              />
              <Caps size={9} ls={1.6} color={t.ink3} style={{ marginTop: 14, textAlign: 'center' }}>
                {PART_OF_DAY_TIME[part]}
              </Caps>
            </View>
            <View style={{ height: 26 }} />
            <Btn kind="solid" onPress={next}>{copy.onboarding.continue}</Btn>
          </ScrollView>
        ) : null}

        {screen.kind === 'notify' ? (
          <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 }}>
              <Seal size={r.scale(72)} />
              <Fleuron />
              <Caps color={t.rubricHi} size={10} ls={2.4}>{copy.onboarding.notifKicker}</Caps>
              <Text style={[title, { textAlign: 'center' }]} maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}>{copy.onboarding.notifTitle}</Text>
              <Text style={[styles.sub, { textAlign: 'center', maxWidth: r.textWidth }]}>{copy.onboarding.notifSub}</Text>
            </ScrollView>
            <View style={{ paddingBottom: insets.bottom + 8 }}>
              <Btn kind="solid" onPress={() => finish(true)} disabled={busy}>{copy.onboarding.notifAllow}</Btn>
              <Btn kind="line" onPress={() => finish(false)} disabled={busy} style={{ marginTop: 10 }}>{copy.onboarding.notifSkip}</Btn>
            </View>
          </View>
        ) : null}
      </SlideFade>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  title: { fontFamily: font.display, color: t.parch, marginTop: 8 },
  sub: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 8, lineHeight: 21 },
  backBtn: { paddingVertical: 4, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  rowTitle: { fontFamily: font.display, fontSize: 20, color: t.parch },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  toggleRowTop: { borderTopWidth: 1, borderTopColor: t.ruleDim },
  previewTop: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  previewLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  previewText: { flex: 1, fontFamily: font.body, fontSize: 15, lineHeight: 22, color: t.parch },
  litWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
});
