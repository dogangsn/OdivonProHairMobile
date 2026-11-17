import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { formatDate, isoDate } from '../../../lib/dates';
import { loadBookings, type SavedBooking } from '../../../session/my-bookings';
import { Avatar, Card, Empty, GradientButton, Row, Screen, Segmented, TAB_BAR_SPACE, Txt } from '../../../ui/components';
import { space, useTheme } from '../../../ui/theme';

/** Bookings made from this device (account-wide history needs MainApi /hair/client/appointments). */
export default function MyAppointments() {
  const router = useRouter();
  const t = useTheme();
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
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Txt variant="title">Randevularım</Txt>
      <Segmented
        options={[
          { value: 'upcoming', label: 'Yaklaşan' },
          { value: 'past', label: 'Geçmiş' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {shown.length === 0 ? (
        <>
          <Empty
            icon="calendar-clear-outline"
            title={tab === 'upcoming' ? 'Yaklaşan randevun yok' : 'Geçmiş randevun yok'}
            hint="Salonunun linkini ya da QR kodunu kullanarak hemen randevu alabilirsin."
          />
          {tab === 'upcoming' ? <GradientButton title="Randevu al" onPress={() => router.push('/home')} /> : null}
        </>
      ) : (
        shown.map((b) => (
          <Card key={b.id} onPress={() => router.push({ pathname: '/booking/[slug]/[id]', params: { slug: b.slug, id: b.id } })}>
            <Row gap={space.md}>
              <View style={{ width: 54, alignItems: 'center', paddingVertical: 6, borderRadius: 14, backgroundColor: t.primarySoft }}>
                <Txt variant="h2" color={t.primary}>
                  {Number(b.date.slice(8, 10))}
                </Txt>
                <Txt variant="label" color={t.primary} style={{ fontSize: 10 }}>
                  {formatDate(b.date).split(' ')[1]}
                </Txt>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="h3" numberOfLines={1}>
                  {b.salonName}
                </Txt>
                <Row gap={6}>
                  <Ionicons name="time-outline" size={14} color={t.textMuted} />
                  <Txt variant="caption" muted>
                    {formatDate(b.date)} · {b.startTime}
                  </Txt>
                </Row>
              </View>
              <Avatar name={b.salonName} size={36} />
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
