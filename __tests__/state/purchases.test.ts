/**
 * Purchases store — the optional "Support Pharos" flow. The native RevenueCat
 * wrapper is mocked; these assert the store splits packages, derives isSupporter
 * from entitlements, stays inert when unconfigured, and degrades without throwing.
 */
import { isPurchasesConfigured } from '../../src/lib/config';
import * as iap from '../../src/platform/purchases';
import { usePurchases } from '../../src/state/purchases';

jest.mock('../../src/lib/config', () => ({ isPurchasesConfigured: jest.fn() }));
jest.mock('../../src/platform/purchases', () => ({
  fetchOfferings: jest.fn(),
  fetchCustomerInfo: jest.fn(),
  purchase: jest.fn(),
  restorePurchases: jest.fn(),
  isSupporterActive: (info: any) => Boolean(info?.entitlements?.active?.supporter),
}));

const configured = isPurchasesConfigured as jest.Mock;
const mock = iap as jest.Mocked<typeof iap>;

const tip = { identifier: 'tip.small', packageType: 'CUSTOM', product: { priceString: '$1.99', productCategory: 'NON_SUBSCRIPTION', title: 'Small gift' } } as any;
const sub = { identifier: 'supporter.monthly', packageType: 'MONTHLY', product: { priceString: '$1.99', productCategory: 'SUBSCRIPTION', title: 'Supporter' } } as any;
const supporterInfo = { entitlements: { active: { supporter: {} } } } as any;
const plainInfo = { entitlements: { active: {} } } as any;

beforeEach(() => {
  jest.clearAllMocks();
  usePurchases.setState({ available: false, loading: false, purchasing: false, isSupporter: false, tips: [], subs: [], error: null });
});

test('load is inert (no SDK calls) when purchases are unconfigured', async () => {
  configured.mockReturnValue(false);
  await usePurchases.getState().load();
  expect(usePurchases.getState().available).toBe(false);
  expect(mock.fetchOfferings).not.toHaveBeenCalled();
});

test('load splits tips vs subscriptions and reads the supporter entitlement', async () => {
  configured.mockReturnValue(true);
  mock.fetchOfferings.mockResolvedValue({ current: { availablePackages: [tip, sub] } } as any);
  mock.fetchCustomerInfo.mockResolvedValue(supporterInfo);
  await usePurchases.getState().load();
  const s = usePurchases.getState();
  expect(s.available).toBe(true);
  expect(s.tips.map((p) => p.identifier)).toEqual(['tip.small']);
  expect(s.subs.map((p) => p.identifier)).toEqual(['supporter.monthly']);
  expect(s.isSupporter).toBe(true);
});

test('a successful purchase sets isSupporter from the returned customer info', async () => {
  configured.mockReturnValue(true);
  mock.purchase.mockResolvedValue({ ok: true, customerInfo: supporterInfo } as any);
  const ok = await usePurchases.getState().buy(sub);
  expect(ok).toBe(true);
  expect(usePurchases.getState().isSupporter).toBe(true);
  expect(usePurchases.getState().error).toBeNull();
});

test('a cancelled purchase is silent (no error); a real failure surfaces one', async () => {
  configured.mockReturnValue(true);
  mock.purchase.mockResolvedValueOnce({ ok: false, cancelled: true } as any);
  expect(await usePurchases.getState().buy(tip)).toBe(false);
  expect(usePurchases.getState().error).toBeNull();

  mock.purchase.mockResolvedValueOnce({ ok: false, cancelled: false, error: 'boom' } as any);
  expect(await usePurchases.getState().buy(tip)).toBe(false);
  expect(usePurchases.getState().error).toBe('boom');
});

test('restore updates isSupporter from restored entitlements', async () => {
  configured.mockReturnValue(true);
  mock.restorePurchases.mockResolvedValue(supporterInfo);
  await usePurchases.getState().restore();
  expect(usePurchases.getState().isSupporter).toBe(true);

  mock.restorePurchases.mockResolvedValue(plainInfo);
  await usePurchases.getState().restore();
  expect(usePurchases.getState().isSupporter).toBe(false);
});

test('load degrades to unavailable (never throws) when offerings are null', async () => {
  configured.mockReturnValue(true);
  mock.fetchOfferings.mockResolvedValue(null);
  mock.fetchCustomerInfo.mockResolvedValue(null);
  await expect(usePurchases.getState().load()).resolves.toBeUndefined();
  expect(usePurchases.getState().available).toBe(false);
});
