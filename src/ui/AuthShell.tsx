import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { BrandMark, Hero, Txt } from './components';
import { radius, shadow, space, useTheme } from './theme';

/** Sign-in layout: navy hero with the brand, a white sheet with the form overlapping it. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const t = useTheme();
  const router = useRouter();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.background }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: space.xxxl }} bounces={false}>
        <Hero style={{ paddingBottom: space.xxxl + space.xxl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {router.canGoBack() ? (
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Geri"
                style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View />
            )}
            <BrandMark size={34} light />
          </View>
        </Hero>
        <View
          style={[
            {
              marginTop: -(space.xxxl + space.md),
              marginHorizontal: space.lg,
              backgroundColor: t.surface,
              borderRadius: radius.xl,
              padding: space.xl + 2,
              gap: space.lg,
              borderWidth: 1,
              borderColor: t.border,
            },
            shadow(t, 3),
          ]}
        >
          <View style={{ gap: space.xs }}>
            <Txt variant="title">{title}</Txt>
            {subtitle ? <Txt muted>{subtitle}</Txt> : null}
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
