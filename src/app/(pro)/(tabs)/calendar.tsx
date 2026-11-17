import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { salonApi } from '../../../api/salon';
import { AppointmentCard } from '../../../components/AppointmentCard';
import { addDays, dayLabel, formatDate, isoDate } from '../../../lib/dates';
import { Button, Empty, ErrorBox, Loading, PressScale, Row, Screen, TAB_BAR_SPACE, Txt } from '../../../ui/components';
import { font, radius, shadow, space, useTheme } from '../../../ui/theme';

/** Day strip for the next two weeks and that day's timeline (a staff-column grid is plan P4). */
export default function Calendar() {
  const t = useTheme();
  const todayIso = isoDate(new Date());
  const [date, setDate] = useState(todayIso);
  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(new Date(), i - 3)), []);

  const appointments = useQuery({
    queryKey: ['appointments', date, date],
    queryFn: () => salonApi.appointments({ from: date, to: date }),
  });
  const list = (appointments.data ?? []).slice().sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <Txt variant="title">Takvim</Txt>
          <Txt variant="caption" muted>
            {formatDate(date)} · {list.length} randevu
          </Txt>
        </View>
        {date !== todayIso ? <Button title="Bugün" icon="today-outline" compact onPress={() => setDate(todayIso)} /> : null}
      </Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingRight: space.xl }} style={{ marginHorizontal: -space.xl, paddingLeft: space.xl }}>
        {days.map((d) => {
          const iso = isoDate(d);
          const active = iso === date;
          return (
            <PressScale key={iso} onPress={() => setDate(iso)} accessibilityLabel={formatDate(iso)}>
              <View
                style={[
                  {
                    width: 56,
                    height: 74,
                    borderRadius: radius.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    borderWidth: 1,
                    backgroundColor: active ? t.primary : t.surface,
                    borderColor: active ? t.primary : t.border,
                  },
                  active && shadow(t, 2),
                ]}
              >
                <Text style={{ fontFamily: font.semibold, fontSize: 12, color: active ? 'rgba(255,255,255,0.85)' : t.textMuted }}>{dayLabel(d)}</Text>
                <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: active ? '#FFFFFF' : t.text }}>{d.getDate()}</Text>
                {iso === todayIso ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: active ? '#FFFFFF' : t.primary }} /> : null}
              </View>
            </PressScale>
          );
        })}
      </ScrollView>
      {appointments.isLoading ? <Loading /> : null}
      <ErrorBox message={appointments.error instanceof Error ? appointments.error.message : null} />
      {appointments.data && list.length === 0 ? <Empty icon="calendar-clear-outline" title="Bu gün randevu yok" /> : null}
      {list.map((a) => (
        <AppointmentCard key={a.id} appointment={a} />
      ))}
    </Screen>
  );
}
