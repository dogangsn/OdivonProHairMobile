import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { salonApi } from '../../../api/salon';
import { formatDate, formatMoney } from '../../../lib/dates';
import { Avatar, Card, Empty, ErrorBox, Loading, Row, Screen, SearchBar, TAB_BAR_SPACE, Txt } from '../../../ui/components';
import { space, useTheme } from '../../../ui/theme';

function RoundAction({ icon, color, bg, onPress, label }: { icon: 'call' | 'logo-whatsapp'; color: string; bg: string; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} hitSlop={6} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}

/** Customer search with one-tap call / WhatsApp (detail screen is plan P8). */
export default function Customers() {
  const t = useTheme();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const customers = useQuery({
    queryKey: ['customers', debounced],
    queryFn: () => salonApi.customers(debounced || undefined),
  });

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <View>
        <Txt variant="title">Müşteriler</Txt>
        {customers.data ? (
          <Txt variant="caption" muted>
            {customers.data.length} kişi listeleniyor
          </Txt>
        ) : null}
      </View>
      <SearchBar placeholder="Ad veya telefon ara" value={search} onChangeText={setSearch} />
      {customers.isLoading ? <Loading /> : null}
      <ErrorBox message={customers.error instanceof Error ? customers.error.message : null} />
      {customers.data && customers.data.length === 0 ? <Empty icon="people-outline" title="Müşteri bulunamadı" /> : null}
      {(customers.data ?? []).map((c) => {
        const name = `${c.firstName} ${c.lastName}`.trim();
        return (
          <Card key={c.id}>
            <Row gap={space.md}>
              <Avatar name={name} size={46} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="h3" numberOfLines={1}>
                  {name}
                </Txt>
                <Txt variant="caption" muted numberOfLines={1}>
                  {c.totalVisits} ziyaret
                  {c.lastVisitDate ? ` · son ${formatDate(c.lastVisitDate.slice(0, 10))}` : ''}
                  {c.totalSpent ? ` · ${formatMoney(c.totalSpent)}` : ''}
                </Txt>
              </View>
              <RoundAction icon="call" label="Ara" color={t.success} bg={t.successSoft} onPress={() => Linking.openURL(`tel:${c.phone}`)} />
              <RoundAction
                icon="logo-whatsapp"
                label="WhatsApp"
                color={t.success}
                bg={t.successSoft}
                onPress={() => Linking.openURL(`https://wa.me/${c.phone.replace(/\D/g, '')}`)}
              />
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
