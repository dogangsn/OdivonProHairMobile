import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { salonApi } from '../../../api/salon';
import { AppointmentCard } from '../../../components/AppointmentCard';
import { addDays, dayLabel, formatDate, isoDate } from '../../../lib/dates';
import { Chip, Empty, ErrorBox, Loading, Screen, SectionTitle, Title } from '../../../ui/components';
import { space } from '../../../ui/theme';

/** Day list for the next two weeks (a staff-column day grid is the next step, see plan P4). */
export default function Calendar() {
  const [date, setDate] = useState(isoDate(new Date()));
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i - 1)), []);

  const appointments = useQuery({
    queryKey: ['appointments', date, date],
    queryFn: () => salonApi.appointments({ from: date, to: date }),
  });
  const list = (appointments.data ?? []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Screen>
      <Title>Takvim</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {days.map((d) => {
          const iso = isoDate(d);
          return <Chip key={iso} label={`${d.getDate()} ${dayLabel(d)}`} selected={iso === date} onPress={() => setDate(iso)} />;
        })}
      </ScrollView>
      <SectionTitle>{formatDate(date)}</SectionTitle>
      {appointments.isLoading ? <Loading /> : null}
      <ErrorBox message={appointments.error instanceof Error ? appointments.error.message : null} />
      {appointments.data && list.length === 0 ? <Empty title="Bu gün randevu yok" /> : null}
      {list.map((a) => (
        <AppointmentCard key={a.id} appointment={a} />
      ))}
    </Screen>
  );
}
