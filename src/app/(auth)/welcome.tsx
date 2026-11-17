import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Body, Button, Card, Screen, SectionTitle } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';

/** First screen: the user says which side of the app they are here for. */
export default function Welcome() {
  const router = useRouter();
  const t = useTheme();
  return (
    <Screen>
      <View style={{ gap: space.sm, paddingTop: space.xxl, paddingBottom: space.lg }}>
        <Text style={{ fontSize: 34, fontWeight: '800', color: t.primary }}>Odivon</Text>
        <Body muted>Kuaför ve güzellik salonunuzla randevunuz tek uygulamada.</Body>
      </View>

      <Card>
        <SectionTitle>Randevu almak istiyorum</SectionTitle>
        <Body muted>Telefon numaranla giriş yap, salonunu seç, saniyeler içinde randevunu al.</Body>
        <Button title="Telefonla devam et" onPress={() => router.push('/phone')} />
      </Card>

      <Card>
        <SectionTitle>Salonumu yönetiyorum</SectionTitle>
        <Body muted>Salon sahibi ve personel girişi. Takvim, randevular ve müşteriler cebinde.</Body>
        <Button title="Salon girişi" variant="secondary" onPress={() => router.push('/salon-login')} />
      </Card>
    </Screen>
  );
}
