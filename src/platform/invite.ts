/**
 * "Invite a friend" — hand the App Store link to the OS share sheet.
 *
 * Uses React Native's own `Share` API, not expo-sharing: expo-sharing shares
 * FILES (that's what the data export uses), while this shares a message + URL,
 * which is what iMessage / WhatsApp / Mail all expect.
 *
 * Platform split: iOS renders `message` and `url` as separate items (so the
 * link becomes a rich preview card), whereas Android has no `url` field at all
 * and would silently drop it — there the link is appended to the text.
 */
import { Platform, Share } from 'react-native';
import { APP_STORE_URL } from '../content/links';
import { copy } from '../ui/copy';

/** Open the share sheet with the invite. Resolves true if the friend-facing
 *  share actually happened (false if dismissed, or the sheet could not open). */
export async function inviteAFriend(url: string = APP_STORE_URL): Promise<boolean> {
  const message = copy.you.inviteMessage;
  try {
    const result = await Share.share(
      Platform.OS === 'ios' ? { message, url } : { message: `${message} ${url}` },
      { dialogTitle: copy.you.invite, subject: copy.you.inviteSubject },
    );
    return result.action === Share.sharedAction;
  } catch {
    // Best-effort: a sheet that cannot open simply does nothing to the UI.
    return false;
  }
}
