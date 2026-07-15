/**
 * Support the app — the optional, never-required way to give. Funds support the
 * developer, so this uses In-App Purchase only (no external/Stripe path on iOS).
 * One-time tips ship now; the auto-renewable supporter subscription is shown only
 * when SUPPORT_SUBSCRIPTION_ENABLED (it must carry a real benefit before App
 * Review). Voice stays warm — "the lamp is tended, not stormed", never guilt.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Fleuron, Seal, Btn } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { usePurchases } from '../../src/state/purchases';
import { SUPPORT_ENABLED, SUPPORT_SUBSCRIPTION_ENABLED } from '../../src/content/flags';

/** Human label for a subscription package (e.g. "Monthly · $1.99"). */
function subLabel(pkg: PurchasesPackage): string {
  const term = pkg.packageType === 'ANNUAL' ? 'Yearly' : pkg.packageType === 'MONTHLY' ? 'Monthly' : pkg.product.title;
  return `${term} · ${pkg.product.priceString}`;
}

export default function Support() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const c = copy.you.supportScreen;

  const { available, loading, purchasing, isSupporter, tips, subs, load, buy, restore } = usePurchases();
  const [thanked, setThanked] = useState(false);

  // Master flag off → feature is hidden; bounce back if reached via a deep link.
  useEffect(() => {
    if (!SUPPORT_ENABLED) {
      router.back();
      return;
    }
    void load();
  }, [load, router]);

  if (!SUPPORT_ENABLED) return null;

  const onBuy = async (pkg: PurchasesPackage) => {
    const ok = await buy(pkg);
    if (ok) setThanked(true);
  };

  const showSubs = SUPPORT_SUBSCRIPTION_ENABLED && subs.length > 0;

  return (
    <Page>
      <SheetBar left={copy.you.head} title={c.title} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Seal size={64} />
          <Fleuron />
        </View>

        <Text style={styles.heading}>{c.heading}</Text>
        <Text style={styles.body}>{c.body}</Text>

        {isSupporter ? (
          <Caps size={9.5} ls={1.4} color={t.feast} style={{ marginTop: 16, textAlign: 'center' }}>
            {c.supporterActive}
          </Caps>
        ) : thanked ? (
          <Caps size={9.5} ls={1.4} color={t.goldHi} style={{ marginTop: 16, textAlign: 'center' }}>
            {c.thanks}
          </Caps>
        ) : null}

        {!available && !loading ? (
          <Caps size={9} ls={1.4} color={t.ink3} style={{ marginTop: 20, textAlign: 'center' }}>
            {c.unavailable}
          </Caps>
        ) : null}

        {tips.length > 0 ? (
          <>
            <Rubric>{c.tipsTitle}</Rubric>
            <Caps size={9} ls={1.2} color={t.ink3} style={{ marginBottom: 8 }}>{c.tipsHint}</Caps>
            {tips.map((pkg) => (
              <Btn
                key={pkg.identifier}
                kind="line"
                onPress={() => onBuy(pkg)}
                disabled={purchasing}
                style={{ marginTop: 10 }}
              >
                {pkg.product.priceString}
              </Btn>
            ))}
          </>
        ) : null}

        {showSubs ? (
          <>
            <Rubric>{c.subTitle}</Rubric>
            <Caps size={9} ls={1.2} color={t.ink3} style={{ marginBottom: 8 }}>{c.subHint}</Caps>
            {subs.map((pkg) => (
              <Btn
                key={pkg.identifier}
                kind="solid"
                onPress={() => onBuy(pkg)}
                disabled={purchasing}
                style={{ marginTop: 10 }}
              >
                {subLabel(pkg)}
              </Btn>
            ))}
            <Text style={styles.legal}>{c.legal}</Text>
            <View style={styles.links}>
              <Text style={styles.link} onPress={() => router.push('/you/terms')}>{copy.you.terms}</Text>
              <Text style={styles.link} onPress={() => router.push('/you/privacy')}>{copy.you.privacy}</Text>
            </View>
          </>
        ) : null}

        {available ? (
          <Btn kind="line" onPress={() => void restore()} disabled={loading} style={{ marginTop: 24 }}>
            {c.restore}
          </Btn>
        ) : null}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  heading: { fontFamily: font.display, fontSize: 30, color: t.parch, marginTop: 8 },
  body: { fontFamily: font.bodyItalic, fontSize: 16, color: t.ink2, lineHeight: 24, marginTop: 10 },
  legal: { fontFamily: font.body, fontSize: 11, color: t.ink3, lineHeight: 17, marginTop: 16 },
  links: { flexDirection: 'row', gap: 20, marginTop: 12 },
  link: { fontFamily: font.caps, fontSize: 10, letterSpacing: 1.4, color: t.gold, textTransform: 'uppercase' },
});
