import { Stack } from 'expo-router';
import { useTheme } from '../../ui/theme';

/** Customer mode: tabs plus the booking flow screens pushed on top (headers drawn in-screen). */
export default function CustomerLayout() {
  const t = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="salon/[slug]" />
      <Stack.Screen name="booking/[slug]/[id]" />
      <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="r/[slug]" />
    </Stack>
  );
}
