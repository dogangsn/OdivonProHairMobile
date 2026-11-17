import { useColorScheme } from 'react-native';

/** Odivon palette (indigo primary, same as the web panel's Tailwind tokens). */
const light = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  primary: '#4F46E5',
  primarySoft: '#EEF2FF',
  onPrimary: '#FFFFFF',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  success: '#059669',
  successSoft: '#ECFDF5',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
};

const dark: typeof light = {
  background: '#0B1120',
  surface: '#111827',
  surfaceMuted: '#1F2937',
  border: '#334155',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  primary: '#818CF8',
  primarySoft: '#1E1B4B',
  onPrimary: '#0B1120',
  danger: '#F87171',
  dangerSoft: '#450A0A',
  success: '#34D399',
  successSoft: '#022C22',
  warning: '#FBBF24',
  warningSoft: '#422006',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
