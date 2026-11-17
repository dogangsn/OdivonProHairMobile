import * as WebBrowser from 'expo-web-browser';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { config } from '../../config';
import { auth } from '../../lib/firebase';
import { authErrorMessage, useSession } from '../../session/SessionProvider';
import { Body, Button, ErrorBox, Field, Screen, Title } from '../../ui/components';

/** Salon owner / staff sign-in with the same e-mail and password as the web panel. */
export default function SalonLogin() {
  const { signInSalon } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function resetPassword() {
    setError(null);
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
    <Screen>
      <Title subtitle="Salon panelinde kullandığınız e-posta ve şifreyle giriş yapın.">Salon girişi</Title>
      <Field
        label="E-posta"
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
        placeholder="Şifreniz"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={submit}
      />
      <ErrorBox message={error} />
      <Button title="Giriş yap" onPress={submit} loading={busy} />
      <Button
        title="Şifremi unuttum"
        variant="ghost"
        onPress={resetPassword}
      />
      {info ? <Body muted>{info}</Body> : null}
      <Button
        title="Salonunuz Odivon'da değil mi? Ücretsiz deneyin"
        variant="ghost"
        onPress={() => WebBrowser.openBrowserAsync(`${config.siteUrl}/auth/register`)}
      />
    </Screen>
  );
}
