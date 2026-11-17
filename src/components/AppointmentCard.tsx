import { useRouter } from 'expo-router';
import type { Appointment } from '../api/types';
import { Body, Card, Row, StatusBadge } from '../ui/components';

/** One appointment row in the salon lists; opens the detail screen. */
export function AppointmentCard({ appointment: a }: { appointment: Appointment }) {
  const router = useRouter();
  return (
    <Card onPress={() => router.push({ pathname: '/appointment/[id]', params: { id: a.id } })}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Body style={{ fontWeight: '700' }}>
          {a.startTime} - {a.endTime}
        </Body>
        <StatusBadge status={a.status} />
      </Row>
      <Body style={{ fontWeight: '600' }}>{a.customerName}</Body>
      <Body muted>
        {a.services.map((s) => s.serviceName).join(', ')} · {a.staffName}
      </Body>
    </Card>
  );
}
