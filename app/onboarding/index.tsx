/**
 * Onboarding (from OnbPersonalize2 / OnbRhythm2 + PRD §5.1): journey + name →
 * starter-rule toggles → notification pre-prompt. On finish, the account's
 * profile is saved and the chosen rule is created.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Page } from '../../src/ui/Page';
import { StepDots, Field, Caps, Copt, Mark, Toggle, Btn, Fleuron, PharosSeal } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useAuth } from '../../src/state/auth';
import { STARTERS, DEFAULT_SELECTION, type StarterKey } from '../../src/db/seed';
import type { JourneyStage } from '../../src/db/repo';

const JOURNEY: { key: JourneyStage; glyph: string }[] = [
  { key: 'grew-up', glyph: 'Ⲁ' },
  { key: 'returning', glyph: 'Ⲃ' },
  { key: 'exploring', glyph: 'Ⲅ' },
];

export default function Onboarding() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const completeOnboarding = useAuth((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [journey, setJourney] = useState<JourneyStage>('returning');
  const [selected, setSelected] = useState<Set<StarterKey>>(new Set(DEFAULT_SELECTION));
  const [busy, setBusy] = useState(false);

  const toggle = (key: StarterKey) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const finish = async (allowReminders: boolean) => {
    setBusy(true);
    if (allowReminders) {
      try {
        await Notifications.requestPermissionsAsync();
      } catch {
        // ignore — reminders simply stay off
      }
    }
    try {
      await completeOnboarding({
        displayName: name,
        journeyStage: journey,
        selection: [...selected],
      });
      router.replace('/(tabs)/today');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <View style={{ paddingTop: 12 }}>
        <StepDots total={3} active={step} />
      </View>

      {step === 0 ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Caps color={t.rubricHi} size={10} ls={2.4}>
              {copy.onboarding.journeyKicker}
            </Caps>
            <Text style={styles.title}>{copy.onboarding.journeyTitle}</Text>
            <Text style={styles.sub}>{copy.onboarding.journeySub}</Text>

            {JOURNEY.map((j) => {
              const on = journey === j.key;
              const c = copy.onboarding.journey[j.key];
              return (
                <Pressable
                  key={j.key}
                  onPress={() => setJourney(j.key)}
                  style={[styles.journeyRow, on && { backgroundColor: t.selWashLo }]}
                >
                  <Copt size={26} color={on ? t.goldHi : t.ink3} style={{ width: 30, textAlign: 'center' }}>
                    {j.glyph}
                  </Copt>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.journeyTitle, on && { color: t.goldHi }]}>{c.title}</Text>
                    <Caps size={8.5} ls={1.2} color={t.ink2}>
                      {c.sub}
                    </Caps>
                  </View>
                  <Mark state={on ? 'kept' : 'open'} size={18} />
                </Pressable>
              );
            })}

            <Field
              label={copy.onboarding.nameLabel}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder={copy.onboarding.namePlaceholder}
            />

            <View style={{ height: 26 }} />
            <Btn kind="solid" onPress={() => setStep(1)} disabled={name.trim().length === 0}>
              {copy.onboarding.continue}
            </Btn>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      {step === 1 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Caps color={t.rubricHi} size={10} ls={2.4}>
            {copy.onboarding.rhythmKicker}
          </Caps>
          <Text style={styles.title}>{copy.onboarding.rhythmTitle}</Text>
          <Text style={styles.sub}>{copy.onboarding.rhythmSub}</Text>

          <View style={{ marginTop: 18 }}>
            {STARTERS.map((st, i) => (
              <View key={st.key} style={[styles.toggleRow, i === 0 && styles.toggleRowTop]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleName}>{st.name}</Text>
                  <Caps size={8.5} ls={1.2} color={t.ink2}>
                    {st.subtitle}
                  </Caps>
                </View>
                <Toggle value={selected.has(st.key)} onChange={() => toggle(st.key)} />
              </View>
            ))}
          </View>

          <View style={{ height: 26 }} />
          <Btn kind="solid" onPress={() => setStep(2)} disabled={selected.size === 0}>
            {copy.onboarding.lightLamp}
          </Btn>
        </ScrollView>
      ) : null}

      {step === 2 ? (
        <View style={{ flex: 1 }}>
          <View style={styles.notifCenter}>
            <PharosSeal size={72} />
            <Fleuron />
            <Caps color={t.rubricHi} size={10} ls={2.4}>
              {copy.onboarding.notifKicker}
            </Caps>
            <Text style={[styles.title, { textAlign: 'center' }]}>{copy.onboarding.notifTitle}</Text>
            <Text style={[styles.sub, { textAlign: 'center', maxWidth: 320 }]}>{copy.onboarding.notifSub}</Text>
          </View>
          <View style={{ paddingBottom: 8 }}>
            <Btn kind="solid" onPress={() => finish(true)} disabled={busy}>
              {copy.onboarding.notifAllow}
            </Btn>
            <Btn kind="line" onPress={() => finish(false)} disabled={busy} style={{ marginTop: 10 }}>
              {copy.onboarding.notifSkip}
            </Btn>
          </View>
        </View>
      ) : null}
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 42, color: t.parch, marginTop: 8, lineHeight: 44 },
  sub: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 8, lineHeight: 21 },
  journeyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  journeyTitle: { fontFamily: font.display, fontSize: 20, color: t.parch },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  toggleRowTop: { borderTopWidth: 1, borderTopColor: t.ruleDim },
  toggleName: { fontFamily: font.display, fontSize: 20, color: t.parch },
  notifCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
});
