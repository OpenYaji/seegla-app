import "../global.css";
import { DarkTheme, DefaultTheme, type Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { COLORS } from '@/lib/constants';

const SeeglaLight: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.teal,
    background: COLORS.background,
    card: COLORS.white,
    text: COLORS.navy,
    border: 'rgba(10,46,92,0.10)',
    notification: COLORS.orange,
  },
};

const SeeglaDark: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.teal,
    background: COLORS.navy,
    card: '#0D3870',
    text: COLORS.background,
    border: 'rgba(247,249,252,0.10)',
    notification: COLORS.orange,
  },
};

export const unstable_settings = {
  initialRouteName: '(auth)/splash-screen',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? SeeglaDark : SeeglaLight;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="(auth)/splash-screen" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>

        <PortalHost />
        <StatusBar style="dark" translucent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
