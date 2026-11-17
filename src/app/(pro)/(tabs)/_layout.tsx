import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useTheme } from '../../../ui/theme';

export default function ProTabs() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.border },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: 'Bugün', tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Takvim', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="customers"
        options={{ title: 'Müşteriler', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="salon-account"
        options={{ title: 'Hesap', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color as string} size={size} /> }}
      />
    </Tabs>
  );
}
