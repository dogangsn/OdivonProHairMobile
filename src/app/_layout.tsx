import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '../session/SessionProvider';
import { useTheme } from '../ui/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * One app, two modes. Signed-out users see the (auth) screens; signed-in users see either the
 * customer screens or the salon screens, depending on the mode they picked (see SessionProvider).
 */
function RootNavigator() {
  const { ready, user, mode } = useSession();
  const t = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const loaded = ready && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user && mode === 'customer'}>
        <Stack.Screen name="(customer)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user && mode === 'pro'}>
        <Stack.Screen name="(pro)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }),
  );
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
