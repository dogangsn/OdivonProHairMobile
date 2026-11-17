import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { salonApi } from '../../../api/salon';
import { formatDate, formatMoney } from '../../../lib/dates';
import { Body, Card, Empty, ErrorBox, Field, Loading, Row, Screen, Title } from '../../../ui/components';

/** Customer search; tapping a customer calls them (detail screen comes with plan P8). */
export default function Customers() {
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
    <Screen>
      <Title>Müşteriler</Title>
      <Field label="Ara" placeholder="Ad veya telefon" value={search} onChangeText={setSearch} autoCorrect={false} />
      {customers.isLoading ? <Loading /> : null}
      <ErrorBox message={customers.error instanceof Error ? customers.error.message : null} />
      {customers.data && customers.data.length === 0 ? <Empty title="Müşteri bulunamadı" /> : null}
      {(customers.data ?? []).map((c) => (
        <Card key={c.id} onPress={() => Linking.openURL(`tel:${c.phone}`)}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body style={{ fontWeight: '600', flex: 1 }}>
              {c.firstName} {c.lastName}
            </Body>
            <Body muted>{c.totalVisits} ziyaret</Body>
          </Row>
          <Body muted>
            {c.phone}
            {c.lastVisitDate ? ` · son ${formatDate(c.lastVisitDate.slice(0, 10))}` : ''}
            {c.totalSpent ? ` · ${formatMoney(c.totalSpent)}` : ''}
          </Body>
        </Card>
      ))}
    </Screen>
  );
}
