/**
 * Entry gate: route based on the restored session.
 *  - no account            → Welcome / auth
 *  - account, not onboarded → onboarding
 *  - otherwise              → Today
 */
import { Redirect } from 'expo-router';
import { useAuth } from '../src/state/auth';

export default function Index() {
  const loaded = useAuth((s) => s.loaded);
  const account = useAuth((s) => s.account);

  if (!loaded) return null; // hold on the splash until the session is restored

  if (!account) return <Redirect href="/auth/welcome" />;
  if (!account.onboardingComplete) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/today" />;
}
