/**
 * SelectableProse — renders prose as selectable text and floats a small
 * "Save selection" tooltip over the passage while a range is selected.
 *
 * Capture technique: a read-only multiline <TextInput>. Unlike <Text selectable>,
 * a TextInput exposes the live selection to JS via onSelectionChange
 * ({start, end} character offsets into `value`) with no native dependency — so it
 * runs in Expo Go. The component is intentionally dumb: it owns no domain logic,
 * only emitting the raw {start, end}; callers map that to an anchor via the pure
 * helpers in src/domain/highlights/selection.ts.
 *
 * Dismissal: the tooltip hides when the selection collapses to a caret
 * (onSelectionChange with start === end) OR when the input loses focus — e.g.
 * tapping a different verse or tapping off the text (onBlur). The native copy
 * menu is suppressed (contextMenuHidden) so only our tooltip shows.
 *
 * ⚠️ DEVICE-ONLY behaviour (unverifiable without Xcode): that a read-only
 * TextInput yields draggable selection handles and fires onBlur on tap-away on
 * iOS. The whole-unit `onPressWhole` action is kept as a fallback.
 */
import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import { font, type Palette } from './theme';
import { useStyles, useThemeColors } from './useStyles';
import { Btn, Caps } from './components';
import { copy } from './copy';
import { keptFeedback } from '../platform/haptics';
import type { RawSelection } from '../domain/highlights';
import { isEmptySelection } from '../domain/highlights';

export function SelectableProse({
  text,
  textStyle,
  onSaveSelection,
  onPressWhole,
  saveLabel = copy.highlights.saveSelection,
  washColor,
}: {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  /** Called with the raw {start, end} when the reader taps the tooltip. */
  onSaveSelection: (sel: RawSelection) => void;
  /** Optional whole-unit fallback (e.g. save the entire verse/life). */
  onPressWhole?: () => void;
  saveLabel?: string;
  /** Wash behind the text when this unit already carries a highlight. */
  washColor?: string;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const selRef = useRef<RawSelection>({ start: 0, end: 0 });
  const [active, setActive] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClear = () => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  };

  const onSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const sel = e.nativeEvent.selection;
    selRef.current = sel;
    cancelClear();
    setActive(!isEmptySelection(sel));
  };

  // On blur, clear after a beat so a tap on the tooltip (which blurs the input)
  // still lands before the menu disappears.
  const onBlur = () => {
    cancelClear();
    blurTimer.current = setTimeout(() => setActive(false), 150);
  };

  const handleSave = () => {
    cancelClear();
    const sel = selRef.current;
    setActive(false);
    if (!isEmptySelection(sel)) {
      keptFeedback(); // a passage saved — the same finite pulse
      onSaveSelection(sel);
    }
  };

  return (
    <View style={washColor ? { backgroundColor: washColor } : undefined}>
      {active ? (
        <View style={styles.tipLayer} pointerEvents="box-none">
          <Pressable style={styles.tip} onPress={handleSave} hitSlop={8}>
            <Caps size={9} ls={1.6} color={t.onGold}>
              {saveLabel}
            </Caps>
          </Pressable>
          <View style={styles.tipCaret} />
        </View>
      ) : null}

      <TextInput
        value={text}
        editable={false}
        contextMenuHidden
        multiline
        scrollEnabled={false}
        showSoftInputOnFocus={false}
        selectionColor={t.gold}
        onSelectionChange={onSelectionChange}
        onBlur={onBlur}
        style={[styles.prose, textStyle]}
      />

      {!active && onPressWhole ? (
        <Btn kind="line" style={styles.save} onPress={() => { keptFeedback(); onPressWhole(); }}>
          {copy.highlights.saveMark}
        </Btn>
      ) : null}
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  // Defaults mirror the body prose; callers override via textStyle.
  prose: { fontFamily: font.body, fontSize: 18, color: t.parch, lineHeight: 28, padding: 0 },
  save: { marginTop: 10 },
  // Floating tooltip pill, centred just above the passage.
  tipLayer: { position: 'absolute', top: -36, left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  tip: { backgroundColor: t.gold, borderWidth: 1, borderColor: t.goldHi, paddingVertical: 7, paddingHorizontal: 14 },
  tipCaret: {
    width: 10,
    height: 10,
    backgroundColor: t.gold,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: t.goldHi,
    transform: [{ rotate: '45deg' }],
    marginTop: -5,
  },
});
