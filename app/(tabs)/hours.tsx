/**
 * Hours — the Agpeya offices for today, the saint of the day, and a way into
 * the Ordo (PRD §5.3). Office prayer text is supplied later from a verified
 * Agpeya; this screen shows structure + kept-state.
 */
import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Mark, Btn, Fleuron } from '../../src/ui/components';
import { SelectableProse } from '../../src/ui/SelectableProse';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { folioDate, liturgicalLabel } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useOffices } from '../../src/state/offices';
import { useHighlights } from '../../src/state/highlights';
import { getDayInfo } from '../../src/domain/coptic';
import { officesForDay, officeForHour } from '../../src/domain/content/agpeya';
import { primarySaint } from '../../src/domain/content/synaxarium';
import { synaxariumAnchorFromSelection, type RawSelection } from '../../src/domain/highlights';
import { nowHour } from '../../src/platform/today';

function hourLabel(h: number): string {
  if (h === 0) return 'Midnight';
  if (h === 12) return 'Noon';
  const am = h < 12;
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve} ${am ? 'AM' : 'PM'}`;
}

export default function HoursScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const today = useClock((s) => s.today);
  const { prayedOn, ensureDate } = useOffices();
  useEffect(() => {
    void ensureDate(today);
  }, [today, ensureDate]);

  const info = getDayInfo(today);
  const offices = officesForDay();
  const current = officeForHour(nowHour());
  const prayed = new Set(prayedOn(today));
  const saint = primarySaint(info.coptic);
  const saveHighlight = useHighlights((s) => s.save);

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

  return (
    <Page>
      <Folio left={copy.hours.head} right={liturgicalLabel(info)} glyph="Ⲃ" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <Rubric>{copy.hours.head}</Rubric>
        <Text style={styles.title}>{copy.hours.title}</Text>
        <Text style={styles.subtitle}>{copy.hours.subtitle}</Text>

        <View style={{ marginTop: 18 }}>
          {offices.map((o) => {
            const isKept = prayed.has(o.key);
            const isNow = o.key === current.key;
            return (
              <Pressable key={o.key} style={styles.row} onPress={() => router.push(`/office/${o.key}`)}>
                <Caps size={9} ls={0.6} color={t.ink3} style={{ width: 68 }}>
                  {hourLabel(o.hour)}
                </Caps>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, isKept && { color: t.ink3, textDecorationLine: 'line-through' }]}>
                    {o.name}
                  </Text>
                  <Caps size={8} ls={1.2} color={t.ink2}>
                    {o.commemoration}
                  </Caps>
                </View>
                {isKept ? (
                  <Mark state="kept" size={18} />
                ) : isNow ? (
                  <View style={styles.nowTag}>
                    <Caps size={8.5} ls={1.6} color={t.goldHi}>
                      {copy.hours.now}
                    </Caps>
                  </View>
                ) : (
                  <Mark state="open" size={18} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Rubric num="Ⲙ">{copy.hours.saint}</Rubric>
        <View style={styles.saint}>
          <Text style={styles.saintName}>{saint?.name ?? '—'}</Text>
          {saint?.title ? (
            <Caps size={8.5} ls={1.4} color={t.ink3} style={{ marginTop: 4 }}>
              {saint.title}
            </Caps>
          ) : null}
          <Fleuron />
          {saint ? (
            <SelectableProse
              text={saint.life}
              textStyle={styles.saintLife}
              onSaveSelection={onSaveLifeSelection}
              onPressWhole={markWholeSaint}
            />
          ) : (
            <Text style={styles.saintLife}>{copy.hours.noSaint}</Text>
          )}
        </View>

        <View style={{ height: 24 }} />
        <Btn kind="line" onPress={() => router.push('/ordo')}>
          {copy.hours.ordo}
        </Btn>
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 36, color: t.parch, marginTop: 6 },
  subtitle: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  name: { fontFamily: font.display, fontSize: 21, color: t.parch },
  nowTag: { borderWidth: 1, borderColor: t.rule, paddingVertical: 4, paddingHorizontal: 8 },
  saint: { marginTop: 6 },
  saintName: { fontFamily: font.display, fontSize: 24, color: t.parch },
  saintLife: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, lineHeight: 22 },
});
