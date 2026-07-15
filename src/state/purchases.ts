/**
 * Purchases store — the optional "Support the app" flow (in-app purchases via
 * RevenueCat). Thin glue over `src/platform/purchases.ts`, same pattern as the
 * other stores. Resilient: a failure degrades to "support unavailable" and never
 * throws (mirrors the startup-resilience contract).
 *
 * `isSupporter` is derived from the active `supporter` entitlement and is the
 * single source the future Coptic-learn gate will read.
 */
import { create } from 'zustand';
import type { PurchasesPackage } from 'react-native-purchases';
import { isPurchasesConfigured } from '../lib/config';
import {
  fetchOfferings,
  fetchCustomerInfo,
  purchase,
  restorePurchases,
  isSupporterActive,
} from '../platform/purchases';

interface PurchasesState {
  /** SDK configured and an offering with packages was loaded. */
  available: boolean;
  loading: boolean;
  purchasing: boolean;
  isSupporter: boolean;
  /** One-time tip packages (non-subscription products). */
  tips: PurchasesPackage[];
  /** Auto-renewable supporter packages (monthly / yearly). */
  subs: PurchasesPackage[];
  error: string | null;

  load: () => Promise<void>;
  /** Buy a tip or subscription package; returns true on success. */
  buy: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<void>;
}

const isSubscription = (p: PurchasesPackage) => p.product.productCategory === 'SUBSCRIPTION';

export const usePurchases = create<PurchasesState>((set) => ({
  available: false,
  loading: false,
  purchasing: false,
  isSupporter: false,
  tips: [],
  subs: [],
  error: null,

  load: async () => {
    if (!isPurchasesConfigured()) {
      set({ available: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const [offerings, info] = await Promise.all([fetchOfferings(), fetchCustomerInfo()]);
      const packages = offerings?.current?.availablePackages ?? [];
      set({
        available: packages.length > 0,
        tips: packages.filter((p) => !isSubscription(p)),
        subs: packages.filter(isSubscription),
        isSupporter: isSupporterActive(info),
      });
    } catch {
      set({ available: false });
    } finally {
      set({ loading: false });
    }
  },

  buy: async (pkg) => {
    set({ purchasing: true, error: null });
    try {
      const res = await purchase(pkg);
      if (res.ok) {
        set({ isSupporter: isSupporterActive(res.customerInfo) });
        return true;
      }
      // A user-cancel is silent; a real failure surfaces a message.
      if (!res.cancelled) set({ error: res.error ?? 'failed' });
      return false;
    } finally {
      set({ purchasing: false });
    }
  },

  restore: async () => {
    set({ loading: true, error: null });
    try {
      const info = await restorePurchases();
      set({ isSupporter: isSupporterActive(info) });
    } finally {
      set({ loading: false });
    }
  },
}));
