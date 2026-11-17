import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { config } from '../../../config';
import { formatPhone } from '../../../lib/phone';
import { useSession } from '../../../session/SessionProvider';
import { Body, Button, Card, ErrorBox, Screen, SectionTitle, Title } from '../../../ui/components';

export default function Account() {
  const { user, staff, switchMode, signOut } = useSession();
  const [error, setError] = useState<string | null>(null);

  return (
    <Screen>
      <Title>Hesabım</Title>
      <Card>
        <Body muted>Giriş yapılan hesap</Body>
        <SectionTitle>{formatPhone(user?.phoneNumber) || user?.email || '-'}</SectionTitle>
      </Card>

      {staff ? (
        <Card>
          <SectionTitle>{staff.tenantName}</SectionTitle>
          <Body muted>Bu hesap bir salona bağlı. Salon ekranlarına geçebilirsin.</Body>
          <Button title="Salon moduna geç" onPress={() => switchMode('pro').catch((e: Error) => setError(e.message))} />
        </Card>
      ) : null}
      <ErrorBox message={error} />

      <Card>
        <Button title="Gizlilik ve KVKK" variant="ghost" onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/legal/privacy`)} />
        <Button title="Kullanım koşulları" variant="ghost" onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/legal/terms`)} />
      </Card>

      <Button title="Çıkış yap" variant="danger" onPress={signOut} />
    </Screen>
  );
}
