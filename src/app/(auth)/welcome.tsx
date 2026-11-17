import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, Hero, PressScale, Row, Txt } from '../../ui/components';
import { font, gradients, radius, space } from '../../ui/theme';

/** A floating "glass" appointment card, a preview of what the app does. */
function PreviewCard() {
  const [float] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(float, { toValue: 0, duration: 2200, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Animated.View style={[styles.preview, { transform: [{ translateY }, { rotate: '-3deg' }] }]}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={space.md}>
          <LinearGradient colors={['#EC4899', '#F97316']} style={styles.previewAvatar}>
            <Text style={{ color: '#fff', fontFamily: font.bold, fontSize: 15 }}>EL</Text>
          </LinearGradient>
          <View>
            <Text style={styles.previewTitle}>Kesim + Fön</Text>
            <Text style={styles.previewSub}>Elif · Diva Kuaför</Text>
          </View>
        </Row>
        <View style={styles.previewPill}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' }} />
          <Text style={{ color: '#A7F3D0', fontFamily: font.bold, fontSize: 11 }}>Onaylandı</Text>
        </View>
      </Row>
      <Row gap={space.lg} style={{ marginTop: space.lg }}>
        <Row gap={6}>
          <Ionicons name="calendar-outline" size={15} color="#C7D2FE" />
          <Text style={styles.previewMeta}>Cumartesi</Text>
        </Row>
        <Row gap={6}>
          <Ionicons name="time-outline" size={15} color="#C7D2FE" />
          <Text style={styles.previewMeta}>14:30</Text>
        </Row>
      </Row>
    </Animated.View>
  );
}

/** First screen: customer or salon. */
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Hero rounded={false} style={{ flex: 1, paddingBottom: insets.bottom + space.xl }}>
      <BrandMark size={40} light />

      <View style={{ flex: 1, justifyContent: 'center', gap: space.xxl, paddingVertical: space.xxl }}>
        <PreviewCard />
        <View style={{ gap: space.md }}>
          <Txt variant="display" color="#FFFFFF" style={{ fontSize: 36, lineHeight: 42 }}>
            Güzelliğin{'\n'}
            <Text style={{ color: '#C4B5FD' }}>randevusu</Text> cebinde.
          </Txt>
          <Txt color="rgba(226,232,240,0.78)">Salonunu seç, saatini ayırt, hatırlatmayı bize bırak.</Txt>
        </View>
      </View>

      <View style={{ gap: space.md }}>
        <PressScale onPress={() => router.push('/phone')} accessibilityLabel="Randevu almak istiyorum">
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.choice}>
            <View style={[styles.choiceIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Ionicons name="sparkles" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.choiceTitle}>Randevu almak istiyorum</Text>
              <Text style={styles.choiceSub}>Telefon numaranla hızlı giriş</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </PressScale>

        <PressScale onPress={() => router.push('/salon-login')} accessibilityLabel="Salonumu yönetiyorum">
          <View style={[styles.choice, styles.glass]}>
            <View style={[styles.choiceIcon, { backgroundColor: 'rgba(129,140,248,0.2)' }]}>
              <Ionicons name="storefront" size={21} color="#C7D2FE" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.choiceTitle}>Salonumu yönetiyorum</Text>
              <Text style={styles.choiceSub}>Salon sahibi ve personel girişi</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#C7D2FE" />
          </View>
        </PressScale>

        <Txt variant="caption" center color="rgba(148,163,184,0.9)" style={{ marginTop: space.xs }}>
          KVKK uyumlu · Verilerin Türkiye’deki bulutta güvende
        </Txt>
      </View>
    </Hero>
  );
}

const styles = StyleSheet.create({
  preview: {
    alignSelf: 'center',
    width: '92%',
    maxWidth: 360,
    padding: space.lg + 2,
    borderRadius: radius.lg + 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  previewAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  previewTitle: { color: '#FFFFFF', fontFamily: font.bold, fontSize: 16 },
  previewSub: { color: 'rgba(199,210,254,0.8)', fontFamily: font.medium, fontSize: 13, marginTop: 2 },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.18)',
  },
  previewMeta: { color: '#E0E7FF', fontFamily: font.semibold, fontSize: 13 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg + 2,
    minHeight: 76,
  },
  glass: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  choiceIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { color: '#FFFFFF', fontFamily: font.bold, fontSize: 16 },
  choiceSub: { color: 'rgba(224,231,255,0.8)', fontFamily: font.medium, fontSize: 13, marginTop: 2 },
});
