import * as WebBrowser from 'expo-web-browser';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { config } from '../../config';
import { auth } from '../../lib/firebase';
import { authErrorMessage, useSession } from '../../session/SessionProvider';
import { AuthShell } from '../../ui/AuthShell';
import { ErrorBox, Field, GradientButton, InfoBox, Row, Txt } from '../../ui/components';
import { font, useTheme } from '../../ui/theme';

/** Salon owner / staff sign-in with the same e-mail and password as the web panel. */
export default function SalonLogin() {
  const t = useTheme();
  const { signInSalon } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function resetPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Şifre sıfırlama bağlantısı için önce e-posta adresinizi yazın.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (e) {
      setError(authErrorMessage(e));
    }
  }

  async function submit() {
    if (!email.trim() || !password) {
      setError('E-posta ve şifrenizi girin.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInSalon(email, password);
    } catch (e) {
      setError(authErrorMessage(e));
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Tekrar hoş geldiniz 👋" subtitle="Salon hesabınıza giriş yapın.">
      <Field
        label="E-posta"
        icon="mail-outline"
        placeholder="ornek@salon.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="username"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        label="Şifre"
        icon="lock-closed-outline"
        placeholder="••••••••"
        secure
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={submit}
        trailing={
          <Pressable onPress={resetPassword} hitSlop={8}>
            <Text style={{ color: t.primary, fontFamily: font.bold, fontSize: 13 }}>Şifremi unuttum</Text>
          </Pressable>
        }
      />
      <ErrorBox message={error} />
      <InfoBox message={info} />
      <GradientButton title="Giriş yap" onPress={submit} loading={busy} />
      <Row gap={4} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <Txt variant="caption" muted>
          Salonunuz henüz kayıtlı değil mi?
        </Txt>
        <Pressable onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/auth/register`)} hitSlop={8}>
          <Text style={{ color: t.primary, fontFamily: font.bold, fontSize: 13 }}>Ücretsiz kaydedin</Text>
        </Pressable>
      </Row>
    </AuthShell>
  );
}
