import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { publicBooking } from '../../../api/public-booking';
import type { PublicService } from '../../../api/types';
import { addDays, dayLabel, formatDate, formatMoney, isoDate } from '../../../lib/dates';
import { formatPhone } from '../../../lib/phone';
import { loadProfile, saveBooking, saveProfile } from '../../../session/my-bookings';
import { useSession } from '../../../session/SessionProvider';
import {
  Body,
  Button,
  Card,
  Chip,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Row,
  Screen,
  SectionTitle,
  Title,
} from '../../../ui/components';
import { space, useTheme } from '../../../ui/theme';

type Step = 'services' | 'staff' | 'time' | 'contact';
const DAYS_AHEAD = 21;

/** Online booking wizard on the public booking API: services → staff → time → contact. */
export default function SalonBooking() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useSession();
  const t = useTheme();

  const [step, setStep] = useState<Step>('services');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | undefined>();
  const [date, setDate] = useState(isoDate(new Date()));
  const [time, setTime] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [notes, setNotes] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone = user?.phoneNumber ?? '';

  useEffect(() => {
    loadProfile().then((p) => {
      if (p) {
        setFirstName(p.firstName);
        setLastName(p.lastName);
      }
    });
  }, []);

  const info = useQuery({ queryKey: ['public', slug, 'info'], queryFn: () => publicBooking.info(slug) });
  const services = useQuery({ queryKey: ['public', slug, 'services'], queryFn: () => publicBooking.services(slug) });
  const staff = useQuery({
    queryKey: ['public', slug, 'staff', serviceIds],
    queryFn: () => publicBooking.staff(slug, serviceIds),
    enabled: step !== 'services' && serviceIds.length > 0,
  });
  const slots = useQuery({
    queryKey: ['public', slug, 'slots', date, serviceIds, staffId],
    queryFn: () => publicBooking.slots(slug, date, serviceIds, staffId),
    enabled: step === 'time',
  });

  const showPrices = info.data?.onlineBookingShowPrices ?? info.data?.showPrices ?? true;
  const chosen = useMemo(
    () => (services.data ?? []).filter((s) => serviceIds.includes(s.id)),
    [services.data, serviceIds],
  );
  const total = chosen.reduce((sum, s) => sum + s.price, 0);
  const minutes = chosen.reduce((sum, s) => sum + s.durationMinutes, 0);

  const grouped = useMemo(() => {
    const groups = new Map<string, PublicService[]>();
    for (const s of services.data ?? []) {
      const key = s.categoryName || 'Hizmetler';
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    return [...groups.entries()];
  }, [services.data]);

  const days = useMemo(() => {
    const workDays = info.data?.workDays;
    return Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(new Date(), i)).filter(
      (d) => !workDays || workDays.length === 0 || workDays.includes(d.getDay()),
    );
  }, [info.data?.workDays]);

  async function submit() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ad ve soyadını gir.');
      return;
    }
    if (!time) return;
    setBusy(true);
    setError(null);
    try {
      if (info.data?.requireBookingOtp && !otpSent) {
        await publicBooking.requestOtp(slug, phone);
        setOtpSent(true);
        setBusy(false);
        return;
      }
      await saveProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      const appointment = await publicBooking.book(slug, {
        serviceIds,
        staffId,
        date,
        startTime: time,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        notes: notes.trim() || undefined,
        otpCode: otpSent ? otp : undefined,
      });
      await saveBooking({
        slug,
        id: appointment.id,
        token: appointment.token,
        salonName: info.data ? `${info.data.tenantName}${info.data.branchName ? ` · ${info.data.branchName}` : ''}` : slug,
        date: appointment.date,
        startTime: appointment.startTime,
        savedAt: new Date().toISOString(),
      });
      router.replace({ pathname: '/booking/[slug]/[id]', params: { slug, id: appointment.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Randevu alınamadı.');
      setBusy(false);
    }
  }

  if (info.isLoading) return <Screen><Loading label="Salon yükleniyor" /></Screen>;
  if (info.error || !info.data) {
    return (
      <Screen>
        <Empty title="Salon bulunamadı" hint="Linki kontrol edip tekrar dene." />
        <ErrorBox message={info.error instanceof Error ? info.error.message : null} />
      </Screen>
    );
  }
  const salon = info.data;
  if (salon.onlineBookingEnabled === false) {
    return (
      <Screen>
        <Title subtitle={salon.address}>{salon.tenantName}</Title>
        <Empty title="Bu salon şu an online randevu almıyor" hint={`Randevu için salonu arayabilirsin: ${salon.phone}`} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title subtitle={[salon.branchName, salon.address].filter(Boolean).join(' · ')}>{salon.tenantName}</Title>

      {step === 'services' && (
        <>
          <SectionTitle>Hizmet seç</SectionTitle>
          {services.isLoading ? <Loading /> : null}
          {grouped.map(([category, list]) => (
            <View key={category} style={{ gap: space.sm }}>
              <Body muted>{category}</Body>
              {list.map((s) => {
                const selected = serviceIds.includes(s.id);
                return (
                  <Card
                    key={s.id}
                    onPress={() => setServiceIds((ids) => (selected ? ids.filter((id) => id !== s.id) : [...ids, s.id]))}
                    style={selected ? { borderWidth: 2, borderColor: t.primary } : undefined}
                  >
                    <Row style={{ justifyContent: 'space-between' }}>
                      <Body style={{ fontWeight: selected ? '700' : '500', flex: 1 }}>
                        {selected ? '✓ ' : ''}
                        {s.name}
                      </Body>
                      {showPrices ? <Body>{formatMoney(s.price)}</Body> : null}
                    </Row>
                    <Body muted>{s.durationMinutes} dk</Body>
                  </Card>
                );
              })}
            </View>
          ))}
          {serviceIds.length > 0 ? (
            <Button
              title={`Devam (${chosen.length} hizmet · ${minutes} dk${showPrices ? ` · ${formatMoney(total)}` : ''})`}
              onPress={() => setStep('staff')}
            />
          ) : null}
        </>
      )}

      {step === 'staff' && (
        <>
          <SectionTitle>Personel seç</SectionTitle>
          {staff.isLoading ? <Loading /> : null}
          <Card onPress={() => { setStaffId(undefined); setStep('time'); }}>
            <Body style={{ fontWeight: '600' }}>Fark etmez</Body>
            <Body muted>En uygun saati olan personel</Body>
          </Card>
          {(staff.data ?? []).map((p) => (
            <Card key={p.id} onPress={() => { setStaffId(p.id); setStep('time'); }}>
              <Body style={{ fontWeight: '600' }}>{p.name}</Body>
              {p.specialties?.length ? <Body muted>{p.specialties.join(', ')}</Body> : null}
            </Card>
          ))}
          <Button title="Geri" variant="ghost" onPress={() => setStep('services')} />
        </>
      )}

      {step === 'time' && (
        <>
          <SectionTitle>Gün ve saat</SectionTitle>
          <Row style={{ flexWrap: 'wrap' }}>
            {days.map((d) => {
              const iso = isoDate(d);
              return (
                <Chip
                  key={iso}
                  label={`${d.getDate()} ${dayLabel(d)}`}
                  selected={iso === date}
                  onPress={() => { setDate(iso); setTime(null); }}
                />
              );
            })}
          </Row>
          {slots.isLoading ? <Loading label="Boş saatler aranıyor" /> : null}
          <ErrorBox message={slots.error instanceof Error ? slots.error.message : null} />
          {slots.data && slots.data.length === 0 ? (
            <Empty title="Bu gün boş saat yok" hint="Başka bir gün seç." />
          ) : null}
          <Row style={{ flexWrap: 'wrap' }}>
            {(slots.data ?? []).map((s) => (
              <Chip key={s} label={s} selected={s === time} onPress={() => setTime(s)} />
            ))}
          </Row>
          {time ? <Button title={`${formatDate(date)} · ${time} ile devam`} onPress={() => setStep('contact')} /> : null}
          <Button title="Geri" variant="ghost" onPress={() => setStep('staff')} />
        </>
      )}

      {step === 'contact' && time && (
        <>
          <Card>
            <SectionTitle>Özet</SectionTitle>
            <Body>{chosen.map((s) => s.name).join(', ')}</Body>
            <Body muted>
              {formatDate(date)} · {time} · {minutes} dk{showPrices ? ` · ${formatMoney(total)}` : ''}
            </Body>
          </Card>
          <Field label="Ad" value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
          <Field label="Soyad" value={lastName} onChangeText={setLastName} autoComplete="family-name" />
          <Field label="Telefon" value={formatPhone(phone)} editable={false} />
          <Field label="Not (isteğe bağlı)" value={notes} onChangeText={setNotes} multiline />
          {otpSent ? (
            <Field
              label="SMS ile gelen kod"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, ''))}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
            />
          ) : null}
          <ErrorBox message={error} />
          <Button
            title={info.data?.requireBookingOtp && !otpSent ? 'Doğrulama kodu gönder' : 'Randevuyu onayla'}
            onPress={submit}
            loading={busy}
          />
          <Button title="Geri" variant="ghost" onPress={() => setStep('time')} />
        </>
      )}
    </Screen>
  );
}
