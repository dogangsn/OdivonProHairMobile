import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { formatDate, isoDate } from '../../../lib/dates';
import { loadBookings, type SavedBooking } from '../../../session/my-bookings';
import { Body, Card, Chip, Empty, Row, Screen, SectionTitle, Title } from '../../../ui/components';

/** Bookings made from this device (account-wide history needs MainApi /hair/client/appointments). */
export default function MyAppointments() {
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [list, setList] = useState<SavedBooking[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadBookings().then(setList);
    }, []),
  );

  const today = isoDate(new Date());
  const shown = list
    .filter((b) => (tab === 'upcoming' ? b.date >= today : b.date < today))
    .sort((a, b) => {
      const order = (a.date + a.startTime).localeCompare(b.date + b.startTime);
      return tab === 'upcoming' ? order : -order;
    });

  return (
    <Screen>
      <Title>Randevularım</Title>
      <Row>
        <Chip label="Yaklaşan" selected={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Chip label="Geçmiş" selected={tab === 'past'} onPress={() => setTab('past')} />
      </Row>
      {shown.length === 0 ? (
        <Empty
          title={tab === 'upcoming' ? 'Yaklaşan randevun yok' : 'Geçmiş randevun yok'}
          hint="Ana sayfadan salonunu açıp randevu alabilirsin."
        />
      ) : (
        shown.map((b) => (
          <Card key={b.id} onPress={() => router.push({ pathname: '/booking/[slug]/[id]', params: { slug: b.slug, id: b.id } })}>
            <SectionTitle>{b.salonName}</SectionTitle>
            <Body muted>
              {formatDate(b.date)} · {b.startTime}
            </Body>
          </Card>
        ))
      )}
    </Screen>
  );
}
