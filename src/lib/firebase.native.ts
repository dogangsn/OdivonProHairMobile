import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as rnAuth from '@firebase/auth';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { config } from '../config';

// Metro resolves @firebase/auth to its React Native build, which exports getReactNativePersistence;
// the package's top-level typings describe the browser build, so the type is declared here.
const { getReactNativePersistence } = rnAuth as unknown as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

/** iOS / Android: the Firebase JS SDK with the session persisted in AsyncStorage. */
const app = getApps().length ? getApp() : initializeApp(config.firebase);

function createAuth(): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Fast refresh re-runs this module; auth is already initialised then.
    return getAuth(app);
  }
}

export const auth = createAuth();
