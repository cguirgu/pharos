/**
 * Theme store — the active palette (light / dark / system), persisted per device
 * via the settings k/v table. `system` follows the OS appearance and re-resolves
 * live while selected. The resolved `palette` is assigned by reference (a module
 * constant), so style memoization keyed on it stays stable.
 */
import { create } from 'zustand';
import { Appearance } from 'react-native';
import { getRepo } from '../db/repo';
import { darkPalette, lightPalette, type Palette } from '../ui/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

const KEY = 'app.theme.mode';

function systemPalette(): Palette {
  return Appearance.getColorScheme() === 'light' ? lightPalette : darkPalette;
}

/** Resolve a mode to a concrete palette (by reference). */
export function resolvePalette(mode: ThemeMode): Palette {
  if (mode === 'light') return lightPalette;
  if (mode === 'dark') return darkPalette;
  return systemPalette();
}

interface ThemeState {
  mode: ThemeMode;
  palette: Palette;
  /** True once the persisted mode has loaded — gates the splash. */
  ready: boolean;
  load: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

let appearanceSub: { remove: () => void } | null = null;

export const useTheme = create<ThemeState>((set, get) => {
  // Subscribe to OS appearance changes only while following the system.
  const syncAppearance = (mode: ThemeMode) => {
    appearanceSub?.remove();
    appearanceSub = null;
    if (mode === 'system') {
      appearanceSub = Appearance.addChangeListener(() => {
        if (get().mode === 'system') set({ palette: systemPalette() });
      });
    }
  };

  return {
    mode: 'dark',
    palette: darkPalette,
    ready: false,

    load: async () => {
      let mode: ThemeMode = 'dark';
      try {
        const stored = await getRepo().getSetting(KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') mode = stored;
      } catch {
        // settings unavailable — keep the dark default
      }
      syncAppearance(mode);
      set({ mode, palette: resolvePalette(mode), ready: true });
    },

    setMode: async (mode) => {
      syncAppearance(mode);
      set({ mode, palette: resolvePalette(mode) });
      try {
        await getRepo().setSetting(KEY, mode);
      } catch {
        // persistence unavailable — the in-memory choice still applies this session
      }
    },
  };
});
