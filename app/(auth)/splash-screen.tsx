import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

/**
 * Splash Screen — Two-phase entry
 * Phase 1 (0–1.6s): Logo mark fades in on Light Gray background
 * Phase 2 (1.6s+):  Tagline appears, GET STARTED slides up
 *
 * Color ratio: ~80% bg-background (#F7F9FC), ~15% text-foreground (Navy), ~5% primary (Teal button)
 */
export default function SplashScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" translucent />

      {/* Logo zone */}
      <Animated.View
        entering={FadeIn.duration(900)}
        className="flex-1 items-center justify-center gap-5 px-8"
      >
        <Image
          source={require('@/assets/images/SEEGLA-LOGO-VARIATIONPRIMARY.png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />

        {ready && (
          <Animated.View entering={FadeInUp.duration(500)} className="items-center gap-1">
            <Text className="text-foreground text-xs tracking-[0.25em] uppercase font-medium">
              Healthy People. Growing Business.
            </Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* CTA — 10% Teal primary button */}
      {ready && (
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="px-8 pb-14"
        >
          <Button
            size="lg"
            className="rounded-full"
            onPress={() => router.replace('/onboarding')}
          >
            <Text>GET STARTED</Text>
          </Button>
        </Animated.View>
      )}
    </View>
  );
}
