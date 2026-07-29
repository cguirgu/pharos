/**
 * Feedback modal — a quick, structured way to send feedback from anywhere in the
 * app. Reached via the persistent top-right button (which passes the originating
 * route as `?from=`). Submissions become Linear tickets via the `submit-feedback`
 * Edge Function. Guests may submit anonymously.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Page } from '../src/ui/Page';
import { SheetBar, Caps, Btn, Field, Fleuron, Segmented, Seal } from '../src/ui/components';
import { font, type Palette } from '../src/ui/theme';
import { useStyles, useThemeColors } from '../src/ui/useStyles';
import { copy } from '../src/ui/copy';
import { keptFeedback } from '../src/platform/haptics';
import { submitFeedback, canSubmitFeedback, FeedbackUnavailableError } from '../src/lib/feedback';
import {
  FEEDBACK_TYPES,
  FEEDBACK_PRIORITIES,
  type FeedbackType,
  type FeedbackPriority,
} from '../src/domain/feedback';

/** Turn a route like "/(tabs)/today" into a readable label ("Today"). */
function humanizeRoute(from: string | null): string {
  if (!from) return copy.feedback.screenUnknown;
  const seg = from.split('?')[0]!.split('/').filter(Boolean).pop() ?? '';
  const cleaned = seg.replace(/[()[\]]/g, '').replace(/[-_]/g, ' ').trim();
  if (!cleaned) return copy.feedback.screenUnknown;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function FeedbackModal() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const c = copy.feedback;
  const params = useLocalSearchParams<{ from?: string }>();
  const from = typeof params.from === 'string' ? params.from : null;
  const screenLabel = useMemo(() => humanizeRoute(from), [from]);

  const [type, setType] = useState<FeedbackType>('bug');
  const [priority, setPriority] = useState<FeedbackPriority>('normal');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const canSend = message.trim().length > 0 && !busy;

  const onSubmit = async () => {
    if (!canSend) return;
    setBusy(true);
    setError(null);
    try {
      await submitFeedback({ type, priority, screen: from, message });
      keptFeedback();
      setSent(true);
    } catch (e) {
      setError(e instanceof FeedbackUnavailableError ? c.offline : c.error);
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Page>
        <SheetBar left={c.barLeft} title={c.barTitle} onBack={() => router.back()} />
        <View style={styles.thanksWrap}>
          <Seal size={92} animated delay={80} />
          <Fleuron />
          <Text style={styles.thanksTitle}>{c.thanksTitle}</Text>
          <Text style={styles.thanksBody}>{c.thanksBody}</Text>
        </View>
        <View style={{ paddingBottom: 8 }}>
          <Btn kind="solid" onPress={() => router.back()}>{c.thanksCta}</Btn>
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <SheetBar left={c.barLeft} title={c.barTitle} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.heading}>{c.heading}</Text>
          <Text style={styles.intro}>{c.intro}</Text>

          <Caps size={9} ls={1.6} color={t.ink2} style={styles.fieldLabel}>{c.typeLabel}</Caps>
          <Segmented
            options={FEEDBACK_TYPES.map((k) => ({ key: k, label: c.types[k]! }))}
            active={type}
            onChange={(k) => setType(k as FeedbackType)}
          />

          <Caps size={9} ls={1.6} color={t.ink2} style={styles.fieldLabel}>{c.priorityLabel}</Caps>
          <Segmented
            options={FEEDBACK_PRIORITIES.map((k) => ({ key: k, label: c.priorities[k]! }))}
            active={priority}
            onChange={(k) => setPriority(k as FeedbackPriority)}
          />

          <View style={styles.screenRow}>
            <Caps size={9} ls={1.6} color={t.ink2}>{c.screenLabel}</Caps>
            <Caps size={9} ls={1.4} color={t.ink3}>{screenLabel}</Caps>
          </View>

          <Field
            label={c.messageLabel}
            value={message}
            onChangeText={setMessage}
            placeholder={c.messagePlaceholder}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          {error ? (
            <Caps size={9} ls={1.2} color={t.rubricHi} style={{ marginTop: 16, textAlign: 'center' }}>{error}</Caps>
          ) : !canSubmitFeedback() ? (
            <Caps size={9} ls={1.2} color={t.ink3} style={{ marginTop: 16, textAlign: 'center' }}>{c.offline}</Caps>
          ) : null}

          <View style={{ height: 24 }} />
          <Btn kind="solid" onPress={onSubmit} disabled={!canSend}>
            {busy ? c.sending : c.submit}
          </Btn>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  heading: { fontFamily: font.display, fontSize: 30, color: t.parch, marginTop: 12 },
  intro: { fontFamily: font.body, fontSize: 15, color: t.ink2, lineHeight: 22, marginTop: 8 },
  fieldLabel: { marginTop: 24, marginBottom: 10 },
  screenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: t.ruleDim,
  },
  thanksWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  thanksTitle: { fontFamily: font.display, fontSize: 30, color: t.parch, textAlign: 'center' },
  thanksBody: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, lineHeight: 22, marginTop: 10, textAlign: 'center', maxWidth: 300 },
});
