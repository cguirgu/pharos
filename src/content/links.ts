/**
 * Canonical outbound links — the ONE place a public URL for the app is written.
 *
 * `APP_STORE_URL` is the short, country-agnostic App Store form
 * (`apps.apple.com/app/id…`): Apple redirects it to the visitor's own
 * storefront, so a link shared from a US phone still opens the store for a
 * friend in Egypt or Australia. The numeric id is the App Store id of the
 * `com.pharosapp.app` listing (Coptic Daily Companion).
 */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6781964728';

/** The public marketing/legal site (support + privacy + terms live under it). */
export const WEBSITE_URL = 'https://pharos-app.com';

/**
 * The public source repository. The app is MIT-licensed open source and the
 * About screen says so.
 *
 * ⚠️ App Review, guideline 3.1.1: the only restriction on outbound links is on
 * "buttons, external links, or other calls to action that direct customers to
 * purchasing mechanisms other than in-app purchase". A source repository is not
 * a purchasing mechanism, so this link is fine — but that stops being true if
 * the repository ever starts soliciting money. If a `.github/FUNDING.yml` or a
 * GitHub Sponsors button is added, GitHub renders a "Sponsor" control on the
 * page this link opens, and the in-app link would then point at a purchasing
 * mechanism. Keep funding config off the repo, or remove this link.
 */
export const SOURCE_URL = 'https://github.com/cguirgu/pharos';

/** Where a would-be contributor should actually start. */
export const CONTRIBUTING_URL = 'https://github.com/cguirgu/pharos/blob/main/CONTRIBUTING.md';
