/**
 * SheetBar — header for pushed screens & bottom sheets (DESIGN-SPEC §4).
 * Back chevron + caps label left · caps title centre · action right · hairline below.
 */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { K } from '../theme';
import { Caps } from './primitives';

export function SheetBar({
  left = 'Back',
  title,
  right,
  onBack,
}: {
  left?: string;
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <View>
      <View style={styles.row}>
        <Pressable onPress={onBack} style={styles.side} hitSlop={10}>
          <Caps color={K.goldHi} size={10} ls={2}>
            ‹ {left}
          </Caps>
        </Pressable>
        {title ? (
          <Caps color={K.ink2} size={10.5} ls={2.6} style={{ flex: 1, textAlign: 'center' }}>
            {title}
          </Caps>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  side: { minWidth: 64, justifyContent: 'center' },
  rule: { height: 1, backgroundColor: K.rule, marginBottom: 10 },
});
