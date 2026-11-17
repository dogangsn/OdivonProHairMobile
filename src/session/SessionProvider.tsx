import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clientAuth } from '../api/client-auth';
import { salonApi } from '../api/salon';
import type { HairMe } from '../api/types';
import { ApiError } from '../lib/api';
import { auth } from '../lib/firebase';

/** Which half of the app is showing. One account can use both when it is also salon staff. */
export type AppMode = 'customer' | 'pro';

interface SessionState {
  ready: boolean;
  user: User | null;
  mode: AppMode | null;
  /** The salon membership from GET /hair/me; null for customers. */
  staff: HairMe | null;
}

interface SessionApi extends SessionState {
  requestCustomerCode(phone: string): Promise<{ phone: string; expiresInSeconds: number }>;
  signInCustomer(phone: string, code: string): Promise<void>;
  signInSalon(email: string, password: string): Promise<void>;
  switchMode(mode: AppMode): Promise<void>;
  signOut(): Promise<void>;
}

const MODE_KEY = 'odivon.mode.v1';
const SessionContext = createContext<SessionApi | null>(null);

/** GET /hair/me answers only for staff; anything else means "not a salon account". */
async function fetchStaff(): Promise<HairMe | null> {
  try {
    return await salonApi.me();
  } catch (error) {
    if (error instanceof ApiError && error.status !== 0) return null;
    throw error;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>({ ready: false, user: null, mode: null, staff: null });
  /** While a salon sign-in checks /hair/me, the auth listener must not show the customer screens. */
  const salonSignIn = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (salonSignIn.current) return;
      if (!user) {
        setState({ ready: true, user: null, mode: null, staff: null });
        return;
      }
      const stored = (await AsyncStorage.getItem(MODE_KEY).catch(() => null)) as AppMode | null;
      let staff: HairMe | null = null;
      try {
        staff = await fetchStaff();
      } catch {
        // Offline at launch: keep the stored mode, the screens show their own errors.
        setState({ ready: true, user, mode: stored ?? 'customer', staff: null });
        return;
      }
      const mode: AppMode = stored === 'pro' && staff ? 'pro' : stored === 'customer' || !staff ? 'customer' : 'pro';
      setState({ ready: true, user, mode, staff });
    });
  }, []);

  const setMode = useCallback(async (mode: AppMode) => {
    await AsyncStorage.setItem(MODE_KEY, mode).catch(() => undefined);
    setState((s) => ({ ...s, mode }));
  }, []);

  const value = useMemo<SessionApi>(
    () => ({
      ...state,
      async requestCustomerCode(phone) {
        return clientAuth.requestCode(phone);
      },
      async signInCustomer(phone, code) {
        const { customToken } = await clientAuth.verify(phone, code);
        await AsyncStorage.setItem(MODE_KEY, 'customer').catch(() => undefined);
        await signInWithCustomToken(auth, customToken);
      },
      async signInSalon(email, password) {
        salonSignIn.current = true;
        try {
          const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
          const staff = await fetchStaff().catch(() => null);
          if (!staff) {
            await firebaseSignOut(auth);
            throw new Error('Bu hesap bir salona bağlı değil. Salon panelinden kayıt olduğunuz e-postayla giriş yapın.');
          }
          await AsyncStorage.setItem(MODE_KEY, 'pro').catch(() => undefined);
          setState({ ready: true, user, staff, mode: 'pro' });
        } finally {
          salonSignIn.current = false;
        }
      },
      async switchMode(mode) {
        if (mode === 'pro' && !state.staff) throw new Error('Bu hesap bir salona bağlı değil.');
        await setMode(mode);
      },
      async signOut() {
        await AsyncStorage.removeItem(MODE_KEY).catch(() => undefined);
        queryClient.clear();
        await firebaseSignOut(auth);
      },
    }),
    [state, setMode, queryClient],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

/** Firebase Auth error codes → Turkish messages. */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'E-posta veya şifre hatalı.';
  }
  if (code === 'auth/too-many-requests') return 'Çok fazla deneme yapıldı, biraz sonra tekrar deneyin.';
  if (code === 'auth/network-request-failed') return 'İnternet bağlantınızı kontrol edin.';
  if (code === 'auth/invalid-email') return 'Geçerli bir e-posta adresi girin.';
  return error instanceof Error ? error.message : 'Bir hata oluştu.';
}
