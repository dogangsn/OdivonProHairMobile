import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../../ui/TabBar';

const ICONS = {
  today: 'grid-outline',
  calendar: 'calendar-outline',
  customers: 'people-outline',
  'salon-account': 'person-circle-outline',
} as const;

export default function ProTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} icons={ICONS} />}>
      <Tabs.Screen name="today" options={{ title: 'Bugün' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Takvim' }} />
      <Tabs.Screen name="customers" options={{ title: 'Müşteriler' }} />
      <Tabs.Screen name="salon-account" options={{ title: 'Hesap' }} />
    </Tabs>
  );
}
