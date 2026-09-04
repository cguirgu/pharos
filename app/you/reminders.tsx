/**
 * Reminders — configure each notification channel (on/off + time). Times are
 * 24h; per-practice reminders keep their own times on the Rule screen.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Toggle, Stepper } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useNotifications } from '../../src/state/notifications';
import { CHANNELS, type ChannelConfig, type NotificationChannel } from '../../src/domain/notifications/types';
import {
  ANNOUNCEMENTS_TITLE,
  CONSENT_TEXT,
  OPTED_IN_TEXT,
} from '../../src/domain/notifications/announcements';
import { useAuth } from '../../src/state/auth';
import { GUEST_ACCOUNT_ID } from '../../src/db/repo';

const pad = (n: number) => String(n).padStart(2, '0');
const parse = (t: string): [number, number] => {
  const [h, m] = t.split(':').map(Number);
  return [h ?? 0, m ?? 0];
};

export default function RemindersScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const config = useNotifications((s) => s.config);
  const setChannel = useNotifications((s) => s.setChannel);
  const announcements = useNotifications((s) => s.announcements);
  const setAnnouncements = useNotifications((s) => s.setAnnouncements);
  const accountId = useAuth((s) => s.account?.id ?? null);

  return (
    <Page>
      <SheetBar left={copy.you.head} title={copy.reminders.head} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>{copy.reminders.title}</Text>
        <Text style={styles.subtitle}>{copy.reminders.subtitle}</Text>

        <View style={{ marginTop: 18 }}>
          {CHANNELS.map((ch) => {
            const c = config[ch.id];
            return (
              <View key={ch.id} style={styles.channel}>
                <View style={styles.channelHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{ch.title}</Text>
                    <Caps size={8.5} ls={1.2} color={t.ink2} style={{ marginTop: 3 }}>
                      {ch.description}
                    </Caps>
                  </View>
                  <Toggle value={c.enabled} onChange={(v) => void setChannel(ch.id, { enabled: v })} />
                </View>
                {c.enabled && ch.hasTime ? <TimeEditor id={ch.id} value={c} onChange={setChannel} /> : null}
              </View>
            );
          })}
        </View>

        {/* Release announcements — the one REMOTE channel, and the only
            promotional one. App Store guideline 4.5.4 requires an explicit
            opt-in "via consent language displayed in your app's UI" plus an
            in-app way out: the consent text sits above the switch, and the
            switch itself is the opt-out. Separated from the local cues above
            so it is never mistaken for one of them. */}
        <View style={styles.announceBlock}>
          <Caps size={8.5} ls={2} color={t.gold}>{copy.reminders.announceSection}</Caps>
          <View style={[styles.channelHead, { marginTop: 12 }]}>
            <View style={{ flex: 1, paddingRight: 14 }}>
              <Text style={styles.name}>{ANNOUNCEMENTS_TITLE}</Text>
            </View>
            <Toggle
              value={announcements.enabled}
              onChange={(v) => {
                void setAnnouncements(
                  v,
                  accountId && accountId !== GUEST_ACCOUNT_ID ? accountId : null,
                );
              }}
            />
          </View>
          <Text style={styles.consent}>
            {announcements.enabled ? OPTED_IN_TEXT : CONSENT_TEXT}
          </Text>
        </View>
      </ScrollView>
    </Page>
  );
}

function TimeEditor({
  id,
  value,
  onChange,
}: {
  id: NotificationChannel;
  value: ChannelConfig;
  onChange: (id: NotificationChannel, patch: Partial<ChannelConfig>) => Promise<void>;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const [h, m] = parse(value.time);
  const set = (nh: number, nm: number) => void onChange(id, { time: `${pad((nh + 24) % 24)}:${pad((nm + 60) % 60)}` });

  return (
    <View style={styles.timeRow}>
      <Caps size={9} ls={1.6} color={t.ink3}>{copy.reminders.at}</Caps>
      <View style={{ flex: 1 }}>
        <Stepper value={h} unit="hr" onDec={() => set(h - 1, m)} onInc={() => set(h + 1, m)} />
      </View>
      <View style={{ flex: 1 }}>
        <Stepper value={m} unit="min" onDec={() => set(h, m - 5)} onInc={() => set(h, m + 5)} />
      </View>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 30, color: t.parch, marginTop: 6 },
  subtitle: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 6 },
  announceBlock: {
    marginTop: 26,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: t.rule,
  },
  consent: { fontFamily: font.body, fontSize: 13.5, lineHeight: 21, color: t.ink2, marginTop: 10 },
  channel: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  channelHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { fontFamily: font.display, fontSize: 21, color: t.parch },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
});
