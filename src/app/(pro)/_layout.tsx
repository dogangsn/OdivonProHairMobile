import { Stack } from 'expo-router';
import { useTheme } from '../../ui/theme';

/** Salon mode: tabs plus detail screens (headers drawn in-screen). */
export default function ProLayout() {
  const t = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="appointment/[id]" />
    </Stack>
  );
}
