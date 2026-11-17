import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { publicBooking } from '../../../api/public-booking';
import type { PublicService } from '../../../api/types';
import { addDays, dayLabel, formatDate, formatMoney, isoDate } from '../../../lib/dates';
import { formatPhone } from '../../../lib/phone';
import { loadProfile, saveBooking, saveProfile } from '../../../session/my-bookings';
import { useSession } from '../../../session/SessionProvider';
import {
  Avatar,
  Card,
  Chip,
  Empty,
  ErrorBox,
  Field,
  GradientButton,
  IconBadge,
  Loading,
  PressScale,
  Row,
  Steps,
  TopBar,
  Txt,
} from '../../../ui/components';
import { font, radius, shadow, space, useTheme } from '../../../ui/theme';

type Step = 'services' | 'staff' | 'time' | 'contact';
const STEPS: Step[] = ['services', 'staff', 'time', 'contact'];
const STEP_TITLES: Record<Step, string> = {
  services: 'Hizmetini seç',
  staff: 'Kimden olsun?',
  time: 'Gün ve saat',
  contact: 'Son kontrol',
};
const DAYS_AHEAD = 21;

function SelectMark({ selected }: { selected: boolean }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: selected ? 0 : 1.5,
        borderColor: t.borderStrong,
        backgroundColor: selected ? t.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
    </View>
  );
}

/** Online booking wizard on the public booking API: services → staff → time → contact. */
export default function SalonBooking() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useSession();

  const [step, setStep] = useState<Step>('services');
  const [category, setCategory] = useState<string | null>(null);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | undefined>();
  const [staffName, setStaffName] = useState<string | null>(null);
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
  const chosen = useMemo(() => (services.data ?? []).filter((s) => serviceIds.includes(s.id)), [services.data, serviceIds]);
  const total = chosen.reduce((sum, s) => sum + s.price, 0);
  const minutes = chosen.reduce((sum, s) => sum + s.durationMinutes, 0);

  const categories = useMemo(() => [...new Set((services.data ?? []).map((s) => s.categoryName || 'Diğer'))], [services.data]);
  const visibleServices = useMemo(
    () => (services.data ?? []).filter((s: PublicService) => !category || (s.categoryName || 'Diğer') === category),
    [services.data, category],
  );

  const days = useMemo(() => {
    const workDays = info.data?.workDays;
    return Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(new Date(), i)).filter(
      (d) => !workDays || workDays.length === 0 || workDays.includes(d.getDay()),
    );
  }, [info.data?.workDays]);

  const slotGroups = useMemo(() => {
    const groups: { label: string; icon: 'sunny-outline' | 'partly-sunny-outline' | 'moon-outline'; items: string[] }[] = [
      { label: 'Sabah', icon: 'sunny-outline', items: [] },
      { label: 'Öğleden sonra', icon: 'partly-sunny-outline', items: [] },
      { label: 'Akşam', icon: 'moon-outline', items: [] },
    ];
    for (const s of slots.data ?? []) {
      const h = Number(s.slice(0, 2));
      groups[h < 12 ? 0 : h < 17 ? 1 : 2].items.push(s);
    }
    return groups.filter((g) => g.items.length > 0);
  }, [slots.data]);

  const stepIndex = STEPS.indexOf(step);

  function back() {
    if (stepIndex === 0) router.back();
    else setStep(STEPS[stepIndex - 1]);
  }

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
      router.replace({ pathname: '/booking/[slug]/[id]', params: { slug, id: appointment.id, fresh: '1' } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Randevu alınamadı.');
      setBusy(false);
    }
  }

  const shell = (body: React.ReactNode, footer?: React.ReactNode) => (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.md }}>
          <TopBar onBack={back} title={info.data?.tenantName} />
        </View>
        <ScrollView
          contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
        {footer ? (
          <View style={[styles.footer, shadow(t, 3), { backgroundColor: t.surface, borderColor: t.border, paddingBottom: Math.max(insets.bottom, space.lg) }]}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (info.isLoading) return shell(<Loading label="Salon yükleniyor" />);
  if (info.error || !info.data) {
    return shell(
      <>
        <Empty icon="storefront-outline" title="Salon bulunamadı" hint="Linki kontrol edip tekrar dene." />
        <ErrorBox message={info.error instanceof Error ? info.error.message : null} />
      </>,
    );
  }
  const salon = info.data;
  if (salon.onlineBookingEnabled === false) {
    return shell(
      <Empty icon="call-outline" title="Bu salon şu an online randevu almıyor" hint={`Randevu için salonu arayabilirsin: ${salon.phone}`} />,
    );
  }

  const summary = (
    <View style={{ flex: 1 }}>
      <Txt variant="caption" muted>
        {chosen.length} hizmet · {minutes} dk{time ? ` · ${formatDate(date)} ${time}` : ''}
      </Txt>
      {showPrices ? <Txt variant="h2">{formatMoney(total)}</Txt> : <Txt variant="h3">{staffName ?? 'Randevu'}</Txt>}
    </View>
  );

  const footer =
    step === 'services' && serviceIds.length > 0 ? (
      <Row gap={space.lg}>{summary}<GradientButton title="Devam" onPress={() => setStep('staff')} style={{ minWidth: 140 }} /></Row>
    ) : step === 'time' && time ? (
      <Row gap={space.lg}>{summary}<GradientButton title="Devam" onPress={() => setStep('contact')} style={{ minWidth: 140 }} /></Row>
    ) : step === 'contact' ? (
      <GradientButton
        title={salon.requireBookingOtp && !otpSent ? 'Doğrulama kodu gönder' : 'Randevuyu onayla'}
        icon="checkmark-circle"
        onPress={submit}
        loading={busy}
      />
    ) : undefined;

  return shell(
    <>
      {step === 'services' ? (
        <Card style={{ gap: space.md }}>
          <Row gap={space.md}>
            <Avatar name={salon.tenantName} size={56} />
            <View style={{ flex: 1 }}>
              <Txt variant="h2">{salon.tenantName}</Txt>
              {salon.branchName ? <Txt variant="caption" muted>{salon.branchName}</Txt> : null}
            </View>
          </Row>
          <Row gap={6}>
            <Ionicons name="location-outline" size={15} color={t.textMuted} />
            <Txt variant="caption" muted style={{ flex: 1 }}>
              {salon.address}
            </Txt>
          </Row>
          <Row gap={6}>
            <Ionicons name="time-outline" size={15} color={t.textMuted} />
            <Txt variant="caption" muted>
              {salon.workDayStart} - {salon.workDayEnd}
            </Txt>
          </Row>
        </Card>
      ) : null}

      <View style={{ gap: space.md }}>
        <Steps count={STEPS.length} current={stepIndex} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt variant="title">{STEP_TITLES[step]}</Txt>
          <Txt variant="label" muted>
            {stepIndex + 1}/{STEPS.length}
          </Txt>
        </Row>
      </View>

      {step === 'services' && (
        <>
          {categories.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              <Chip label="Tümü" selected={!category} onPress={() => setCategory(null)} />
              {categories.map((c) => (
                <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </ScrollView>
          ) : null}
          {services.isLoading ? <Loading /> : null}
          {visibleServices.map((s) => {
            const selected = serviceIds.includes(s.id);
            return (
              <Card
                key={s.id}
                onPress={() => setServiceIds((ids) => (selected ? ids.filter((id) => id !== s.id) : [...ids, s.id]))}
                style={selected ? { borderColor: t.primary, borderWidth: 1.5, backgroundColor: t.dark ? t.surface : '#FBFBFF' } : undefined}
              >
                <Row gap={space.md}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt variant="h3">{s.name}</Txt>
                    <Row gap={space.md}>
                      <Row gap={4}>
                        <Ionicons name="time-outline" size={14} color={t.textMuted} />
                        <Txt variant="caption" muted>
                          {s.durationMinutes} dk
                        </Txt>
                      </Row>
                      {showPrices ? (
                        <Text style={{ fontFamily: font.bold, color: t.primary, fontSize: 14 }}>{formatMoney(s.price)}</Text>
                      ) : null}
                    </Row>
                  </View>
                  <SelectMark selected={selected} />
                </Row>
              </Card>
            );
          })}
        </>
      )}

      {step === 'staff' && (
        <>
          {staff.isLoading ? <Loading /> : null}
          <Card onPress={() => { setStaffId(undefined); setStaffName(null); setStep('time'); }}>
            <Row gap={space.md}>
              <IconBadge icon="sparkles" tone="violet" size={48} />
              <View style={{ flex: 1 }}>
                <Txt variant="h3">Fark etmez</Txt>
                <Txt variant="caption" muted>
                  En erken boş saati olan uzman
                </Txt>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.textSubtle} />
            </Row>
          </Card>
          {(staff.data ?? []).map((p) => (
            <Card key={p.id} onPress={() => { setStaffId(p.id); setStaffName(p.name); setStep('time'); }}>
              <Row gap={space.md}>
                <Avatar name={p.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Txt variant="h3">{p.name}</Txt>
                  {p.specialties?.length ? (
                    <Txt variant="caption" muted numberOfLines={1}>
                      {p.specialties.join(' · ')}
                    </Txt>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color={t.textSubtle} />
              </Row>
            </Card>
          ))}
        </>
      )}

      {step === 'time' && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }} style={{ marginHorizontal: -space.xl, paddingHorizontal: space.xl }}>
            {days.map((d) => {
              const iso = isoDate(d);
              const active = iso === date;
              return (
                <PressScale key={iso} onPress={() => { setDate(iso); setTime(null); }} accessibilityLabel={formatDate(iso)}>
                  <View
                    style={[
                      styles.day,
                      { backgroundColor: active ? t.primary : t.surface, borderColor: active ? t.primary : t.border },
                      active && shadow(t, 2),
                    ]}
                  >
                    <Text style={{ fontFamily: font.semibold, fontSize: 12, color: active ? 'rgba(255,255,255,0.85)' : t.textMuted }}>{dayLabel(d)}</Text>
                    <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: active ? '#FFFFFF' : t.text }}>{d.getDate()}</Text>
                  </View>
                </PressScale>
              );
            })}
            <View style={{ width: space.xl }} />
          </ScrollView>
          {slots.isLoading ? <Loading label="Boş saatler aranıyor" /> : null}
          <ErrorBox message={slots.error instanceof Error ? slots.error.message : null} />
          {slots.data && slots.data.length === 0 ? (
            <Empty icon="moon-outline" title="Bu gün boş saat yok" hint="Başka bir gün seçmeyi dene." />
          ) : null}
          {slotGroups.map((g) => (
            <View key={g.label} style={{ gap: space.sm }}>
              <Row gap={6}>
                <Ionicons name={g.icon} size={16} color={t.textMuted} />
                <Txt variant="label" muted>
                  {g.label}
                </Txt>
              </Row>
              <View style={styles.slotGrid}>
                {g.items.map((s) => (
                  <View key={s} style={styles.slotCell}>
                    <Chip label={s} selected={s === time} onPress={() => setTime(s)} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </>
      )}

      {step === 'contact' && time && (
        <>
          <Card style={{ gap: space.md }}>
            <Row gap={space.md}>
              <IconBadge icon="calendar" tone="primary" />
              <View style={{ flex: 1 }}>
                <Txt variant="h3">
                  {formatDate(date)} · {time}
                </Txt>
                <Txt variant="caption" muted>
                  {minutes} dk{staffName ? ` · ${staffName}` : ''}
                </Txt>
              </View>
            </Row>
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />
            {chosen.map((s) => (
              <Row key={s.id} style={{ justifyContent: 'space-between' }}>
                <Txt>{s.name}</Txt>
                {showPrices ? <Txt variant="bodyStrong">{formatMoney(s.price)}</Txt> : null}
              </Row>
            ))}
            {showPrices ? (
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt variant="h3">Toplam</Txt>
                <Txt variant="h2" color={t.primary}>
                  {formatMoney(total)}
                </Txt>
              </Row>
            ) : null}
          </Card>
          <Row gap={space.md}>
            <View style={{ flex: 1 }}>
              <Field label="Ad" icon="person-outline" value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Soyad" value={lastName} onChangeText={setLastName} autoComplete="family-name" />
            </View>
          </Row>
          <Field label="Telefon" icon="call-outline" value={formatPhone(phone)} editable={false} />
          <Field label="Salona not (isteğe bağlı)" icon="chatbubble-ellipses-outline" value={notes} onChangeText={setNotes} placeholder="Örn. saçım omuz hizasında" />
          {otpSent ? (
            <Field
              label="SMS ile gelen kod"
              icon="keypad-outline"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, ''))}
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
            />
          ) : null}
          <ErrorBox message={error} />
        </>
      )}
    </>,
    footer,
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  day: { width: 58, height: 72, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  slotCell: { width: '25%', padding: 4 },
});
