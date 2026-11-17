# Odivon mobil uygulama (Expo / React Native)

Müşteri ve salon için **tek uygulama, rol bazlı** (plan: `mobil-uygulama/mobil-uygulama-plani.md`).

- **Müşteri modu:** telefon + SMS koduyla giriş, salonun linki veya QR koduyla salonu açma, online randevu (hizmet → personel → gün/saat → onay), randevularım, iptal.
- **Salon modu:** salon panelindeki e-posta/şifre ile giriş (`GET /hair/me` ile salon üyeliği kontrol edilir), Bugün (KPI + bugünkü randevular), Takvim, Müşteriler, randevu durumu değiştirme (onayla, geldi, başladı, tamamlandı, gelmedi, iptal).
- Salonda kaydı olan biri Hesap ekranından iki mod arasında geçebilir.

## Çalıştırma

```bash
cd mobile
npm install
npx expo start          # Expo Go ile telefonda aç (QR), ya da: npm run web
npm run typecheck
npm run lint
```

Expo Go yeterli; özel native modül yok. Farklı bir API için `.env.local` içine `EXPO_PUBLIC_API_BASE_URL=...` yazın.

## Yapı

```
src/app/            Expo Router ekranları
  (auth)/           welcome, phone, verify, salon-login
  (customer)/       (tabs)/home, my-appointments, account · salon/[slug] · booking/[slug]/[id] · scan · r/[slug]
  (pro)/            (tabs)/today, calendar, customers, salon-account · appointment/[id]
src/session/        oturum + aktif mod (SessionProvider), cihazdaki randevular
src/api/            MainApi istemcileri ve tipler
src/lib/            fetch sarmalayıcı (Bearer + 401'de token yenileme), Firebase, tarih/telefon yardımcıları
src/ui/             tema (açık/koyu) ve ortak bileşenler
```

Yönlendirme `src/app/_layout.tsx` içinde `Stack.Protected` ile yapılır: oturum yoksa `(auth)`, mod `customer` ise `(customer)`, `pro` ise `(pro)`.

## Backend bağımlılıkları

| Özellik | Durum |
|---|---|
| Salon girişi, Bugün, Takvim, Müşteriler, randevu durumu | Mevcut MainApi ile çalışır |
| Online randevu (müşteri) | Mevcut public booking API ile çalışır |
| **Müşteri telefon girişi** | `patches/mainapi-hair-client-auth.patch` MainApi'ye uygulanmalı (`POST /hair/client/auth/otp`, `/verify`). Platform SMS sağlayıcısı (NETGSM_*) ayarlı olmalı |
| Randevularım (tüm cihazlar) | Şimdilik bu cihazda alınan randevular; hesap bazlı liste için `/hair/client/appointments` gerekiyor |
| Salon bul (keşif) | Planda var, MainApi keşif endpoint'leri bekleniyor |
| Push bildirim | `/hair/devices` endpoint'i ve `expo-notifications` ile sonraki adım |

## Mağaza

`app.json`: ad "Odivon", kimlik `com.odivon.hair`, şema `odivon://`, `hair.odivon.com/r/*` linkleri uygulamayı açacak şekilde ayarlı (sunucuda `apple-app-site-association` ve `assetlinks.json` yayınlanınca etkinleşir). Build için: `npx eas-cli@latest build`.
