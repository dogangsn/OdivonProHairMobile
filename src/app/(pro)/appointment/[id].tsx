import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { salonApi } from '../../../api/salon';
import type { AppointmentStatus } from '../../../api/types';
import { formatDate, formatMoney } from '../../../lib/dates';
import {
  ActionTile,
  Avatar,
  Button,
  Card,
  ErrorBox,
  GradientButton,
  Hero,
  Loading,
  Row,
  Screen,
  StatusPill,
  Txt,
  type IconName,
} from '../../../ui/components';
import { space, useTheme } from '../../../ui/theme';

/** Next status steps from each status (same flow as the web panel); the first one is the main action. */
const NEXT: Partial<Record<AppointmentStatus, { status: AppointmentStatus; label: string; icon: IconName; danger?: boolean }[]>> = {
  pending: [
    { status: 'confirmed', label: 'Onayla', icon: 'checkmark-circle' },
    { status: 'cancelled', label: 'İptal et', icon: 'close-circle-outline', danger: true },
  ],
  confirmed: [
    { status: 'checkedIn', label: 'Müşteri geldi', icon: 'log-in-outline' },
    { status: 'noShow', label: 'Gelmedi', icon: 'eye-off-outline' },
    { status: 'cancelled', label: 'İptal et', icon: 'close-circle-outline', danger: true },
  ],
  checkedIn: [{ status: 'inProgress', label: 'İşleme başla', icon: 'cut' }],
  inProgress: [{ status: 'completed', label: 'Tamamlandı', icon: 'checkmark-done' }],
};

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useTheme();
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

  const steps = NEXT[a.status] ?? [];
  const [main, ...rest] = steps;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.background }} contentContainerStyle={{ paddingBottom: space.xxxl + space.xl }} showsVerticalScrollIndicator={false}>
      <Hero style={{ paddingBottom: space.xxxl + space.xl }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Button title="" icon="chevron-back" variant="glass" compact onPress={() => router.back()} />
          <StatusPill status={a.status} />
        </Row>
        <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.md }}>
          <Avatar name={a.customerName} size={72} />
          <Txt variant="title" color="#FFFFFF" center>
            {a.customerName}
          </Txt>
          <Row gap={6}>
            <Ionicons name="time-outline" size={16} color="#C7D2FE" />
            <Txt color="rgba(224,231,255,0.9)">
              {formatDate(a.date)} · {a.startTime} - {a.endTime}
            </Txt>
          </Row>
        </View>
      </Hero>

      <View style={{ paddingHorizontal: space.xl, gap: space.lg, marginTop: -(space.xxxl + space.md) }}>
        <Card style={{ gap: space.md }}>
          {a.services.map((s, i) => (
            <Row key={`${s.serviceId}-${i}`} style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Txt variant="h3">{s.serviceName}</Txt>
                <Txt variant="caption" muted>
                  {s.durationMinutes} dk
                </Txt>
              </View>
              <Txt variant="bodyStrong">{formatMoney(s.price)}</Txt>
            </Row>
          ))}
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />
          <Row style={{ justifyContent: 'space-between' }}>
            <Row gap={6}>
              <Ionicons name="cut-outline" size={15} color={t.textMuted} />
              <Txt variant="caption" muted>
                {a.staffName}
              </Txt>
            </Row>
            <Txt variant="h2" color={t.primary}>
              {formatMoney(a.totalPrice)}
            </Txt>
          </Row>
          {a.notes ? (
            <View style={{ backgroundColor: t.surfaceMuted, borderRadius: 12, padding: space.md }}>
              <Txt variant="caption">📝 {a.notes}</Txt>
            </View>
          ) : null}
        </Card>

        <ErrorBox message={update.error instanceof Error ? update.error.message : null} />
        {main ? (
          <GradientButton
            title={main.label}
            icon={main.icon}
            loading={update.isPending && update.variables === main.status}
            disabled={update.isPending}
            onPress={() => update.mutate(main.status)}
          />
        ) : null}
        {rest.length ? (
          <Row gap={space.md}>
            {rest.map((step) => (
              <View key={step.status} style={{ flex: 1 }}>
                <Button
                  title={step.label}
                  icon={step.icon}
                  variant={step.danger ? 'danger' : 'secondary'}
                  loading={update.isPending && update.variables === step.status}
                  disabled={update.isPending}
                  onPress={() => update.mutate(step.status)}
                />
              </View>
            ))}
          </Row>
        ) : null}

        {a.customerPhone ? (
          <Row gap={space.md} style={{ alignItems: 'stretch' }}>
            <ActionTile icon="call" label="Ara" tone="success" onPress={() => Linking.openURL(`tel:${a.customerPhone}`)} />
            <ActionTile
              icon="logo-whatsapp"
              label="WhatsApp"
              tone="success"
              onPress={() => Linking.openURL(`https://wa.me/${a.customerPhone.replace(/\D/g, '')}`)}
            />
          </Row>
        ) : null}
      </View>
    </ScrollView>
  );
}
