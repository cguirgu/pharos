/**
 * The Synaxarium ships in two tiers, because two different things are bundled
 * under one filename and only one of them needs anyone's permission.
 *
 * TIER 1 — the COMMEMORATIONS: which saints and feasts fall on which Coptic
 * day. A calendar of facts, arranged the way the Church's own calendar dictates
 * — not creative expression — so these ship now. They are what the Today card,
 * the Saint-of-the-day screen, the Ordo day, and the commemoration reminder
 * render.
 *
 * This is also the kill switch. Flip it to `false` and `synaxariumDay` stops
 * reading the bundled dataset entirely, falling back to the six project-authored
 * seed feasts in `domain/content/synaxarium.ts`; no third-party wording renders
 * anywhere in the app. One line, one release. See docs/permissions/.
 */
export const SYNAXARIUM_NAMES = true;

/**
 * TIER 2 — the LIVES: the day's narrative account, in the English translation of
 * St. George C.O.C. Chicago. Copyrighted expression, still pending that church's
 * written permission (docs/permissions/01-st-george-chicago.md), so it is
 * withheld — and withheld in the DOMAIN, by `gateDayLife`, not merely hidden by
 * a UI condition. No screen can leak what never reaches it.
 *
 * Flip to `true` once permission is secured and the accounts light up on the
 * Saint screen, the Word tab, and the Ordo day with no other change.
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
