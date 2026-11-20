import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppointmentStatus } from '../api/types';
import { STATUS_LABELS } from '../api/types';
import { avatarColors, font, gradients, radius, shadow, space, useTheme, type Theme } from './theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
}

/* ------------------------------------------------------------------ Text */

type TxtVariant = 'display' | 'title' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'caption' | 'label' | 'kpi';

const TXT: Record<TxtVariant, TextStyle> = {
  display: { fontFamily: font.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  title: { fontFamily: font.extrabold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontFamily: font.bold, fontSize: 19, lineHeight: 25, letterSpacing: -0.3 },
  h3: { fontFamily: font.bold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: font.medium, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: font.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: font.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1 },
  kpi: { fontFamily: font.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
};

export function Txt({
  children,
  variant = 'body',
  color,
  muted,
  center,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  variant?: TxtVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const t = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[TXT[variant], { color: color ?? (muted ? t.textMuted : t.text) }, center && { textAlign: 'center' }, style]}
    >
      {variant === 'label' && typeof children === 'string' ? children.toLocaleUpperCase('tr-TR') : children}
    </Text>
  );
}

/* --------------------------------------------------------------- Layout */

export function Screen({
  children,
  scroll = true,
  edges = ['top', 'left', 'right'],
  contentStyle,
  bottomInset = 0,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom padding, e.g. for the floating tab bar or a sticky footer. */
  bottomInset?: number;
}) {
  const t = useTheme();
  const inner = (
    <View style={[{ paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.lg }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: t.background }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: space.xxxl + bottomInset }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

/** Space the floating tab bar takes at the bottom of tab screens. */
export const TAB_BAR_SPACE = 96;

export function Row({ children, style, gap = space.sm }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Spacer() {
  return <View style={{ flex: 1 }} />;
}

/* -------------------------------------------------------------- Brand */

/** The Odivon mark alone: brand-gradient tile with the tilted white ring. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: 'center', justifyContent: 'center' }}
    >
      <LogoRing size={size * 0.5} />
    </LinearGradient>
  );
}

/** The tilted ring from the Odivon mark; `size` is its outer diameter. */
function LogoRing({ size, color = '#FFFFFF' }: { size: number; color?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        borderWidth: size * 0.22,
        borderColor: color,
        transform: [{ rotate: '-20deg' }, { scaleX: 0.85 }],
      }}
    />
  );
}

/** A 0 → 1 value that repeats forever while the component is mounted. */
function useLoop(duration: number) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v;
}

/** Page loader: the Odivon mark breathing while its ring turns. */
export function LogoLoader({ size = 56 }: { size?: number }) {
  const t = useTheme();
  const v = useLoop(1400);
  const scale = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1.04, 0.92] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Yükleniyor"
      style={[shadow(t, 2), { borderRadius: size * 0.32, transform: [{ scale }] }]}
    >
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <LogoRing size={size * 0.5} />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

/** Small inline loader for buttons: the Odivon ring, spinning. */
export function LogoSpinner({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) {
  const v = useLoop(900);
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View accessibilityRole="progressbar" accessibilityLabel="Yükleniyor" style={{ transform: [{ rotate }] }}>
      <LogoRing size={size} color={color} />
    </Animated.View>
  );
}

export function BrandMark({ size = 40, light }: { size?: number; light?: boolean }) {
  const t = useTheme();
  return (
    <Row gap={space.md}>
      <LogoMark size={size} />
      <View>
        <Txt variant="h2" color={light ? '#FFFFFF' : t.text} style={{ fontSize: size * 0.48, lineHeight: size * 0.58 }}>
          Odivon
        </Txt>
        <Txt variant="label" color={light ? 'rgba(199,210,254,0.85)' : t.textMuted} style={{ fontSize: 9, letterSpacing: 2 }}>
          Kuaför · Güzellik
        </Txt>
      </View>
    </Row>
  );
}

/** Deep-navy hero with glow orbs, the signature surface of the Odivon login. */
export function Hero({
  children,
  style,
  rounded = true,
  safeTop = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  rounded?: boolean;
  safeTop?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          paddingTop: (safeTop ? insets.top : 0) + space.lg,
          paddingHorizontal: space.xl,
          paddingBottom: space.xxl,
          overflow: 'hidden',
        },
        rounded && { borderBottomLeftRadius: radius.xl + 8, borderBottomRightRadius: radius.xl + 8 },
        style,
      ]}
    >
      <View pointerEvents="none" style={[styles.orb, { top: -90, right: -70, backgroundColor: '#8B5CF6', opacity: 0.55 }]} />
      <View pointerEvents="none" style={[styles.orb, { bottom: -140, left: -100, backgroundColor: '#4F46E5', opacity: 0.45 }]} />
      <View pointerEvents="none" style={[styles.orbSmall, { top: 30, left: '50%', backgroundColor: '#22D3EE', opacity: 0.22 }]} />
      {/* Softens the orbs into glows (backdrop blur on web/iOS; a light veil on Android). */}
      <BlurView pointerEvents="none" intensity={70} tint="dark" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,16,38,0.15)' }]} />
      {children}
    </LinearGradient>
  );
}

/* ---------------------------------------------------------------- Cards */

export function Card({
  children,
  onPress,
  style,
  padded = true,
  elevated = true,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
}) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.surface,
    borderRadius: radius.lg + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.border,
    padding: padded ? space.lg + 2 : 0,
    gap: space.sm,
    ...(elevated ? shadow(t, 1) : null),
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return <PressScale onPress={onPress} style={[base, style]}>{children}</PressScale>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that shrinks slightly while pressed (layout styles apply to the pressable itself). */
export function PressScale({
  children,
  onPress,
  style,
  disabled,
  accessibilityLabel,
  haptic = true,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  haptic?: boolean;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 6 }).start();
  return (
    <AnimatedPressable
      onPress={() => {
        if (haptic) tap();
        onPress?.();
      }}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function IconBadge({
  icon,
  tone = 'primary',
  size = 42,
}: {
  icon: IconName;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'violet';
  size?: number;
}) {
  const t = useTheme();
  const map = {
    primary: [t.primarySoft, t.primary],
    success: [t.successSoft, t.success],
    warning: [t.warningSoft, t.warning],
    danger: [t.dangerSoft, t.danger],
    info: [t.infoSoft, t.info],
    violet: [t.violetSoft, t.violet],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color={fg} />
    </View>
  );
}

export function KpiCard({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: IconName;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'violet' | 'danger';
  hint?: string;
}) {
  return (
    <Card style={{ flexBasis: '46%', flexGrow: 1, gap: space.md }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Txt variant="label" muted style={{ flex: 1, marginTop: 4 }}>
          {label}
        </Txt>
        <IconBadge icon={icon} tone={tone} size={36} />
      </Row>
      <Txt variant="kpi" numberOfLines={1}>
        {value}
      </Txt>
      {hint ? (
        <Txt variant="caption" muted>
          {hint}
        </Txt>
      ) : null}
    </Card>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase('tr-TR'))
    .join('');
  return (
    <LinearGradient
      colors={avatarColors(name)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: '#FFFFFF', fontFamily: font.bold, fontSize: size * 0.36 }}>{initials || '?'}</Text>
    </LinearGradient>
  );
}

/* -------------------------------------------------------------- Buttons */

export function GradientButton({
  title,
  onPress,
  loading,
  disabled,
  icon = 'arrow-forward',
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName | null;
  style?: StyleProp<ViewStyle>;
}) {
  const off = disabled || loading;
  return (
    <PressScale onPress={onPress} disabled={off} accessibilityLabel={title} style={[{ opacity: off ? 0.6 : 1 }, style]}>
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.gradientButton}>
        {loading ? (
          <LogoSpinner />
        ) : (
          <Row gap={space.sm}>
            <Text style={styles.gradientButtonText}>{title}</Text>
            {icon ? <Ionicons name={icon} size={18} color="#FFFFFF" /> : null}
          </Row>
        )}
      </LinearGradient>
    </PressScale>
  );
}

type ButtonVariant = 'secondary' | 'ghost' | 'danger' | 'glass';

export function Button({
  title,
  onPress,
  variant = 'secondary',
  icon,
  loading,
  disabled,
  compact,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const t = useTheme();
  const c = {
    secondary: { bg: t.surface, fg: t.text, border: t.borderStrong },
    ghost: { bg: 'transparent', fg: t.primary, border: 'transparent' },
    danger: { bg: t.dangerSoft, fg: t.danger, border: 'transparent' },
    glass: { bg: 'rgba(255,255,255,0.12)', fg: '#FFFFFF', border: 'rgba(255,255,255,0.22)' },
  }[variant];
  const off = disabled || loading;
  return (
    <PressScale onPress={onPress} disabled={off} accessibilityLabel={title}>
      <View
        style={[
          styles.button,
          compact && { minHeight: 42, paddingHorizontal: space.md },
          { backgroundColor: c.bg, borderColor: c.border, opacity: off ? 0.55 : 1 },
        ]}
      >
        {loading ? (
          <LogoSpinner color={c.fg} />
        ) : (
          <Row gap={space.sm}>
            {icon ? <Ionicons name={icon} size={18} color={c.fg} /> : null}
            <Text style={{ color: c.fg, fontFamily: font.bold, fontSize: compact ? 14 : 15, textAlign: 'center' }}>{title}</Text>
          </Row>
        )}
      </View>
    </PressScale>
  );
}

/** Square-ish quick action tile (icon + label). */
export function ActionTile({ icon, label, onPress, tone = 'primary' }: { icon: IconName; label: string; onPress: () => void; tone?: 'primary' | 'violet' | 'success' | 'info' | 'warning' | 'danger' }) {
  return (
    <Card onPress={onPress} style={{ flex: 1, alignItems: 'flex-start', gap: space.md }}>
      <IconBadge icon={icon} tone={tone} />
      <Txt variant="bodyStrong">{label}</Txt>
    </Card>
  );
}

/* --------------------------------------------------------------- Inputs */

/**
 * Focus an input once its screen has finished sliding in. A plain `autoFocus` fires mid-transition
 * on Android, where the native stack then takes focus back: the keyboard pops up and drops again.
 */
function useFocusAfterTransition(ref: React.RefObject<React.ComponentRef<typeof TextInput> | null>, enabled: boolean) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;
      const id = setTimeout(() => ref.current?.focus(), Platform.OS === 'android' ? 450 : 350);
      return () => clearTimeout(id);
    }, [ref, enabled]),
  );
}

export function Field({
  label,
  error,
  icon,
  secure,
  trailing,
  autoFocus,
  ...props
}: TextInputProps & { label?: string; error?: string | null; icon?: IconName; secure?: boolean; trailing?: ReactNode }) {
  const t = useTheme();
  const ref = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  useFocusAfterTransition(ref, !!autoFocus);
  return (
    <View style={{ gap: space.sm }}>
      {label ? (
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt variant="caption" style={{ fontFamily: font.bold, color: t.text }}>
            {label}
          </Txt>
          {trailing}
        </Row>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: t.surface,
            borderColor: error ? t.danger : focused ? t.primary : t.borderStrong,
            // Same style keys on every render; only values change, so the native view is never rebuilt.
            shadowColor: t.primary,
            shadowOpacity: focused && Platform.OS === 'ios' ? 0.25 : 0,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {icon ? <Ionicons name={icon} size={19} color={focused ? t.primary : t.textSubtle} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={t.textSubtle}
          {...props}
          secureTextEntry={secure ? hidden : props.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, { color: t.text }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object), props.style]}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Şifreyi göster' : 'Şifreyi gizle'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={t.textSubtle} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Txt variant="caption" color={t.danger}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

/** Six separate boxes over one hidden input (SMS autofill still works). */
export function OtpInput({ value, onChange, onComplete }: { value: string; onChange: (v: string) => void; onComplete?: (v: string) => void }) {
  const t = useTheme();
  const ref = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  useFocusAfterTransition(ref, true);
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="Doğrulama kodu">
      <Row gap={space.sm} style={{ justifyContent: 'space-between' }}>
        {Array.from({ length: 6 }, (_, i) => {
          const active = focused && (i === value.length || (i === 5 && value.length === 6));
          return (
            <View
              key={i}
              style={[
                styles.otpBox,
                {
                  backgroundColor: t.surface,
                  borderColor: active ? t.primary : value[i] ? t.borderStrong : t.border,
                  borderWidth: active ? 2 : 1,
                },
                shadow(t, 1),
              ]}
            >
              <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: t.text }}>{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </Row>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => {
          const digits = v.replace(/\D/g, '').slice(0, 6);
          onChange(digits);
          if (digits.length === 6) onComplete?.(digits);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={6}
        caretHidden
        contextMenuHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

/** Search box for lists. */
export function SearchBar(props: TextInputProps) {
  return <Field icon="search" placeholder="Ara" autoCorrect={false} returnKeyType="search" {...props} />;
}

/* ------------------------------------------------------------ Feedback */

export function ErrorBox({ message }: { message?: string | null }) {
  const t = useTheme();
  if (!message) return null;
  return (
    <Row
      gap={space.sm}
      style={{ backgroundColor: t.dangerSoft, borderRadius: radius.md, padding: space.md, alignItems: 'flex-start' }}
    >
      <Ionicons name="alert-circle" size={18} color={t.danger} style={{ marginTop: 1 }} />
      <Txt variant="caption" color={t.danger} style={{ flex: 1, fontFamily: font.semibold }}>
        {message}
      </Txt>
    </Row>
  );
}

export function InfoBox({ message, icon = 'checkmark-circle' }: { message?: string | null; icon?: IconName }) {
  const t = useTheme();
  if (!message) return null;
  return (
    <Row gap={space.sm} style={{ backgroundColor: t.successSoft, borderRadius: radius.md, padding: space.md }}>
      <Ionicons name={icon} size={18} color={t.success} />
      <Txt variant="caption" color={t.success} style={{ flex: 1, fontFamily: font.semibold }}>
        {message}
      </Txt>
    </Row>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={{ padding: space.xxl, alignItems: 'center', gap: space.md }}>
      <LogoLoader />
      {label ? <Txt variant="caption" muted>{label}</Txt> : null}
    </View>
  );
}

export function Empty({ title, hint, icon = 'sparkles-outline' }: { title: string; hint?: string; icon?: IconName }) {
  const t = useTheme();
  return (
    <View style={{ paddingVertical: space.xxl, alignItems: 'center', gap: space.md }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={30} color={t.primary} />
      </View>
      <Txt variant="h3" center>
        {title}
      </Txt>
      {hint ? (
        <Txt variant="caption" muted center style={{ maxWidth: 280 }}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------- Chips / pills */

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress: () => void; icon?: IconName }) {
  const t = useTheme();
  const content = (
    <Row gap={6}>
      {icon ? <Ionicons name={icon} size={15} color={selected ? '#FFFFFF' : t.textMuted} /> : null}
      <Text style={{ color: selected ? '#FFFFFF' : t.text, fontFamily: selected ? font.bold : font.semibold, fontSize: 14 }}>{label}</Text>
    </Row>
  );
  return (
    <PressScale onPress={onPress} accessibilityLabel={label}>
      {selected ? (
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.chip}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.chip, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}>{content}</View>
      )}
    </PressScale>
  );
}

/** Two-option switch, like the web login's "Giriş yap / Kayıt ol" tabs. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <Row gap={4} style={{ backgroundColor: t.surfaceMuted, borderRadius: radius.md + 2, padding: 4 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => { tap(); onChange(o.value); }} style={{ flex: 1 }} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            {active ? (
              <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.segment}>
                <Text style={{ color: '#FFFFFF', fontFamily: font.bold, fontSize: 14 }}>{o.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.segment}>
                <Text style={{ color: t.textMuted, fontFamily: font.semibold, fontSize: 14 }}>{o.label}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </Row>
  );
}

function statusTone(t: Theme, status: AppointmentStatus) {
  switch (status) {
    case 'completed':
      return { bg: t.successSoft, fg: t.success };
    case 'confirmed':
      return { bg: t.infoSoft, fg: t.info };
    case 'pending':
      return { bg: t.warningSoft, fg: t.warning };
    case 'cancelled':
    case 'noShow':
      return { bg: t.dangerSoft, fg: t.danger };
    default:
      return { bg: t.violetSoft, fg: t.violet };
  }
}

export function statusColor(t: Theme, status: AppointmentStatus): string {
  return statusTone(t, status).fg;
}

export function StatusPill({ status }: { status: AppointmentStatus }) {
  const t = useTheme();
  const tone = statusTone(t, status);
  return (
    <Row gap={6} style={{ alignSelf: 'flex-start', backgroundColor: tone.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tone.fg }} />
      <Text style={{ color: tone.fg, fontSize: 12, fontFamily: font.bold }}>{STATUS_LABELS[status] ?? status}</Text>
    </Row>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: space.sm }}>
      <Txt variant="h2">{title}</Txt>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: t.primary, fontFamily: font.bold, fontSize: 14 }}>{action}</Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

/** Settings-style row with an icon badge and a chevron. */
export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  tone = 'primary',
  danger,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  tone?: 'primary' | 'violet' | 'success' | 'info' | 'warning' | 'danger';
  danger?: boolean;
}) {
  const t = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityLabel={title}>
      <Row gap={space.md} style={{ paddingVertical: space.md }}>
        <IconBadge icon={icon} tone={danger ? 'danger' : tone} size={38} />
        <View style={{ flex: 1 }}>
          <Txt variant="bodyStrong" color={danger ? t.danger : undefined}>
            {title}
          </Txt>
          {subtitle ? <Txt variant="caption" muted>{subtitle}</Txt> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.textSubtle} />
      </Row>
    </PressScale>
  );
}

/** Thin progress bar for multi-step flows. */
export function Steps({ count, current }: { count: number; current: number }) {
  const t = useTheme();
  return (
    <Row gap={6}>
      {Array.from({ length: count }, (_, i) =>
        i <= current ? (
          <LinearGradient key={i} colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.step} />
        ) : (
          <View key={i} style={[styles.step, { backgroundColor: t.surfaceMuted }]} />
        ),
      )}
    </Row>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: 260, height: 260, borderRadius: 130 },
  orbSmall: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
  gradientButton: {
    minHeight: 54,
    borderRadius: radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  gradientButtonText: { color: '#FFFFFF', fontFamily: font.bold, fontSize: 16 },
  button: {
    minHeight: 52,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  inputWrap: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.md + 2,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  input: { flex: 1, fontSize: 16, fontFamily: font.medium, paddingVertical: space.md },
  otpBox: { flex: 1, maxWidth: 56, aspectRatio: 0.86, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  // Covers the boxes at near-zero opacity: Android drops the keyboard for 1x1 / fully transparent inputs.
  hiddenInput: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.02, color: 'transparent', fontSize: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill },
  segment: { minHeight: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  step: { flex: 1, height: 5, borderRadius: 3 },
});

/** In-screen top bar with a round back button (stack headers are hidden for a cleaner look). */
export function TopBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', minHeight: 44 }}>
      {onBack ? (
        <PressScale onPress={onBack} accessibilityLabel="Geri">
          <View style={[{ width: 42, height: 42, borderRadius: 14, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border }, shadow(t, 1)]}>
            <Ionicons name="chevron-back" size={22} color={t.text} />
          </View>
        </PressScale>
      ) : (
        <View style={{ width: 42 }} />
      )}
      {title ? (
        <Txt variant="h3" numberOfLines={1} style={{ flex: 1, textAlign: 'center', marginHorizontal: space.sm }}>
          {title}
        </Txt>
      ) : (
        <Spacer />
      )}
      {right ?? <View style={{ width: 42 }} />}
    </Row>
  );
}
