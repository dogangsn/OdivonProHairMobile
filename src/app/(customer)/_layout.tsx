import { Stack } from 'expo-router';
import { useTheme } from '../../ui/theme';

/** Customer mode: tabs plus the booking flow screens pushed on top. */
export default function CustomerLayout() {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: t.background },
        headerTintColor: t.primary,
        headerTitleStyle: { color: t.text },
        headerBackTitle: 'Geri',
        contentStyle: { backgroundColor: t.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="salon/[slug]" options={{ title: 'Randevu al' }} />
      <Stack.Screen name="booking/[slug]/[id]" options={{ title: 'Randevu' }} />
      <Stack.Screen name="scan" options={{ title: 'QR kod okut', presentation: 'modal' }} />
      <Stack.Screen name="r/[slug]" options={{ headerShown: false }} />
    </Stack>
  );
}
