import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';
import { salonApi } from '../../../api/salon';
import type { AppointmentStatus } from '../../../api/types';
import { formatDate, formatMoney } from '../../../lib/dates';
import { Body, Button, Card, ErrorBox, Loading, Screen, SectionTitle, StatusBadge, Title } from '../../../ui/components';

/** Next status steps the salon can take from each status (same flow as the web panel). */
const NEXT: Partial<Record<AppointmentStatus, { status: AppointmentStatus; label: string; variant?: 'secondary' | 'danger' }[]>> = {
  pending: [
    { status: 'confirmed', label: 'Onayla' },
    { status: 'cancelled', label: 'İptal et', variant: 'danger' },
  ],
  confirmed: [
    { status: 'checkedIn', label: 'Müşteri geldi' },
    { status: 'noShow', label: 'Gelmedi', variant: 'secondary' },
    { status: 'cancelled', label: 'İptal et', variant: 'danger' },
  ],
  checkedIn: [{ status: 'inProgress', label: 'İşleme başla' }],
  inProgress: [{ status: 'completed', label: 'Tamamlandı' }],
};

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const appointment = useQuery({ queryKey: ['appointment', id], queryFn: () => salonApi.appointment(id) });
  const update = useMutation({
    mutationFn: (status: AppointmentStatus) => salonApi.setStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(['appointment', id], data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (appointment.isLoading) return <Screen><Loading /></Screen>;
  const a = appointment.data;
  if (!a) return <Screen><ErrorBox message={appointment.error instanceof Error ? appointment.error.message : 'Randevu bulunamadı.'} /></Screen>;

  return (
    <Screen>
      <Title subtitle={`${formatDate(a.date)} · ${a.startTime} - ${a.endTime}`}>{a.customerName}</Title>
      <Card>
        <StatusBadge status={a.status} />
        <SectionTitle>{a.services.map((s) => s.serviceName).join(', ')}</SectionTitle>
        <Body muted>
          {a.staffName} · {formatMoney(a.totalPrice)}
        </Body>
        {a.notes ? <Body>Not: {a.notes}</Body> : null}
      </Card>
      <ErrorBox message={update.error instanceof Error ? update.error.message : null} />
      {(NEXT[a.status] ?? []).map((step) => (
        <Button
          key={step.status}
          title={step.label}
          variant={step.variant}
          loading={update.isPending && update.variables === step.status}
          disabled={update.isPending}
          onPress={() => update.mutate(step.status)}
        />
      ))}
      {a.customerPhone ? (
        <>
          <Button title="Müşteriyi ara" variant="secondary" onPress={() => Linking.openURL(`tel:${a.customerPhone}`)} />
          <Button
            title="WhatsApp'tan yaz"
            variant="secondary"
            onPress={() => Linking.openURL(`https://wa.me/${a.customerPhone.replace(/\D/g, '')}`)}
          />
        </>
      ) : null}
    </Screen>
  );
}
