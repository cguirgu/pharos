/**
 * Theme-aware styling hooks. `useStyles` turns a module-level style factory into
 * a memoized StyleSheet for the active palette; `useThemeColors` returns the
 * palette for inline colour props. Both re-render their component when the theme
 * changes (zustand subscription on `palette`).
 *
 * Usage:
 *   const makeStyles = (t: Palette) => StyleSheet.create({ root: { backgroundColor: t.bg } });
 *   function Screen() {
 *     const styles = useStyles(makeStyles);   // makeStyles MUST be module-scoped
 *     const t = useThemeColors();
 *     ...
 *   }
 */
import { useMemo } from 'react';
import { useTheme } from '../state/theme';
import type { Palette } from './theme';

export function useThemeColors(): Palette {
  return useTheme((s) => s.palette);
}

export function useStyles<T>(factory: (t: Palette) => T): T {
  const palette = useTheme((s) => s.palette);
  return useMemo(() => factory(palette), [factory, palette]);
}
