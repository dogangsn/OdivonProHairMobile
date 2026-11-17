import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatDate, isoDate, slugFromLink } from '../../../lib/dates';
import { loadBookings, loadProfile, type SavedBooking } from '../../../session/my-bookings';
import {
  ActionTile,
  Avatar,
  Card,
  ErrorBox,
  Field,
  GradientButton,
  Hero,
  PressScale,
  Row,
  SectionHeader,
  TAB_BAR_SPACE,
  Txt,
} from '../../../ui/components';
import { font, radius, space, useTheme } from '../../../ui/theme';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

/**
 * Customer home. First release: a salon is opened from its booking link or QR code
 * ("salon bul" search arrives with the MainApi discovery endpoints).
 */
export default function CustomerHome() {
  const router = useRouter();
  const t = useTheme();
  const [link, setLink] = useState('');
  const [showLink, setShowLink] = useState(Platform.OS === 'web');
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [name, setName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadBookings().then(setBookings);
      loadProfile().then((p) => setName(p?.firstName ?? null));
    }, []),
  );

  const today = isoDate(new Date());
  const next = useMemo(
    () =>
      bookings
        .filter((b) => b.date >= today)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0],
    [bookings, today],
  );
  const salons = useMemo(() => {
    const seen = new Map<string, SavedBooking>();
    for (const b of bookings) if (!seen.has(b.slug)) seen.set(b.slug, b);
    return [...seen.values()].slice(0, 6);
  }, [bookings]);

  function openLink() {
    const slug = slugFromLink(link);
    if (!slug) {
      setError('Salonun randevu linkini (hair.odivon.com/r/...) yapıştırın.');
      return;
    }
    setError(null);
    router.push({ pathname: '/salon/[slug]', params: { slug } });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + space.xl }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Hero style={{ paddingBottom: space.xxxl }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Txt variant="caption" color="rgba(199,210,254,0.85)">
              {greeting()}
            </Txt>
            <Txt variant="title" color="#FFFFFF">
              {name ? `${name} 👋` : 'Hoş geldin 👋'}
            </Txt>
          </View>
          <PressScale onPress={() => router.push('/account')} accessibilityLabel="Hesabım">
            <Avatar name={name ?? 'O'} size={46} />
          </PressScale>
        </Row>

        <View style={{ marginTop: space.xl }}>
          {next ? (
            <PressScale
              onPress={() => router.push({ pathname: '/booking/[slug]/[id]', params: { slug: next.slug, id: next.id } })}
              accessibilityLabel="Yaklaşan randevu"
            >
              <View style={styles.glass}>
                <Txt variant="label" color="rgba(199,210,254,0.9)">
                  Yaklaşan randevun
                </Txt>
                <Txt variant="h2" color="#FFFFFF" style={{ marginTop: 6 }}>
                  {next.salonName}
                </Txt>
                <Row gap={space.lg} style={{ marginTop: space.md }}>
                  <Row gap={6}>
                    <Ionicons name="calendar-outline" size={16} color="#C7D2FE" />
                    <Text style={styles.glassMeta}>{formatDate(next.date)}</Text>
                  </Row>
                  <Row gap={6}>
                    <Ionicons name="time-outline" size={16} color="#C7D2FE" />
                    <Text style={styles.glassMeta}>{next.startTime}</Text>
                  </Row>
                  <View style={{ flex: 1 }} />
                  <Ionicons name="arrow-forward-circle" size={28} color="#FFFFFF" />
                </Row>
              </View>
            </PressScale>
          ) : (
            <View style={styles.glass}>
              <Txt variant="h2" color="#FFFFFF">
                Bir sonraki bakımın ne zaman?
              </Txt>
              <Txt variant="caption" color="rgba(224,231,255,0.8)" style={{ marginTop: 6 }}>
                Salonunun QR kodunu okut ya da linkini yapıştır, saniyeler içinde randevunu al.
              </Txt>
            </View>
          )}
        </View>
      </Hero>

      <View style={{ paddingHorizontal: space.xl, gap: space.lg, marginTop: space.xl }}>
        <SectionHeader title="Salonunu aç" />
        <Row gap={space.md} style={{ alignItems: 'stretch' }}>
          {Platform.OS !== 'web' ? <ActionTile icon="qr-code" label="QR kod okut" tone="primary" onPress={() => router.push('/scan')} /> : null}
          <ActionTile icon="link" label="Link yapıştır" tone="violet" onPress={() => setShowLink((s) => !s)} />
        </Row>

        {showLink ? (
          <Card style={{ gap: space.md }}>
            <Field
              icon="link-outline"
              placeholder="hair.odivon.com/r/salon-adi"
              autoCapitalize="none"
              autoCorrect={false}
              value={link}
              onChangeText={setLink}
              onSubmitEditing={openLink}
            />
            <ErrorBox message={error} />
            <GradientButton title="Salonu aç" onPress={openLink} />
          </Card>
        ) : null}

        {salons.length > 0 ? (
          <>
            <SectionHeader title="Salonların" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }} style={{ marginHorizontal: -space.xl }}>
              <View style={{ width: space.xl - space.md }} />
              {salons.map((s) => (
                <Card
                  key={s.slug}
                  onPress={() => router.push({ pathname: '/salon/[slug]', params: { slug: s.slug } })}
                  style={{ width: 200, gap: space.md }}
                >
                  <Avatar name={s.salonName} size={48} />
                  <Txt variant="h3" numberOfLines={2}>
                    {s.salonName}
                  </Txt>
                  <Row gap={4}>
                    <Text style={{ color: t.primary, fontFamily: font.bold, fontSize: 13 }}>Tekrar randevu al</Text>
                    <Ionicons name="arrow-forward" size={14} color={t.primary} />
                  </Row>
                </Card>
              ))}
              <View style={{ width: space.xl - space.md }} />
            </ScrollView>
          </>
        ) : null}

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: t.primarySoft, borderColor: 'transparent' }} elevated={false}>
          <Ionicons name="compass" size={28} color={t.primary} />
          <View style={{ flex: 1 }}>
            <Txt variant="bodyStrong">Salon bul çok yakında</Txt>
            <Txt variant="caption" muted>
              Yakınındaki salonları puan ve boş saatlerine göre keşfedebileceksin.
            </Txt>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  glass: {
    padding: space.lg + 2,
    borderRadius: radius.lg + 2,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  glassMeta: { color: '#E0E7FF', fontFamily: font.semibold, fontSize: 14 },
});
