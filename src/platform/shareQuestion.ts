/**
 * Share one question to the OS share sheet — Messages, Mail, anywhere — with a
 * link back into the app.
 *
 * Uses React Native's own `Share`, not expo-sharing: expo-sharing shares FILES
 * (which is exactly right for the data export in ./exportData.ts), while this
 * shares a message plus a URL, which is what iMessage and Mail expect.
 *
 * ⚠️ PLATFORM SPLIT: iOS renders `message` and `url` as separate items, so the
 * link becomes a preview card. Android has no `url` field at all and silently
 * drops it — there the link has to be inside the text.
 *
 * ⚠️ LOCAL-ONLY PHASE: the link resolves on the SENDER's device. Until questions
 * are backed by a shared server, the recipient's app has no such row, so it will
 * open the app but not find the question. That is the largest visible gap in
 * this phase and is worth saying out loud before launch.
 */
import { Platform, Share } from 'react-native';
import * as Linking from 'expo-linking';
import { copy } from '../ui/copy';

/**
 * Set once a universal-link domain is live (the repo already deploys a static
 * site — see web/ and vercel.json). Until then, links use the app's own scheme.
 * Making it real is a deploy task: an apple-app-site-association file on the
 * domain, `ios.associatedDomains`, and Android intentFilters with autoVerify.
 */
export const SHARE_WEB_BASE: string | null = null;

/** A deep link to one question. */
export function questionUrl(questionId: string): string {
  if (SHARE_WEB_BASE) return `${SHARE_WEB_BASE}/q/${questionId}`;
  // createURL also produces the right exp://…/--/… form under Expo Go, so the
  // link is testable on device today without a standalone build.
  return Linking.createURL(`/questions/${questionId}`);
}

/** Open the share sheet. Resolves true only if the share actually happened. */
export async function shareQuestion(args: { id: string; title: string }): Promise<boolean> {
  const url = questionUrl(args.id);
  const message = copy.questions.shareMessage(args.title, url);
  try {
    const result = await Share.share(
      Platform.OS === 'ios' ? { message, url } : { message },
      { dialogTitle: copy.questions.share, subject: copy.questions.shareSubject },
    );
    return result.action === Share.sharedAction;
  } catch {
    // Best-effort: a sheet that cannot open simply does nothing to the UI.
    return false;
  }
}
