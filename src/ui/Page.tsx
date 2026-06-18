/**
 * Page chrome — the parchment "leaf": oxford-ink background with faint laid-paper
 * stripes and a top vignette, inside the safe area. Page padding 26px (Folio).
 */
import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space, type Palette } from './theme';
import { useStyles, useThemeColors } from './useStyles';

export function Page({
  children,
  pad = true,
  style,
}: {
  children: React.ReactNode;
  pad?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* faint top vignette — a banded fade (no hard edge / seam) */}
      <View pointerEvents="none" style={styles.vignette}>
        {t.vignetteBands.map((color, i) => (
          <View key={i} style={{ height: 24, backgroundColor: color }} />
        ))}
      </View>
      <View style={[styles.body, pad && { paddingHorizontal: space.page }, style]}>{children}</View>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  body: { flex: 1, minHeight: 0 },
  vignette: { position: 'absolute', top: 0, left: 0, right: 0 },
});
