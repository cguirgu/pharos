/**
 * Feedback submission — the client seam between the in-app feedback form and the
 * `submit-feedback` Supabase Edge Function (which creates the Linear ticket
 * server-side, holding the Linear API key as a secret).
 *
 * `functions.invoke` attaches the anon apikey automatically, and the signed-in
 * user's JWT when there is one — so guests submit anonymously and the Edge
 * Function derives the (optional) user identity from the token itself.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { isBackendConfigured } from './config';
import {
  MAX_FEEDBACK_LENGTH,
  type FeedbackType,
  type FeedbackPriority,
} from '../domain/feedback';

export interface SubmitFeedbackInput {
  type: FeedbackType;
  priority: FeedbackPriority;
  /** The route the user was on when they opened the form. */
  screen: string | null;
  message: string;
}

/** Thrown when the backend isn't configured (e.g. Expo Go without keys). */
export class FeedbackUnavailableError extends Error {
  constructor() {
    super('Feedback backend is not configured.');
    this.name = 'FeedbackUnavailableError';
  }
}

/** True when feedback can actually be delivered (Supabase configured). */
export function canSubmitFeedback(): boolean {
  return isBackendConfigured();
}

/**
 * Send a feedback submission. Resolves with the created issue URL (if the server
 * returns one). Throws `FeedbackUnavailableError` when unconfigured, or a plain
 * Error when the request fails — the modal maps these to user-facing copy.
 */
export async function submitFeedback(input: SubmitFeedbackInput): Promise<{ url?: string }> {
  if (!canSubmitFeedback()) throw new FeedbackUnavailableError();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getSupabase } = require('./supabase') as typeof import('./supabase');

  const body = {
    type: input.type,
    priority: input.priority,
    screen: input.screen,
    message: input.message.trim().slice(0, MAX_FEEDBACK_LENGTH),
    appVersion: Constants.expoConfig?.version ?? null,
    platform: Platform.OS,
  };

  const { data, error } = await getSupabase().functions.invoke('submit-feedback', { body });
  if (error) throw new Error(error.message);
  return { url: (data as { url?: string } | null)?.url };
}
