import { useColorScheme } from 'react-native';

/**
 * Odivon design tokens (same language as the web panel's v3 login: deep navy hero, indigo → violet
 * gradients, Plus Jakarta Sans, large radii, soft shadows).
 */
const light = {
  dark: false,
  background: '#F5F6FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F2F8',
  surfaceGlass: 'rgba(255,255,255,0.78)',
  border: 'rgba(15,23,42,0.08)',
  borderStrong: 'rgba(15,23,42,0.14)',
  text: '#0F172A',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  primary: '#6366F1',
  primaryDeep: '#4F46E5',
  primarySoft: '#EEF0FF',
  onPrimary: '#FFFFFF',
  success: '#059669',
  successSoft: '#E7F8F1',
  warning: '#B45309',
  warningSoft: '#FFF5E1',
  danger: '#E11D48',
  dangerSoft: '#FFE9EE',
  info: '#0284C7',
  infoSoft: '#E5F4FD',
  violet: '#7C3AED',
  violetSoft: '#F3EBFF',
  shadow: '#1E1B4B',
};

const dark: typeof light = {
  dark: true,
  background: '#0B1120',
  surface: '#131B2E',
  surfaceMuted: '#1A2440',
  surfaceGlass: 'rgba(19,27,46,0.82)',
  border: 'rgba(148,163,184,0.14)',
  borderStrong: 'rgba(148,163,184,0.26)',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textSubtle: '#64748B',
  primary: '#818CF8',
  primaryDeep: '#6366F1',
  primarySoft: 'rgba(99,102,241,0.18)',
  onPrimary: '#FFFFFF',
  success: '#34D399',
  successSoft: 'rgba(16,185,129,0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(245,158,11,0.16)',
  danger: '#FB7185',
  dangerSoft: 'rgba(244,63,94,0.16)',
  info: '#38BDF8',
  infoSoft: 'rgba(14,165,233,0.16)',
  violet: '#C4B5FD',
  violetSoft: 'rgba(139,92,246,0.18)',
  shadow: '#000000',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const gradients = {
  brand: ['#6366F1', '#8B5CF6', '#A855F7'] as const,
  hero: ['#0B1026', '#1B1650', '#2A0F5C'] as const,
  heroSoft: ['#4F46E5', '#7C3AED'] as const,
};

export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/** Soft, colored elevation (iOS shadow + Android elevation + web boxShadow). */
export function shadow(t: Theme, level: 1 | 2 | 3 = 1) {
  const opacity = t.dark ? 0.4 : [0, 0.06, 0.1, 0.18][level];
  const radiusPx = [0, 12, 20, 28][level];
  return {
    shadowColor: t.shadow,
    shadowOpacity: opacity,
    shadowRadius: radiusPx,
    shadowOffset: { width: 0, height: level * 4 },
    elevation: level * 3,
  };
}

/** Stable pastel pair for avatars, picked from the name. */
const AVATAR_PAIRS = [
  ['#6366F1', '#A855F7'],
  ['#0EA5E9', '#6366F1'],
  ['#EC4899', '#F97316'],
  ['#10B981', '#0EA5E9'],
  ['#F59E0B', '#EF4444'],
  ['#8B5CF6', '#EC4899'],
] as const;

export function avatarColors(name: string): readonly [string, string] {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_PAIRS[hash % AVATAR_PAIRS.length];
}
