/**
 * "What's new" — decides whether the release sheet should open, and remembers
 * that it has.
 *
 * Deliberately conservative in two ways:
 *
 *  • **Never on a first install.** Someone opening the app for the very first
 *    time is not "catching up on what changed" — they are meeting the whole app
 *    at once. Showing them a changelog would be noise. The seen-marker is
 *    therefore written silently on first run, and the sheet only ever appears
 *    for a genuine *upgrade*.
 *
 *  • **Once per version, forever.** The marker is the version string, stored per
 *    device in the settings k/v table, so it survives sign-out and account
 *    switching — this is a property of the install, not of the account.
 *
 * Local only: no permissions, no network, nothing to declare.
 */
import { create } from 'zustand';
import { getRepo, GUEST_ACCOUNT_ID } from '../db/repo';
import { releaseFor, type Release } from '../content/releases';

/** Marks the newest version whose notes the device has already been shown. */
const KEY = 'app.whatsNew.lastShownVersion';
/** Set on first ever run, so an install is never mistaken for an upgrade. */
const INSTALLED_KEY = 'app.whatsNew.installedVersion';

interface WhatsNewState {
  /** The release to show, or null when there is nothing to show. */
  pending: Release | null;
  ready: boolean;
  /** Decide, given the running app version. Safe to call more than once. */
  check: (currentVersion: string) => Promise<void>;
  /** Record that the sheet has been seen, and close it. */
  dismiss: (version: string) => Promise<void>;
}

// Settings are device-scoped; the guest account id is the device's own row.
const repo = () => getRepo(GUEST_ACCOUNT_ID);

export const useWhatsNew = create<WhatsNewState>((set) => ({
  pending: null,
  ready: false,

  check: async (currentVersion) => {
    try {
      const installed = await repo().getSetting(INSTALLED_KEY);
      if (installed === null) {
        // First ever run on this device. Record the version and show nothing —
        // there is nothing "new" about an app you have never opened.
        await repo().setSetting(INSTALLED_KEY, currentVersion);
        await repo().setSetting(KEY, currentVersion);
        set({ pending: null, ready: true });
        return;
      }
      const lastShown = await repo().getSetting(KEY);
      if (lastShown === currentVersion) {
        set({ pending: null, ready: true });
        return;
      }
      set({ pending: releaseFor(currentVersion), ready: true });
    } catch {
      // A settings read failure must never block the app behind a sheet.
      set({ pending: null, ready: true });
    }
  },

  dismiss: async (version) => {
    set({ pending: null });
    try {
      await repo().setSetting(KEY, version);
    } catch {
      // Worst case the sheet appears once more on the next launch.
    }
  },
}));
