import { api } from '../lib/api';

/**
 * Customer phone sign-in (MainApi patch patches/mainapi-hair-client-auth.patch):
 * an SMS code is exchanged for a Firebase custom token.
 */
export const clientAuth = {
  requestCode: (phone: string) =>
    api<{ sent: boolean; phone: string; expiresInSeconds: number }>('POST', '/hair/client/auth/otp', {
      anonymous: true,
      body: { phone },
    }),
  verify: (phone: string, code: string) =>
    api<{ customToken: string }>('POST', '/hair/client/auth/verify', { anonymous: true, body: { phone, code } }),
};
