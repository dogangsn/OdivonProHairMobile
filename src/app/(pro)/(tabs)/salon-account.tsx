import * as WebBrowser from 'expo-web-browser';
import { config } from '../../../config';
import { useSession } from '../../../session/SessionProvider';
import { Body, Button, Card, Screen, SectionTitle, Title } from '../../../ui/components';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  manager: 'Müdür',
  receptionist: 'Resepsiyon',
  stylist: 'Kuaför',
  cashier: 'Kasiyer',
};

export default function SalonAccount() {
  const { staff, user, switchMode, signOut } = useSession();
  const role = staff?.isOwner ? 'Salon sahibi' : staff?.role ? ROLE_LABELS[staff.role] ?? staff.role : '-';

  return (
    <Screen>
      <Title>Hesap</Title>
      <Card>
        <SectionTitle>{staff?.tenantName}</SectionTitle>
        <Body muted>
          {user?.email} · {role}
        </Body>
      </Card>
      <Card>
        <Body muted>Katalog, personel, kasa ve raporların tamamı şimdilik web panelde.</Body>
        <Button title="Web paneli aç" variant="secondary" onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/dashboard`)} />
      </Card>
      <Button title="Müşteri moduna geç" variant="secondary" onPress={() => switchMode('customer')} />
      <Button title="Çıkış yap" variant="danger" onPress={signOut} />
    </Screen>
  );
}
