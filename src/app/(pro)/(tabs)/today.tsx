import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { salonApi } from '../../../api/salon';
import { AppointmentCard } from '../../../components/AppointmentCard';
import { formatDate, formatMoney, isoDate } from '../../../lib/dates';
import { useSession } from '../../../session/SessionProvider';
import { Empty, ErrorBox, Loading, SectionTitle, Title } from '../../../ui/components';
import { radius, space, useTheme } from '../../../ui/theme';

function Kpi({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: t.surface, borderRadius: radius.lg, padding: space.lg, borderColor: t.border, borderWidth: 1, gap: 4 }}>
      <Text style={{ color: t.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: t.text, fontSize: 22, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

/** Salon home: today's numbers (owner / manager) and today's appointments (stylists see their own). */
export default function Today() {
  const t = useTheme();
  const { staff } = useSession();
  const today = isoDate(new Date());
  const canSeeMoney = staff?.isOwner || staff?.role === 'admin' || staff?.role === 'manager';

  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: () => salonApi.dashboard(), enabled: !!canSeeMoney });
  const appointments = useQuery({
    queryKey: ['appointments', today, today],
    queryFn: () => salonApi.appointments({ from: today, to: today }),
  });

  const list = (appointments.data ?? []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));
  const refreshing = appointments.isRefetching || dashboard.isRefetching;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: space.xxl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { appointments.refetch(); if (canSeeMoney) dashboard.refetch(); }} />
        }
      >
        <Title subtitle={formatDate(today)}>{staff?.tenantName ?? 'Bugün'}</Title>

        {canSeeMoney && dashboard.data ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            <Kpi label="Günlük ciro" value={formatMoney(dashboard.data.todayRevenue)} />
            <Kpi label="Randevu" value={String(dashboard.data.todayAppointments)} />
            <Kpi label="Onay bekleyen" value={String(dashboard.data.pendingAppointments)} />
            <Kpi label="Toplam müşteri" value={String(dashboard.data.totalCustomers)} />
          </View>
        ) : null}

        <SectionTitle>Bugünkü randevular</SectionTitle>
        {appointments.isLoading ? <Loading /> : null}
        <ErrorBox message={appointments.error instanceof Error ? appointments.error.message : null} />
        {appointments.data && list.length === 0 ? <Empty title="Bugün randevu yok" /> : null}
        {list.map((a) => (
          <AppointmentCard key={a.id} appointment={a} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
