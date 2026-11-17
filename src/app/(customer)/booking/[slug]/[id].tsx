import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { publicBooking } from '../../../../api/public-booking';
import { formatDate, formatMoney } from '../../../../lib/dates';
import { loadBookings, type SavedBooking } from '../../../../session/my-bookings';
import {
  ActionTile,
  Button,
  Card,
  Empty,
  ErrorBox,
  Hero,
  Loading,
  Row,
  Screen,
  StatusPill,
  TopBar,
  Txt,
} from '../../../../ui/components';
import { space, useTheme } from '../../../../ui/theme';

/** Live status of a booking made on this device, with cancel, call and directions. */
export default function BookingDetail() {
  const { slug, id, fresh } = useLocalSearchParams<{ slug: string; id: string; fresh?: string }>();
  const router = useRouter();
  const t = useTheme();
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

  const close = () => (router.canGoBack() ? router.back() : router.replace('/my-appointments'));

  if (saved === undefined || appointment.isLoading) return <Screen><Loading /></Screen>;
  if (!saved) {
    return (
      <Screen>
        <TopBar onBack={close} />
        <Empty icon="search-outline" title="Randevu bu cihazda bulunamadı" />
      </Screen>
    );
  }

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
    <ScrollView style={{ flex: 1, backgroundColor: t.background }} contentContainerStyle={{ paddingBottom: space.xxxl + space.xl }} showsVerticalScrollIndicator={false}>
      <Hero style={{ paddingBottom: space.xxxl + space.xl }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Button title="" icon="chevron-back" variant="glass" compact onPress={close} />
          {a ? <StatusPill status={a.status} /> : null}
        </Row>
        <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.lg }}>
          {fresh ? (
            <View style={styles.check}>
              <Ionicons name="checkmark" size={34} color="#FFFFFF" />
            </View>
          ) : null}
          <Txt variant="title" color="#FFFFFF" center>
            {fresh ? 'Randevun alındı!' : saved.salonName}
          </Txt>
          <Txt color="rgba(224,231,255,0.85)" center>
            {fresh ? saved.salonName : 'Randevu detayı'}
          </Txt>
        </View>
      </Hero>

      <View style={{ paddingHorizontal: space.xl, gap: space.lg, marginTop: -(space.xxxl + space.md) }}>
        <ErrorBox message={appointment.error instanceof Error ? appointment.error.message : null} />
        {a ? (
          <Card style={{ gap: space.md }}>
            <Row gap={space.lg}>
              <View style={{ flex: 1 }}>
                <Txt variant="label" muted>
                  Tarih
                </Txt>
                <Txt variant="h3">{formatDate(a.date)}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="label" muted>
                  Saat
                </Txt>
                <Txt variant="h3">
                  {a.startTime} - {a.endTime}
                </Txt>
              </View>
            </Row>
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />
            {a.services.map((s) => (
              <Row key={s.serviceName} style={{ justifyContent: 'space-between' }}>
                <Txt>{s.serviceName}</Txt>
                <Txt variant="caption" muted>
                  {s.durationMinutes} dk
                </Txt>
              </Row>
            ))}
            {a.staffName ? (
              <Row gap={6}>
                <Ionicons name="person-outline" size={15} color={t.textMuted} />
                <Txt variant="caption" muted>
                  {a.staffName}
                </Txt>
              </Row>
            ) : null}
            {a.showPrices !== false ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt variant="h3">Toplam</Txt>
                <Txt variant="h2" color={t.primary}>
                  {formatMoney(a.totalPrice)}
                </Txt>
              </Row>
            ) : null}
          </Card>
        ) : null}

        <Row gap={space.md} style={{ alignItems: 'stretch' }}>
          {info.data?.phone ? (
            <ActionTile icon="call" label="Salonu ara" tone="success" onPress={() => Linking.openURL(`tel:${info.data!.phone}`)} />
          ) : null}
          {info.data?.address ? (
            <ActionTile
              icon="navigate"
              label="Yol tarifi"
              tone="info"
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(info.data!.address)}`)}
            />
          ) : null}
        </Row>
        <ErrorBox message={error} />
        {cancellable ? <Button title="Randevuyu iptal et" icon="close-circle-outline" variant="danger" onPress={cancel} loading={busy} /> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});
