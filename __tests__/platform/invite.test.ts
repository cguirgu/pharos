/**
 * "Invite a friend" — the share sheet gets the real App Store link, in the
 * shape each platform actually reads (iOS: message + url; Android: one string).
 */
import { Platform, Share } from 'react-native';
import { inviteAFriend } from '../../src/platform/invite';
import { APP_STORE_URL } from '../../src/content/links';
import { copy } from '../../src/ui/copy';

const setOS = (os: 'ios' | 'android') =>
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });

const originalOS = Platform.OS;
afterEach(() => setOS(originalOS as 'ios' | 'android'));

describe('inviteAFriend', () => {
  test('the link is the country-agnostic App Store URL', () => {
    expect(APP_STORE_URL).toBe('https://apps.apple.com/app/id6781964728');
  });

  test('iOS passes the message and the url as separate fields', async () => {
    setOS('ios');
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: Share.sharedAction, activityType: null });

    await expect(inviteAFriend()).resolves.toBe(true);
    expect(share).toHaveBeenCalledWith(
      { message: copy.you.inviteMessage, url: APP_STORE_URL },
      { dialogTitle: copy.you.invite, subject: copy.you.inviteSubject },
    );
  });

  test('Android folds the url into the message (it has no url field)', async () => {
    setOS('android');
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: Share.sharedAction, activityType: null });

    await inviteAFriend();
    expect(share.mock.calls[0]?.[0]).toEqual({
      message: `${copy.you.inviteMessage} ${APP_STORE_URL}`,
    });
  });

  test('dismissing the sheet reports "not shared" rather than throwing', async () => {
    jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.dismissedAction });
    await expect(inviteAFriend()).resolves.toBe(false);
  });

  test('a sheet that cannot open fails quietly', async () => {
    jest.spyOn(Share, 'share').mockRejectedValue(new Error('no share sheet'));
    await expect(inviteAFriend()).resolves.toBe(false);
  });
});
