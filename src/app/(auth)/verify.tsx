import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { formatPhone } from '../../lib/phone';
import { useSession } from '../../session/SessionProvider';
import { Button, ErrorBox, Field, Screen, Title } from '../../ui/components';

/** Customer sign-in, step 2: the SMS code. On success the app switches to the customer screens. */
export default function VerifyCode() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signInCustomer, requestCustomerCode } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit() {
    if (!/^\d{6}$/.test(code)) {
      setError('Kod 6 haneli olmalı.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInCustomer(phone, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Giriş yapılamadı.');
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await requestCustomerCode(phone);
      setInfo('Yeni kod gönderildi.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kod gönderilemedi.');
    }
  }

  return (
    <Screen>
      <Title subtitle={`${formatPhone(phone)} numarasına gönderilen kodu gir.`}>Doğrulama kodu</Title>
      <Field
        label="6 haneli kod"
        placeholder="••••••"
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={6}
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
        onSubmitEditing={submit}
        autoFocus
      />
      <ErrorBox message={error} />
      <Button title="Giriş yap" onPress={submit} loading={busy} />
      <Button title={info ?? 'Kodu tekrar gönder'} variant="ghost" onPress={resend} />
    </Screen>
  );
}
