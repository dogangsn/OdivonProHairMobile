import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { formatDate, isoDate, slugFromLink } from '../../../lib/dates';
import { loadBookings, type SavedBooking } from '../../../session/my-bookings';
import { Body, Button, Card, ErrorBox, Field, Screen, SectionTitle, Title } from '../../../ui/components';

/**
 * Customer home. First release: the customer reaches a salon through its booking link or QR code
 * ("salon bul" search comes with the MainApi discovery endpoints).
 */
export default function CustomerHome() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<SavedBooking[]>([]);

  useFocusEffect(
    useCallback(() => {
      const today = isoDate(new Date());
      loadBookings().then((list) =>
        setUpcoming(list.filter((b) => b.date >= today).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))),
      );
    }, []),
  );

  function openLink() {
    const slug = slugFromLink(link);
    if (!slug) {
      setError('Salonun randevu linkini (hair.odivon.com/r/...) yapıştırın.');
      return;
    }
    setError(null);
    router.push({ pathname: '/salon/[slug]', params: { slug } });
  }

  const next = upcoming[0];

  return (
    <Screen>
      <Title subtitle="Salonunu aç, hizmetini seç, randevunu al.">Merhaba 👋</Title>

      {next ? (
        <Card onPress={() => router.push({ pathname: '/booking/[slug]/[id]', params: { slug: next.slug, id: next.id } })}>
          <Body muted>Yaklaşan randevun</Body>
          <SectionTitle>{next.salonName}</SectionTitle>
          <Body>
            {formatDate(next.date)} · {next.startTime}
          </Body>
        </Card>
      ) : null}

      <Card>
        <SectionTitle>Salonunu aç</SectionTitle>
        <Body muted>Salonunun paylaştığı QR kodu okut ya da randevu linkini yapıştır.</Body>
        {Platform.OS !== 'web' ? <Button title="QR kod okut" onPress={() => router.push('/scan')} /> : null}
        <Field
          label="Randevu linki"
          placeholder="hair.odivon.com/r/salon-adi"
          autoCapitalize="none"
          autoCorrect={false}
          value={link}
          onChangeText={setLink}
          onSubmitEditing={openLink}
        />
        <ErrorBox message={error} />
        <Button title="Salonu aç" variant="secondary" onPress={openLink} />
      </Card>
    </Screen>
  );
}
