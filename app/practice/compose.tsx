/**
 * Compose / edit a practice (from ComposePractice3): name, category, §i how
 * often (the six cadences), §ii the measure, §iii why you keep it.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Segmented, Chip, Stepper, Btn, Mark } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { useRule } from '../../src/state/rule';
import { id as newId } from '../../src/platform/id';
import type { Cadence, Category, Measure, Practice } from '../../src/domain/rule';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'prayer', label: 'Prayer' },
  { key: 'word', label: 'Word' },
  { key: 'fast', label: 'Fast' },
  { key: 'devotion', label: 'Devotion' },
];
const MEASURES: { key: Measure; label: string }[] = [
  { key: 'binary', label: 'Mark kept' },
  { key: 'count', label: 'A count' },
  { key: 'parts', label: 'Parts' },
];
const CADENCES: { key: Cadence['type']; label: string }[] = [
  { key: 'daily', label: 'Every day' },
  { key: 'weekdays', label: 'Certain weekdays' },
  { key: 'timesPerWeek', label: 'N times per week' },
  { key: 'fastDays', label: 'On fast days' },
  { key: 'perPeriod', label: 'Once a week or month' },
  { key: 'season', label: 'During a season' },
];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COUNT_PRESETS = [3, 12, 40, 100];

export default function ComposeScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { practices, savePractice } = useRule();
  const existing = practices.find((p) => p.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<Category>(existing?.category ?? 'prayer');
  const [measure, setMeasure] = useState<Measure>(existing?.measure ?? 'binary');
  const [target, setTarget] = useState(existing?.target ?? 12);
  const [partsText, setPartsText] = useState((existing?.parts ?? ['Morning', 'Noon', 'Vespers']).join(', '));
  const [intention, setIntention] = useState(existing?.intention ?? '');

  const [cadenceType, setCadenceType] = useState<Cadence['type']>(existing?.cadence.type ?? 'daily');
  const [days, setDays] = useState<number[]>(
    existing?.cadence.type === 'weekdays' ? [...existing.cadence.days] : [3, 5],
  );
  const [timesN, setTimesN] = useState(existing?.cadence.type === 'timesPerWeek' ? existing.cadence.n : 3);
  const [period, setPeriod] = useState<'week' | 'month'>(
    existing?.cadence.type === 'perPeriod' ? existing.cadence.period : 'week',
  );

  const buildCadence = (): Cadence => {
    switch (cadenceType) {
      case 'weekdays':
        return { type: 'weekdays', days: [...days].sort() };
      case 'timesPerWeek':
        return { type: 'timesPerWeek', n: timesN };
      case 'perPeriod':
        return { type: 'perPeriod', period };
      case 'season':
        return { type: 'season', season: 'great-lent' };
      case 'fastDays':
        return { type: 'fastDays' };
      default:
        return { type: 'daily' };
    }
  };

  const save = async () => {
    const parts = partsText.split(',').map((s) => s.trim()).filter(Boolean);
    const practice: Practice = {
      id: existing?.id ?? newId(),
      createdAt: existing?.createdAt ?? Date.now(),
      name: name.trim() || 'A practice',
      category,
      kind: existing?.kind ?? 'custom',
      cadence: buildCadence(),
      measure,
      target: measure === 'count' || measure === 'duration' ? target : undefined,
      parts: measure === 'parts' ? parts : undefined,
      intention: intention.trim() || undefined,
      state: existing?.state ?? 'active',
      sortOrder: existing?.sortOrder ?? practices.length,
    };
    await savePractice(practice);
    router.back();
  };

  return (
    <Page>
      <SheetBar
        left="Cancel"
        title={existing ? 'Edit practice' : 'New practice'}
        onBack={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name this practice"
          placeholderTextColor={t.ink3}
          style={styles.nameInput}
        />
        <Segmented options={CATEGORIES} active={category} onChange={(k) => setCategory(k as Category)} />

        <Rubric num="ⲓ">How often</Rubric>
        {CADENCES.map((c) => (
          <Pressable key={c.key} style={styles.optRow} onPress={() => setCadenceType(c.key)}>
            <Mark state={cadenceType === c.key ? 'kept' : 'open'} size={16} />
            <Text style={styles.optLabel}>{c.label}</Text>
          </Pressable>
        ))}
        {cadenceType === 'weekdays' ? (
          <View style={styles.chips}>
            {WD.map((d, i) => (
              <Chip
                key={i}
                on={days.includes(i)}
                onPress={() => setDays((ds) => (ds.includes(i) ? ds.filter((x) => x !== i) : [...ds, i]))}
              >
                {d}
              </Chip>
            ))}
          </View>
        ) : null}
        {cadenceType === 'timesPerWeek' ? (
          <View style={styles.sub}>
            <Stepper value={timesN} unit="per week" onDec={() => setTimesN((n) => Math.max(1, n - 1))} onInc={() => setTimesN((n) => Math.min(7, n + 1))} />
          </View>
        ) : null}
        {cadenceType === 'perPeriod' ? (
          <View style={styles.sub}>
            <Segmented
              options={[{ key: 'week', label: 'Once a week' }, { key: 'month', label: 'Once a month' }]}
              active={period}
              onChange={(k) => setPeriod(k as 'week' | 'month')}
            />
          </View>
        ) : null}

        <Rubric num="ⲓⲓ">The measure</Rubric>
        <Segmented options={MEASURES} active={measure} onChange={(k) => setMeasure(k as Measure)} />
        {measure === 'count' ? (
          <View style={styles.sub}>
            <Stepper value={target} unit="times" onDec={() => setTarget((t) => Math.max(1, t - 1))} onInc={() => setTarget((t) => t + 1)} />
            <View style={styles.chips}>
              {COUNT_PRESETS.map((n) => (
                <Chip key={n} on={target === n} onPress={() => setTarget(n)}>
                  {String(n)}
                </Chip>
              ))}
            </View>
          </View>
        ) : null}
        {measure === 'parts' ? (
          <View style={styles.sub}>
            <TextInput
              value={partsText}
              onChangeText={setPartsText}
              placeholder="Morning, Noon, Vespers"
              placeholderTextColor={t.ink3}
              style={styles.input}
            />
            <Caps size={8.5} ls={1.2} color={t.ink3} style={{ marginTop: 6 }}>
              Comma-separated parts
            </Caps>
          </View>
        ) : null}

        <Rubric num="ⲓⲓⲓ">Why you keep it</Rubric>
        <TextInput
          value={intention}
          onChangeText={setIntention}
          placeholder="An intention, in a line"
          placeholderTextColor={t.ink3}
          multiline
          style={[styles.input, { minHeight: 60 }]}
        />

        <View style={{ height: 26 }} />
        <Btn kind="solid" onPress={save}>
          {existing ? 'Save changes' : 'Add to the rule'}
        </Btn>
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  nameInput: { fontFamily: font.display, fontSize: 30, color: t.parch, paddingVertical: 8, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  optLabel: { fontFamily: font.display, fontSize: 19, color: t.parch },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  sub: { marginTop: 14 },
  input: { fontFamily: font.body, fontSize: 15, color: t.parch, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
});
