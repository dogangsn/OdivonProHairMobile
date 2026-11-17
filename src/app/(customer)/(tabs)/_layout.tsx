import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../../ui/TabBar';

const ICONS = { home: 'home-outline', 'my-appointments': 'calendar-outline', account: 'person-outline' } as const;

export default function CustomerTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} icons={ICONS} />}>
      <Tabs.Screen name="home" options={{ title: 'Keşfet' }} />
      <Tabs.Screen name="my-appointments" options={{ title: 'Randevularım' }} />
      <Tabs.Screen name="account" options={{ title: 'Hesabım' }} />
    </Tabs>
  );
}
