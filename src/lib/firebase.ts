import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { config } from '../config';

/** Web build: the browser keeps the session in IndexedDB. Native uses firebase.native.ts. */
const app = getApps().length ? getApp() : initializeApp(config.firebase);
export const auth = getAuth(app);
