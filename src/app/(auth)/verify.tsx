import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { formatPhone } from '../../lib/phone';
import { useSession } from '../../session/SessionProvider';
import { AuthShell } from '../../ui/AuthShell';
import { Button, ErrorBox, GradientButton, InfoBox, OtpInput } from '../../ui/components';

const RESEND_SECONDS = 60;

/** Customer sign-in, step 2: the SMS code. On success the app switches to the customer screens. */
export default function VerifyCode() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signInCustomer, requestCustomerCode } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  async function submit(value = code) {
    if (!/^\d{6}$/.test(value)) {
      setError('Kod 6 haneli olmalı.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInCustomer(phone, value);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Giriş yapılamadı.');
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setInfo(null);
    try {
      await requestCustomerCode(phone);
      setInfo('Yeni kod gönderildi.');
      setWait(RESEND_SECONDS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kod gönderilemedi.');
    }
  }

  return (
    <AuthShell title="Kodu gir" subtitle={`${formatPhone(phone)} numarasına gönderdiğimiz 6 haneli kodu yaz.`}>
      <OtpInput value={code} onChange={setCode} onComplete={(v) => submit(v)} />
      <ErrorBox message={error} />
      <InfoBox message={info} />
      <GradientButton title="Giriş yap" onPress={() => submit()} loading={busy} />
      <Button
        title={wait > 0 ? `Kodu tekrar gönder (${wait} sn)` : 'Kodu tekrar gönder'}
        variant="ghost"
        disabled={wait > 0}
        onPress={resend}
      />
    </AuthShell>
  );
}
