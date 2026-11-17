import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { publicBooking } from '../../../../api/public-booking';
import { formatDate, formatMoney } from '../../../../lib/dates';
import { loadBookings, type SavedBooking } from '../../../../session/my-bookings';
import { Body, Button, Card, Empty, ErrorBox, Loading, Screen, SectionTitle, StatusBadge, Title } from '../../../../ui/components';

/** Live status of a booking made on this device, with cancel and "call the salon". */
export default function BookingDetail() {
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState<SavedBooking | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings().then((list) => setSaved(list.find((b) => b.id === id) ?? null));
  }, [id]);

  const appointment = useQuery({
    queryKey: ['public', slug, 'appointment', id],
    queryFn: () => publicBooking.appointment(slug, id, saved!.token),
    enabled: !!saved,
  });
  const info = useQuery({ queryKey: ['public', slug, 'info'], queryFn: () => publicBooking.info(slug) });

  if (saved === undefined || appointment.isLoading) return <Screen><Loading /></Screen>;
  if (!saved) return <Screen><Empty title="Randevu bu cihazda bulunamadı" /></Screen>;

  const a = appointment.data;
  const cancellable = a && (a.status === 'pending' || a.status === 'confirmed');

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await publicBooking.cancel(slug, id, saved!.token);
      await queryClient.invalidateQueries({ queryKey: ['public', slug, 'appointment', id] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İptal edilemedi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title subtitle={`${formatDate(saved.date)} · ${saved.startTime}`}>{saved.salonName}</Title>
      <ErrorBox message={appointment.error instanceof Error ? appointment.error.message : null} />
      {a ? (
        <Card>
          <StatusBadge status={a.status} />
          <SectionTitle>{a.services.map((s) => s.serviceName).join(', ')}</SectionTitle>
          <Body muted>
            {formatDate(a.date)} · {a.startTime} - {a.endTime}
            {a.staffName ? ` · ${a.staffName}` : ''}
          </Body>
          {a.showPrices !== false ? <Body>Toplam {formatMoney(a.totalPrice)}</Body> : null}
        </Card>
      ) : null}
      <ErrorBox message={error} />
      {info.data?.phone ? (
        <Button title="Salonu ara" variant="secondary" onPress={() => Linking.openURL(`tel:${info.data!.phone}`)} />
      ) : null}
      {info.data?.address ? (
        <Button
          title="Yol tarifi"
          variant="secondary"
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(info.data!.address)}`)}
        />
      ) : null}
      {cancellable ? <Button title="Randevuyu iptal et" variant="danger" onPress={cancel} loading={busy} /> : null}
    </Screen>
  );
}
