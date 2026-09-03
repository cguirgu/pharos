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
