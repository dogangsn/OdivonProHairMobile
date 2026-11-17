import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { config } from '../../../config';
import { formatPhone } from '../../../lib/phone';
import { loadProfile } from '../../../session/my-bookings';
import { useSession } from '../../../session/SessionProvider';
import { Avatar, Card, ErrorBox, GradientButton, ListRow, Row, Screen, TAB_BAR_SPACE, Txt } from '../../../ui/components';
import { space } from '../../../ui/theme';

export default function Account() {
  const { user, staff, switchMode, signOut } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadProfile().then((p) => setName(p ? `${p.firstName} ${p.lastName}` : null));
    }, []),
  );

  const identity = formatPhone(user?.phoneNumber) || user?.email || '';

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Txt variant="title">Hesabım</Txt>
      <Card>
        <Row gap={space.lg}>
          <Avatar name={name ?? identity} size={60} />
          <View style={{ flex: 1 }}>
            <Txt variant="h2">{name ?? 'Odivon üyesi'}</Txt>
            <Txt variant="caption" muted>
              {identity}
            </Txt>
          </View>
        </Row>
      </Card>

      {staff ? (
        <Card style={{ gap: space.md }}>
          <Txt variant="label" muted>
            Salon hesabın
          </Txt>
          <Txt variant="h3">{staff.tenantName}</Txt>
          <GradientButton title="Salon moduna geç" icon="swap-horizontal" onPress={() => switchMode('pro').catch((e: Error) => setError(e.message))} />
        </Card>
      ) : null}
      <ErrorBox message={error} />

      <Card style={{ gap: 0, paddingVertical: space.sm }}>
        <ListRow icon="shield-checkmark-outline" title="Gizlilik ve KVKK" tone="info" onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/legal/privacy`)} />
        <ListRow icon="document-text-outline" title="Kullanım koşulları" tone="violet" onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/legal/terms`)} />
        <ListRow icon="log-out-outline" title="Çıkış yap" danger onPress={signOut} />
      </Card>
    </Screen>
  );
}
