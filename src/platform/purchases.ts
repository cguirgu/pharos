/**
 * RevenueCat (in-app purchases) wrapper for the optional "Support the app" flow.
 *
 * Funds support the developer, so Apple mandates In-App Purchase — there is no
 * external/Stripe path on iOS. The native module is required LAZILY (inside the
 * functions) so merely importing this file never touches the native binary; the
 * app still loads in Expo Go / jest when unconfigured. Every function is guarded
 * on `isPurchasesConfigured()` and returns typed results instead of throwing.
 *
 * Forward-looking: the `supporter` entitlement granted by the subscription is the
 * same primitive the future Coptic-learn gate (past level 3) will read.
 */
import type { CustomerInfo, PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import { REVENUECAT_IOS_KEY, isPurchasesConfigured } from '../lib/config';

/** RevenueCat entitlement id that marks an active supporter (set in the dashboard). */
export const ENTITLEMENT_SUPPORTER = 'supporter';

let configured = false;

function purchasesModule() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('react-native-purchases') as typeof import('react-native-purchases');
}

/** Configure the SDK once. Returns false (no-op) when unconfigured. */
export function configurePurchases(): boolean {
  if (!isPurchasesConfigured() || !REVENUECAT_IOS_KEY) return false;
  if (configured) return true;
  try {
    purchasesModule().default.configure({ apiKey: REVENUECAT_IOS_KEY });
    configured = true;
    return true;
  } catch {
    return false;
  }
}

/** Active-entitlement check; the single source of truth for "is a supporter". */
export function isSupporterActive(info: CustomerInfo | null): boolean {
  return Boolean(info?.entitlements.active[ENTITLEMENT_SUPPORTER]);
}

/** All available packages (tips + subscription), or null if unavailable. */
export async function fetchOfferings(): Promise<PurchasesOfferings | null> {
  if (!configurePurchases()) return null;
  try {
    return await purchasesModule().default.getOfferings();
  } catch {
    return null;
  }
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configurePurchases()) return null;
  try {
    return await purchasesModule().default.getCustomerInfo();
  } catch {
    return null;
  }
}

export type PurchaseResult =
  | { ok: true; customerInfo: CustomerInfo }
  | { ok: false; cancelled: boolean; error?: string };

/** Buy a package (tip or subscription). User-cancel is a non-error. */
export async function purchase(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!configurePurchases()) return { ok: false, cancelled: false, error: 'unavailable' };
  try {
    const { customerInfo } = await purchasesModule().default.purchasePackage(pkg);
    return { ok: true, customerInfo };
  } catch (e) {
    const cancelled = Boolean(e && typeof e === 'object' && (e as { userCancelled?: boolean }).userCancelled);
    return { ok: false, cancelled, error: e instanceof Error ? e.message : 'Purchase failed' };
  }
}

/** Restore prior purchases (Apple requires this affordance for subscriptions). */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!configurePurchases()) return null;
  try {
    return await purchasesModule().default.restorePurchases();
  } catch {
    return null;
  }
}
