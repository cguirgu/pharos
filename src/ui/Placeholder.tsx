/** A styled placeholder for tabs/screens not yet built this phase. */
import React from 'react';
import { View } from 'react-native';
import { Page } from './Page';
import { Folio, Fleuron, Caps } from './components';
import { Text } from 'react-native';
import { font } from './theme';
import { useThemeColors } from './useStyles';
import { copy } from './copy';

export function Placeholder({ folio, glyph }: { folio: string; glyph?: string }) {
  const t = useThemeColors();
  return (
    <Page>
      <Folio left={folio} right={copy.placeholder.soon} glyph={glyph} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: font.displayItalic, fontSize: 24, color: t.ink2, textAlign: 'center' }}>
          {copy.placeholder.soon}
        </Text>
        <Fleuron />
        <Caps color={t.ink3} size={11} ls={1.6} style={{ textAlign: 'center' }}>
          {copy.placeholder.body}
        </Caps>
      </View>
    </Page>
  );
}
