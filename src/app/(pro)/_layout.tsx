import { Stack } from 'expo-router';
import { useTheme } from '../../ui/theme';

/** Salon mode: tabs plus detail screens. */
export default function ProLayout() {
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
      <Stack.Screen name="appointment/[id]" options={{ title: 'Randevu' }} />
    </Stack>
  );
}
