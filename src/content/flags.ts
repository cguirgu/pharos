/**
 * Content-licensing flags. Some bundled content (the draft Synaxarium saint
 * lives, translated from St. George C.O.C. Chicago) is still pending written
 * permission. Until that's confirmed, `CONTENT_LICENSED` stays false and the
 * draft lives are withheld from the UI (feast names — structural facts — still
 * show). Flip to `true` once permission is secured.
 */
export const CONTENT_LICENSED = false;

/**
 * The Agpeya (Book of Hours) reader. Its prayer/litany prose is not yet supplied
 * (only the scripture references render from the bundled KJV), so the Hours flow
 * would show placeholder bodies — an App Review completeness (2.1) risk. Kept OFF
 * for launch: the Today fast/feast banner does not open Hours, which also keeps
 * the Ordo (reached only from Hours) out of the shipped UI. Flip to `true` once
 * the verified Agpeya text is bundled.
 */
export const HOURS_READY = false;

/**
 * Master switch for the optional "Support the app" in-app-purchase feature
 * (the You-screen row + the support screen). Stays OFF until the external setup
 * is done — see docs/SUPPORT-IAP.md (App Store Connect products, RevenueCat key,
 * a fresh dev build). While false, nothing about support is shown anywhere.
 */
export const SUPPORT_ENABLED = false;

/**
 * Within the support feature, the auto-renewable subscription block. Apple
 * requires a subscription to deliver ongoing value, so it stays OFF until it
 * carries a real benefit (a supporter perk, or the forthcoming Coptic-learn gate
 * that reads the same `supporter` entitlement). One-time tips need only
 * SUPPORT_ENABLED. (Has no effect unless SUPPORT_ENABLED is also true.)
 */
export const SUPPORT_SUBSCRIPTION_ENABLED = false;

/**
 * The Faith course (theology). Every card in `src/domain/faith/units/*` ships
 * `reviewed: false` until the project owner (Coptic Orthodox) signs it off —
 * this is doctrinal content, held to the same bar as the Agpeya text above.
 * While this flag is false, unreviewed cards are hidden from the player and a
 * lesson with nothing reviewed reads as "awaiting review" rather than empty.
 *
 * Set to `true` in development to author and see the whole course; flip the
 * cards' own `reviewed` fields to `true` as they are approved, and the course
 * opens up for real users without touching this flag.
 */
export const FAITH_SHOW_UNREVIEWED = true;
