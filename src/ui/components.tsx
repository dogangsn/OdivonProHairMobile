import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AppointmentStatus } from '../api/types';
import { STATUS_LABELS } from '../api/types';
import { radius, space, useTheme } from './theme';

export function Screen({ children, scroll = true, padded = true }: { children: ReactNode; scroll?: boolean; padded?: boolean }) {
  const t = useTheme();
  const inner = <View style={[padded && styles.padded, { gap: space.lg }]}>{children}</View>;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.background }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={{ fontSize: 26, fontWeight: '700', color: t.text }}>{children}</Text>
      {subtitle ? <Text style={{ fontSize: 15, color: t.textMuted, lineHeight: 21 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontSize: 17, fontWeight: '600', color: t.text }}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 15, lineHeight: 21, color: muted ? t.textMuted : t.text }, style]}>{children}</Text>;
}

export function Card({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: ViewStyle }) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.surface,
    borderColor: t.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed && { opacity: 0.7 }]} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}) {
  const t = useTheme();
  const colors: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: t.primary, fg: t.onPrimary, border: t.primary },
    secondary: { bg: t.surface, fg: t.text, border: t.border },
    ghost: { bg: 'transparent', fg: t.primary, border: 'transparent' },
    danger: { bg: t.dangerSoft, fg: t.danger, border: t.dangerSoft },
  };
  const c = colors[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: c.bg, borderColor: c.border, opacity: off ? 0.55 : pressed ? 0.8 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={c.fg} /> : <Text style={{ color: c.fg, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string | null }) {
  const t = useTheme();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: t.text }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.textMuted}
        {...props}
        style={[
          styles.input,
          { backgroundColor: t.surface, color: t.text, borderColor: error ? t.danger : t.border },
          props.style,
        ]}
      />
      {error ? <Text style={{ color: t.danger, fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}

export function ErrorBox({ message }: { message?: string | null }) {
  const t = useTheme();
  if (!message) return null;
  return (
    <View style={{ backgroundColor: t.dangerSoft, borderRadius: radius.md, padding: space.md }} accessibilityRole="alert">
      <Text style={{ color: t.danger, fontSize: 14 }}>{message}</Text>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ padding: space.xl, alignItems: 'center', gap: space.sm }}>
      <ActivityIndicator color={t.primary} />
      {label ? <Text style={{ color: t.textMuted }}>{label}</Text> : null}
    </View>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ padding: space.xl, alignItems: 'center', gap: space.xs }}>
      <Text style={{ color: t.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{title}</Text>
      {hint ? <Text style={{ color: t.textMuted, textAlign: 'center' }}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? t.primary : t.border,
        backgroundColor: selected ? t.primarySoft : t.surface,
      }}
    >
      <Text style={{ color: selected ? t.primary : t.text, fontWeight: selected ? '600' : '400' }}>{label}</Text>
    </Pressable>
  );
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const t = useTheme();
  const tone =
    status === 'completed' || status === 'confirmed'
      ? { bg: t.successSoft, fg: t.success }
      : status === 'cancelled' || status === 'noShow'
        ? { bg: t.dangerSoft, fg: t.danger }
        : status === 'pending'
          ? { bg: t.warningSoft, fg: t.warning }
          : { bg: t.primarySoft, fg: t.primary };
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: tone.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: tone.fg, fontSize: 12, fontWeight: '600' }}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.sm }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: space.lg, paddingTop: space.lg },
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  input: { minHeight: 50, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md, fontSize: 16 },
});
