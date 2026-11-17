import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { IconName } from './components';
import { font, gradients, radius, shadow, space, useTheme } from './theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Floating, blurred pill tab bar; the active tab gets the brand gradient. */
export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
  icons,
}: TabBarProps & { icons: Record<string, IconName> }) {
  const t = useTheme();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: Math.max(insets.bottom, space.md) }]}
    >
      <View style={[{ width: '100%', maxWidth: 520, borderRadius: radius.xl }, shadow(t, 3)]}>
      <View style={[styles.bar, { borderColor: t.border }]}>
        <BlurView
          intensity={60}
          tint={t.dark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { backgroundColor: t.surfaceGlass }]}
        />
        {state.routes.map((route, index) => {
          const focused = index === state.index;
          const options = descriptors[route.key].options;
          const label = typeof options.title === 'string' ? options.title : route.name;
          const icon = icons[route.name] ?? 'ellipse-outline';
          const onPress = () => {
            if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={{ flex: focused ? 1.6 : 1 }}
            >
              {focused ? (
                <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.active}>
                  <Ionicons name={icon.replace('-outline', '') as IconName} size={19} color="#FFFFFF" />
                  <Text numberOfLines={1} style={styles.activeLabel}>
                    {label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.idle}>
                  <Ionicons name={icon} size={22} color={t.textMuted} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    width: '100%',
    maxWidth: 520,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  active: {
    height: 50,
    borderRadius: radius.lg + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: space.md,
  },
  activeLabel: { color: '#FFFFFF', fontFamily: font.bold, fontSize: 13 },
  idle: { height: 50, alignItems: 'center', justifyContent: 'center' },
});
