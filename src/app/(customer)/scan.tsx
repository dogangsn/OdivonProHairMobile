import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { slugFromLink } from '../../lib/dates';
import { Empty, ErrorBox, GradientButton, Screen, TopBar } from '../../ui/components';
import { space } from '../../ui/theme';

/** Reads the salon's booking QR code (it encodes https://hair.odivon.com/r/{slug}). */
export default function ScanQr() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  if (!permission) return <Screen>{null}</Screen>;
  if (!permission.granted) {
    return (
      <Screen>
        <TopBar onBack={() => router.back()} />
        <Empty icon="camera-outline" title="Kamera izni gerekiyor" hint="Salonun QR kodunu okutmak için kameraya erişmemize izin ver." />
        <GradientButton title="Kameraya izin ver" onPress={requestPermission} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (handled.current) return;
          const slug = slugFromLink(data);
          if (!slug || !/odivon|^[a-z0-9-]+$/i.test(data)) {
            setError('Bu bir Odivon randevu QR kodu değil.');
            return;
          }
          handled.current = true;
          router.replace({ pathname: '/salon/[slug]', params: { slug } });
        }}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 240, height: 240, borderRadius: 32, borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)' }} />
        </View>
      </View>
      <View style={{ position: 'absolute', left: space.xl, right: space.xl, top: space.xxxl + space.lg }}>
        <TopBar onBack={() => router.back()} title="QR kodu çerçeveye getir" />
      </View>
      <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: space.xxxl }}>
        <ErrorBox message={error} />
      </View>
    </View>
  );
}
