/**
 * Page chrome — the parchment "leaf": oxford-ink background with faint laid-paper
 * stripes and a top vignette, inside the safe area. Page padding 26px (Folio).
 */
import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { K, space } from './theme';

export function Page({
  children,
  pad = true,
  style,
}: {
  children: React.ReactNode;
  pad?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* faint top vignette */}
      <View pointerEvents="none" style={styles.vignette} />
      <View style={[styles.body, pad && { paddingHorizontal: space.page }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: K.bg },
  body: { flex: 1, minHeight: 0 },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(201,168,74,0.03)',
  },
});
