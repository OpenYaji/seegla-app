import "../global.css";
import { DarkTheme, DefaultTheme, type Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { COLORS } from '@/lib/constants';

// ─── Seegla-branded navigation themes ────────────────────────────────────────
// Maps SEEGLA_GUIDELINES.MD palette onto React Navigation's theme contract.

const SeeglaLight: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary:      COLORS.teal,        // #16A085 — 10% action colour
    background:   COLORS.background,  // #F7F9FC — 60% Light Gray
    card:         COLORS.white,
    text:         COLORS.navy,        // #0A2E5C — 25% brand anchor
    border:       'rgba(10,46,92,0.10)',
    notification: COLORS.orange,      // #F59E0B — 2% rewards only
  },
};

const SeeglaDark: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary:      COLORS.teal,
    background:   COLORS.navy,        // Navy becomes the dark-mode surface
    card:         '#0D3870',
    text:         COLORS.background,  // Light Gray as dark-mode text
    border:       'rgba(247,249,252,0.10)',
    notification: COLORS.orange,
  },
};

// ─── Root layout ──────────────────────────────────────────────────────────────

export const unstable_settings = {
  // App entry point — user sees splash-screen first, then onboarding, then (tabs)
  initialRouteName: 'splash-screen',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? SeeglaDark : SeeglaLight;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider value={theme}>
      <Stack>
        <Stack.Screen name="splash-screen" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding"    options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="login"         options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"        options={{ headerShown: false }} />
        <Stack.Screen name="modal"         options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>

      {/* PortalHost lives outside Stack so overlays (sheets, tooltips, selects) render above all screens */}
      <PortalHost />

      {/* dark = black icons, correct for our light gray (#F7F9FC) background.
          Dark-background screens (onboarding) override this locally with style="light" */}
      <StatusBar style="dark" translucent />
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
