import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import type { Appointment } from '../api/types';
import { Avatar, Card, Row, StatusPill, Txt, statusColor } from '../ui/components';
import { space, useTheme } from '../ui/theme';

/** Timeline row: time on the left, a status-colored rail, the appointment card on the right. */
export function AppointmentCard({ appointment: a, highlight }: { appointment: Appointment; highlight?: boolean }) {
  const router = useRouter();
  const t = useTheme();
  const rail = statusColor(t, a.status);
  return (
    <Row gap={space.md} style={{ alignItems: 'stretch' }}>
      <View style={{ width: 50, paddingTop: space.lg, alignItems: 'flex-end' }}>
        <Txt variant="h3">{a.startTime}</Txt>
        <Txt variant="caption" muted>
          {a.endTime}
        </Txt>
      </View>
      <View style={{ width: 4, borderRadius: 2, backgroundColor: rail, opacity: 0.85 }} />
      <Card
        onPress={() => router.push({ pathname: '/appointment/[id]', params: { id: a.id } })}
        style={[{ flex: 1, gap: space.sm }, highlight && { borderColor: t.primary, borderWidth: 1.5 }]}
      >
        <Row gap={space.md}>
          <Avatar name={a.customerName} size={40} />
          <View style={{ flex: 1 }}>
            <Txt variant="h3" numberOfLines={1}>
              {a.customerName}
            </Txt>
            <Txt variant="caption" muted numberOfLines={1}>
              {a.services.map((s) => s.serviceName).join(', ')}
            </Txt>
          </View>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row gap={4}>
            <Ionicons name="cut-outline" size={14} color={t.textMuted} />
            <Txt variant="caption" muted>
              {a.staffName}
            </Txt>
          </Row>
          <StatusPill status={a.status} />
        </Row>
      </Card>
    </Row>
  );
}
