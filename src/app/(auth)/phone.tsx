import { useRouter } from 'expo-router';
import { useState } from 'react';
import { normalizePhone } from '../../lib/phone';
import { useSession } from '../../session/SessionProvider';
import { Body, Button, ErrorBox, Field, Screen, Title } from '../../ui/components';

/** Customer sign-in, step 1: phone number → SMS code. */
export default function PhoneSignIn() {
  const router = useRouter();
  const { requestCustomerCode } = useSession();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const e164 = normalizePhone(phone);
    if (!e164) {
      setError('Geçerli bir cep telefonu numarası girin (05XX XXX XX XX).');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await requestCustomerCode(e164);
      router.push({ pathname: '/verify', params: { phone: e164 } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kod gönderilemedi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title subtitle="Numarana 6 haneli bir doğrulama kodu göndereceğiz.">Telefon numaran</Title>
      <Field
        label="Cep telefonu"
        placeholder="05XX XXX XX XX"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        value={phone}
        onChangeText={setPhone}
        onSubmitEditing={submit}
        autoFocus
      />
      <ErrorBox message={error} />
      <Button title="Kod gönder" onPress={submit} loading={busy} />
      <Body muted style={{ fontSize: 13 }}>
        {'Devam ederek Kullanım Koşulları’nı ve KVKK Aydınlatma Metni’ni kabul etmiş olursun.'}
      </Body>
    </Screen>
  );
}
