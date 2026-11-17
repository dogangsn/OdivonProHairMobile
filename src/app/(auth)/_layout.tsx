import { Stack } from 'expo-router';
import { useTheme } from '../../ui/theme';

export default function AuthLayout() {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: t.background },
        headerTintColor: t.primary,
        headerTitle: '',
        headerBackTitle: 'Geri',
        contentStyle: { backgroundColor: t.background },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
    </Stack>
  );
}
