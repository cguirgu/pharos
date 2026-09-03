/**
 * SelectableProse — renders prose as selectable text and floats a small tooltip
 * over the passage while a range is selected: "Save" it as a mark, and (where a
 * caller offers it) "Ask others" about it, which carries the selection into the
 * Questions composer as a citation.
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
import { keptFeedback, tapFeedback } from '../platform/haptics';
import type { RawSelection } from '../domain/highlights';
import { isEmptySelection } from '../domain/highlights';

export function SelectableProse({
  text,
  textStyle,
  onSaveSelection,
  onAskSelection,
  onPressWhole,
  saveLabel,
  askLabel = copy.questions.askSelection,
  washColor,
}: {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  /**
   * Save the selection as a mark. Optional because not every corpus can be
   * marked — the Agpeya has no highlight anchor yet, so its reader offers only
   * "Ask others" and the pill renders a single cell.
   */
  onSaveSelection?: (sel: RawSelection) => void;
  /**
   * Optional second action. When given, the pill splits into two cells; when
   * omitted the tooltip is exactly what it always was, so existing callers are
   * untouched.
   */
  onAskSelection?: (sel: RawSelection) => void;
  /** Optional whole-unit fallback (e.g. save the entire verse/life). */
  onPressWhole?: () => void;
  saveLabel?: string;
  askLabel?: string;
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

  // Both actions go through one runner so the blur-grace timer and the
  // empty-selection guard can never drift apart between them.
  const run = (fire: (sel: RawSelection) => void, haptic: () => void) => {
    cancelClear();
    const sel = selRef.current;
    setActive(false);
    if (!isEmptySelection(sel)) {
      haptic();
      fire(sel);
    }
  };

  // A passage saved — the same finite pulse as keeping a practice.
  const handleSave = () => {
    if (onSaveSelection) run(onSaveSelection, keptFeedback);
  };
  // Asking keeps nothing yet, it opens a screen — so a lighter tick.
  const handleAsk = () => {
    if (onAskSelection) run(onAskSelection, tapFeedback);
  };

  // "Save selection" is too wide once the pill carries two cells.
  const save = saveLabel ?? (onAskSelection ? copy.questions.saveSelection : copy.highlights.saveSelection);

  return (
    <View style={washColor ? { backgroundColor: washColor } : undefined}>
      {active && (onSaveSelection || onAskSelection) ? (
        <View style={styles.tipLayer} pointerEvents="box-none">
          <View style={styles.tip}>
            {onSaveSelection ? (
              <Pressable style={styles.tipCell} onPress={handleSave} hitSlop={8}>
                <Caps size={9} ls={1.6} color={t.onGold}>
                  {save}
                </Caps>
              </Pressable>
            ) : null}
            {onAskSelection ? (
              <>
                {onSaveSelection ? <View style={styles.tipDivide} /> : null}
                <Pressable style={styles.tipCell} onPress={handleAsk} hitSlop={8}>
                  <Caps size={9} ls={1.6} color={t.onGold}>
                    {askLabel}
                  </Caps>
                </Pressable>
              </>
            ) : null}
          </View>
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
  // A ruled division on a gold field — the same engraved logic as Segmented's
  // divided bar. Padding sits on each cell so the divider runs full height.
  tip: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: t.gold, borderWidth: 1, borderColor: t.goldHi },
  tipCell: { paddingVertical: 7, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  tipDivide: { width: 1, backgroundColor: t.onGold, opacity: 0.35 },
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
