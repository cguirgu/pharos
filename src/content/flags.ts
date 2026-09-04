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
 * The Faith course (theology) — the development bypass for unreviewed cards.
 *
 * Doctrinal content is held to the same bar as the Agpeya text above: every
 * card in `src/domain/faith/units/*` carries its own `reviewed` flag, and the
 * player only shows a card once the project owner (Coptic Orthodox) has signed
 * it off. **All 156 cards were reviewed and approved by the owner on 2026-09-04**,
 * so the course is fully visible with this bypass OFF — which is where it must
 * stay for any public release.
 *
 * Turn it on only while authoring NEW cards, and turn it off before shipping.
 * Leaving it on would let an unreviewed card reach users silently, which is the
 * exact failure this flag exists to prevent.
 */
export const FAITH_SHOW_UNREVIEWED = false;
