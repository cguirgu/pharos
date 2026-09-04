/**
 * The "what's new" sheet — shown once, on the first launch after an update.
 *
 * Written to be a tour rather than a changelog: each item can carry a route, so
 * the reader is taken to the thing instead of being told where to look for it.
 * Tapping a route both dismisses the sheet and navigates, so the feature is the
 * next thing on screen.
 */
import React from 'react';
import { View, Text, ScrollView, Modal, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Rubric, Caps, Btn, Fleuron } from './components';
import { font, type Palette } from './theme';
import { useStyles, useThemeColors } from './useStyles';
import { copy } from './copy';
import { useWhatsNew } from '../state/whatsNew';

export function WhatsNewSheet() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const pending = useWhatsNew((s) => s.pending);
  const dismiss = useWhatsNew((s) => s.dismiss);

  if (!pending) return null;

  const close = () => void dismiss(pending.version);
  const goTo = (route: string) => {
    close();
    router.push(route as never);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <View style={styles.wrap}>
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Caps size={8.5} ls={2.2} color={t.gold}>{copy.whatsNew.eyebrow}</Caps>
            <Text style={styles.title}>{copy.whatsNew.title}</Text>
            <Caps size={8.5} ls={1.6} color={t.ink3}>{pending.version}</Caps>
          </View>
          <Fleuron />
          <Text style={styles.headline}>{pending.headline}</Text>

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {pending.items.map((item) => (
              <View key={item.title} style={styles.item}>
                <Rubric>{item.title}</Rubric>
                <Text style={styles.body}>{item.body}</Text>
                {item.route && item.routeLabel ? (
                  <Pressable onPress={() => goTo(item.route!)} hitSlop={6} style={styles.linkRow}>
                    <Text style={styles.link}>{item.routeLabel} ›</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <Btn kind="solid" style={{ marginTop: 8 }} onPress={close}>
            {copy.whatsNew.dismiss}
          </Btn>
          <Text style={styles.hint}>{copy.whatsNew.laterHint}</Text>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.68)' },
  sheet: {
    maxHeight: '88%',
    backgroundColor: t.bg2,
    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: t.rule,
  },
  head: { alignItems: 'center', gap: 4 },
  title: { fontFamily: font.display, fontSize: 34, color: t.parch },
  headline: { fontFamily: font.bodyItalic, fontSize: 16, lineHeight: 24, color: t.ink2, textAlign: 'center' },
  list: { marginTop: 6 },
  item: { marginBottom: 4 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 23, color: t.ink2 },
  linkRow: { marginTop: 8 },
  link: { fontFamily: font.body, fontSize: 14, color: t.gold, textDecorationLine: 'underline' },
  hint: { fontFamily: font.bodyItalic, fontSize: 12, color: t.ink3, textAlign: 'center', marginTop: 12 },
});
