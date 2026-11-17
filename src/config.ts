/**
 * Build-time settings. Override with EXPO_PUBLIC_* variables (e.g. in .env.local) for a dev API.
 * The Firebase web config is public by design; access is enforced by MainApi and Firebase rules.
 */
export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://mainapi.odivon.com/api/v1',
  /** Public booking links look like https://hair.odivon.com/r/{slug}. */
  siteUrl: 'https://hair.odivon.com',
  firebase: {
    apiKey: 'AIzaSyAu1u-wKeR9RQBhp6lqUvo64ZbQ5fNDIGg',
    authDomain: 'odivon-main-api-a2095.firebaseapp.com',
    projectId: 'odivon-main-api-a2095',
    storageBucket: 'odivon-main-api-a2095.firebasestorage.app',
    messagingSenderId: '845036233177',
    appId: '1:845036233177:web:ba0cbe0dcdb48e197bf9c8',
  },
} as const;
