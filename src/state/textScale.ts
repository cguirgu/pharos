/**
 * Reading text-size store — a scale factor applied to the long-form prose that
 * users actually read (scripture verses and the day's commemoration), persisted
 * per device via the settings k/v table. Chrome (headings, labels, nav) is left
 * fixed; only the reading body scales, mirroring how `useTheme` persists mode.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';

export type TextSize = 'sm' | 'md' | 'lg' | 'xl';

/** Multipliers applied to base reading font size + line height. */
const SCALE: Record<TextSize, number> = { sm: 0.9, md: 1, lg: 1.2, xl: 1.4 };

const KEY = 'app.text.size';

function isTextSize(v: unknown): v is TextSize {
  return v === 'sm' || v === 'md' || v === 'lg' || v === 'xl';
}

interface TextScaleState {
  size: TextSize;
  /** The resolved multiplier for `size` (1 = default). */
  scale: number;
  load: () => Promise<void>;
  setSize: (size: TextSize) => Promise<void>;
}

export const useTextScale = create<TextScaleState>((set) => ({
  size: 'md',
  scale: 1,

  load: async () => {
    let size: TextSize = 'md';
    try {
      const stored = await getRepo().getSetting(KEY);
      if (isTextSize(stored)) size = stored;
    } catch {
      // settings unavailable — keep the default scale
    }
    set({ size, scale: SCALE[size] });
  },

  setSize: async (size) => {
    set({ size, scale: SCALE[size] });
    try {
      await getRepo().setSetting(KEY, size);
    } catch {
      // persistence unavailable — the in-memory choice still applies this session
    }
  },
}));
