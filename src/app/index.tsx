import { Redirect } from 'expo-router';
import { useSession } from '../session/SessionProvider';

/** Entry: send each user to the start screen of their current mode. */
export default function Index() {
  const { user, mode } = useSession();
  if (!user) return <Redirect href="/welcome" />;
  return <Redirect href={mode === 'pro' ? '/today' : '/home'} />;
}
