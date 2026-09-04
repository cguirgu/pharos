/**
 * Release notes — what changed, shown once, in the app.
 *
 * The registry every future release adds one entry to. On the first launch
 * after an update, the newest release whose `version` the user has not yet been
 * shown gets a single "What's new" sheet, and is then never shown again.
 *
 * ## Adding a release
 * 1. Bump `version` in `app.config.ts`.
 * 2. Add an entry here with the SAME version string, newest first.
 * 3. That's all. The sheet, the "once only" bookkeeping, and the deep links are
 *    handled; `__tests__/content/releases.test.ts` checks the entry is well
 *    formed and that its links point at routes that exist.
 *
 * ## Rules this file follows
 * - **Newest first.** The order here is the order of the array, asserted by test.
 * - **Say where it is, not just what it is.** Every item may carry a `route`, so
 *   the sheet can take the reader straight to the thing rather than describing
 *   where to find it. This is the difference between a changelog and a tour.
 * - **Written for the person, not the repo.** No commit language, no internal
 *   names — "the Faith tab", never "the faith domain module".
 */

export interface ReleaseItem {
  /** Short headline for the change — a few words, sentence case. */
  readonly title: string;
  /** One or two sentences on what it is and why it is worth their time. */
  readonly body: string;
  /** Optional in-app route the sheet can open, e.g. '/(tabs)/faith'. */
  readonly route?: string;
  /** Label for the route button. Required when `route` is set. */
  readonly routeLabel?: string;
}

export interface Release {
  /** Must match `version` in app.config.ts exactly. */
  readonly version: string;
  /** The one-line banner for the release — also the push-notification body. */
  readonly headline: string;
  readonly items: readonly ReleaseItem[];
}

/** Newest first. */
export const RELEASES: readonly Release[] = [
  {
    version: '1.2.0',
    headline: 'A new Faith tab — learn Coptic theology, not just the language.',
    items: [
      {
        title: 'The Faith tab',
        body:
          'Nine units on where the Church began, what it confesses, how it differs from the Eastern Orthodox, and what it deliberately leaves as mystery. Every card shows the source it came from — tap it and read the original.',
        route: '/(tabs)/faith',
        routeLabel: 'Open Faith',
      },
      {
        title: 'The Creed assembles as you learn',
        body:
          'Finish a unit and it unseals one clause of the Nicene Creed. By the end you have built the whole confession, having earned each line by learning what stands behind it.',
        route: '/faith/creed',
        routeLabel: 'See the Creed',
      },
      {
        title: 'Learn is now Coptic',
        body:
          'The tab that teaches the language kept its course and took a clearer name, so it sits beside Faith as the two halves of what there is to learn. Ten new levels were added, drawn from the prayers of the Church.',
        route: '/(tabs)/coptic',
        routeLabel: 'Open Coptic',
      },
      {
        title: 'Invite a friend',
        body: 'A one-tap way to hand someone the app, on the You screen.',
      },
    ],
  },
];

/** The release notes for a given version, or null if that version has none. */
export function releaseFor(version: string): Release | null {
  return RELEASES.find((r) => r.version === version) ?? null;
}

/** The newest release in the registry. */
export const LATEST_RELEASE: Release | null = RELEASES[0] ?? null;
