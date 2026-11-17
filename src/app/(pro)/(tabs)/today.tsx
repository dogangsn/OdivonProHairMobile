import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import { salonApi } from '../../../api/salon';
import { AppointmentCard } from '../../../components/AppointmentCard';
import { formatDate, formatMoney, isoDate } from '../../../lib/dates';
import { useSession } from '../../../session/SessionProvider';
import {
  Avatar,
  Empty,
  ErrorBox,
  Hero,
  KpiCard,
  Loading,
  PressScale,
  Row,
  SectionHeader,
  TAB_BAR_SPACE,
  Txt,
} from '../../../ui/components';
import { space, useTheme } from '../../../ui/theme';

function nowHm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Salon home: today's numbers (owner / manager) and today's timeline (stylists see their own). */
export default function Today() {
  const t = useTheme();
  const router = useRouter();
  const { staff, user } = useSession();
  const today = isoDate(new Date());
  const canSeeMoney = staff?.isOwner || staff?.role === 'admin' || staff?.role === 'manager';

  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: () => salonApi.dashboard(), enabled: !!canSeeMoney });
  const appointments = useQuery({
    queryKey: ['appointments', today, today],
    queryFn: () => salonApi.appointments({ from: today, to: today }),
  });

  const list = (appointments.data ?? []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
  const active = list.filter((a) => a.status !== 'cancelled' && a.status !== 'noShow');
  const now = nowHm();
  const next = active.find((a) => a.endTime >= now && a.status !== 'completed');
  const refreshing = appointments.isRefetching || dashboard.isRefetching;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + space.xl }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          tintColor="#FFFFFF"
          refreshing={refreshing}
          onRefresh={() => {
            appointments.refetch();
            if (canSeeMoney) dashboard.refetch();
          }}
        />
      }
    >
      <Hero style={{ paddingBottom: canSeeMoney ? space.xxxl + space.xxxl : space.xxxl }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Txt variant="caption" color="rgba(199,210,254,0.85)">
              {formatDate(today)}
            </Txt>
            <Txt variant="title" color="#FFFFFF" numberOfLines={1}>
              {staff?.tenantName ?? 'Bugün'}
            </Txt>
          </View>
          <PressScale onPress={() => router.push('/salon-account')} accessibilityLabel="Hesap">
            <Avatar name={user?.email ?? staff?.tenantName ?? 'O'} size={46} />
          </PressScale>
        </Row>
        <Txt color="rgba(224,231,255,0.85)" style={{ marginTop: space.md }}>
          {appointments.data
            ? active.length > 0
              ? `Bugün ${active.length} randevun var${next ? `, sıradaki ${next.startTime}` : ''}.`
              : 'Bugün için randevu yok.'
            : ' '}
        </Txt>
      </Hero>

      <View style={{ paddingHorizontal: space.xl, gap: space.lg }}>
        {canSeeMoney ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: -(space.xxxl + space.xl) }}>
            <KpiCard label="Günlük ciro" value={dashboard.data ? formatMoney(dashboard.data.todayRevenue) : '—'} icon="wallet" tone="success" />
            <KpiCard label="Randevu" value={dashboard.data ? String(dashboard.data.todayAppointments) : '—'} icon="calendar" tone="primary" />
            <KpiCard label="Onay bekleyen" value={dashboard.data ? String(dashboard.data.pendingAppointments) : '—'} icon="hourglass" tone="warning" />
            <KpiCard label="Müşteri" value={dashboard.data ? String(dashboard.data.totalCustomers) : '—'} icon="people" tone="violet" />
          </View>
        ) : (
          <View style={{ height: space.sm }} />
        )}

        <SectionHeader title="Bugünün akışı" action="Takvim" onAction={() => router.push('/calendar')} />
        {appointments.isLoading ? <Loading /> : null}
        <ErrorBox message={appointments.error instanceof Error ? appointments.error.message : null} />
        {appointments.data && list.length === 0 ? (
          <Empty icon="cafe-outline" title="Bugün randevu yok" hint="Online randevu linkini paylaşarak boş saatlerini doldurabilirsin." />
        ) : null}
        {list.map((a) => (
          <AppointmentCard key={a.id} appointment={a} highlight={a.id === next?.id} />
        ))}
      </View>
    </ScrollView>
  );
}
