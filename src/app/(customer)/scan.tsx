import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { slugFromLink } from '../../lib/dates';
import { Body, Button, ErrorBox, Screen } from '../../ui/components';
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
        <Body>Salonun QR kodunu okutmak için kamera iznine ihtiyacımız var.</Body>
        <Button title="Kameraya izin ver" onPress={requestPermission} />
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
      <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: space.xxl }}>
        <ErrorBox message={error} />
      </View>
    </View>
  );
}
