# Support Pharos — In-App Purchase (setup & remaining to-dos)

The optional **"Support Pharos"** feature is fully built in code but **disabled
behind a flag**. Funds support the developer, so Apple mandates In-App Purchase
(no Stripe / external links on iOS). It ships as one-time **tips** now; the
**supporter subscription** is separately flagged off until it carries real value.

## Flags (src/content/flags.ts)
- `SUPPORT_ENABLED` (master) — **`false`**. While false, the You-screen row and the
  support screen are hidden everywhere. Flip to `true` once the setup below is done.
- `SUPPORT_SUBSCRIPTION_ENABLED` — **`false`**. Shows the auto-renewable subscription
  block. Keep off until it has a tangible benefit (a supporter perk, or the
  Coptic-learn gate). Has no effect unless `SUPPORT_ENABLED` is also true.

## What's already done (code)
- `react-native-purchases` (RevenueCat) installed.
- Guarded native wrapper `src/platform/purchases.ts` (lazy require; never throws).
- Store `src/state/purchases.ts` — exposes `isSupporter` (the `supporter`
  entitlement), tips/subs split, `load`/`buy`/`restore`. Inert when unconfigured.
- Screen `app/you/support.tsx` + You-tab row (both flag-gated) + copy in `src/ui/copy.ts`.
- Config plumbing: `REVENUECAT_IOS_KEY` via `app.config.ts` → `src/lib/config.ts`
  (`isPurchasesConfigured()`).
- Tests: `__tests__/state/purchases.test.ts` (green).

## Remaining to-dos (external — required before flipping `SUPPORT_ENABLED`)
1. **App Store Connect → Agreements:** accept the **Paid Applications Agreement**
   (banking + tax). IAP products will not load until this is active.
2. **Create products** in App Store Connect:
   - Consumable tips, e.g. `com.pharosapp.app.tip.small | .tip.medium | .tip.large`
     (display name, price, description per tier).
   - *(later)* Subscription group "Pharos Supporter":
     `com.pharosapp.app.supporter.monthly`, `…supporter.yearly`.
3. **RevenueCat dashboard:** create the project → add the App Store app → import the
   products → Offering `default` (add the tip packages; later the sub packages) →
   Entitlement **`supporter`** attached to the subscription products → paste the
   App Store Connect in-app-purchase key for receipt validation.
4. **Key:** put the RevenueCat **iOS public SDK key** in `REVENUECAT_IOS_KEY`
   (EAS secret + local `.env`).
5. **Dev build:** `eas build -p ios --profile development` (IAP can't run in Expo Go
   or the simulator). Verify the **In-App Purchase capability** is on the App ID.
6. **Sandbox tester:** App Store Connect → Users and Access → Sandbox.

## Go-live checklist
- [ ] Steps 1–6 above complete.
- [ ] Set `SUPPORT_ENABLED = true`.
- [ ] On a dev build + sandbox Apple ID: Support row appears → tip prices load →
      buy a tip → thank-you; user-cancel shows no error.
- [ ] Reinstall → **Restore purchases** works.
- [ ] *(subscription only)* give it a real benefit, then `SUPPORT_SUBSCRIPTION_ENABLED = true`;
      confirm the screen shows price, period, auto-renew text, Terms + Privacy links, Restore (Guideline 3.1.2).

## Deferred / out of scope
- **Coptic-learn gating past level 3** — will read the same `supporter` entitlement
  (`usePurchases().isSupporter`); no rework needed.
- **Android** — RevenueCat covers Play Billing when added; needs an Android SDK key.
- **Stripe** — not usable for developer support on iOS; only relevant if a future
  donation goes to a registered nonprofit/church.

---
*Broader pre-release follow-ups (App Store Connect submission, Supabase
leaked-password protection, on-device smoke tests) live in the audit plan at
`~/.claude/plans/audit-my-code-and-woolly-haven.md`.*
