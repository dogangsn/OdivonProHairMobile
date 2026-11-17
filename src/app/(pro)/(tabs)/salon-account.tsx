import * as WebBrowser from 'expo-web-browser';
import { View } from 'react-native';
import { config } from '../../../config';
import { useSession } from '../../../session/SessionProvider';
import { Avatar, Card, ListRow, Row, Screen, TAB_BAR_SPACE, Txt } from '../../../ui/components';
import { radius, space, useTheme } from '../../../ui/theme';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  manager: 'Müdür',
  receptionist: 'Resepsiyon',
  stylist: 'Kuaför',
  cashier: 'Kasiyer',
};

export default function SalonAccount() {
  const t = useTheme();
  const { staff, user, switchMode, signOut } = useSession();
  const role = staff?.isOwner ? 'Salon sahibi' : staff?.role ? ROLE_LABELS[staff.role] ?? staff.role : '-';

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Txt variant="title">Hesap</Txt>
      <Card>
        <Row gap={space.lg}>
          <Avatar name={staff?.tenantName ?? 'O'} size={60} />
          <View style={{ flex: 1, gap: 4 }}>
            <Txt variant="h2" numberOfLines={1}>
              {staff?.tenantName}
            </Txt>
            <Txt variant="caption" muted numberOfLines={1}>
              {user?.email}
            </Txt>
            <View style={{ alignSelf: 'flex-start', backgroundColor: t.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Txt variant="caption" color={t.primary} style={{ fontSize: 12 }}>
                {role}
              </Txt>
            </View>
          </View>
        </Row>
      </Card>

      <Card style={{ gap: 0, paddingVertical: space.sm }}>
        <ListRow
          icon="desktop-outline"
          title="Web paneli aç"
          subtitle="Katalog, personel, kasa ve detaylı raporlar"
          tone="info"
          onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/dashboard`)}
        />
        <ListRow icon="swap-horizontal" title="Müşteri moduna geç" subtitle="Başka bir salondan randevu al" tone="violet" onPress={() => switchMode('customer')} />
        <ListRow icon="log-out-outline" title="Çıkış yap" danger onPress={signOut} />
      </Card>
    </Screen>
  );
}
