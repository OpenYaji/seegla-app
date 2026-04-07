import { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const { width: W, height: H } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: '1',
    headline: 'DAILY WELLNESS,\nREWARDED',
    body: "Stay healthy, join challenges, and unlock exclusive rewards — all through your company's wellness program.",
    cta: 'NEXT',
  },
  {
    id: '2',
    headline: 'CHECK IN DAILY,\nEARN EVERY NIGHT',
    body: 'Answer 3 quick wellness questions each morning. At 8 PM your exclusive Daily Promo Hour unlocks real rewards.',
    cta: 'NEXT',
  },
  {
    id: '3',
    headline: 'COMPETE, CONNECT\n& CELEBRATE',
    body: 'Join team challenges, climb the leaderboard, and cheer on your colleagues. Wellness is better together.',
    cta: 'START YOUR JOURNEY',
  },
] as const;

// ─── Animated pagination dot ──────────────────────────────────────────────────

function AnimatedDot({ index, panX }: { index: number; panX: Animated.SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const pos = -panX.value / W;
    const p = interpolate(pos, [index - 1, index, index + 1], [0, 1, 0], Extrapolation.CLAMP);
    return {
      width:   interpolate(p, [0, 1], [8, 24]),
      opacity: interpolate(p, [0, 1], [0.3, 1]),
    };
  });
  return (
    <Animated.View style={[style, { height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }]} />
  );
}

// ─── Slide 1 Hero — Welcome Brand ────────────────────────────────────────────

function WelcomeHero({ active }: { active: boolean }) {
  const scale   = useSharedValue(0.75);
  const opacity = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value       = withDelay(200, withSpring(1, { damping: 12, stiffness: 180 }));
      opacity.value     = withDelay(200, withTiming(1, { duration: 500 }));
      ringScale.value   = withDelay(100, withSpring(1, { damping: 15, stiffness: 120 }));
      ringOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    } else {
      scale.value       = 0.75;
      opacity.value     = 0;
      ringScale.value   = 0.8;
      ringOpacity.value = 0;
    }
  }, [active]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity:   ringOpacity.value,
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Decorative rings — onboarding gradient context per brand guidelines */}
      <Animated.View style={[ringStyle, { position: 'absolute', alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ position: 'absolute', width: 310, height: 310, borderRadius: 155, borderWidth: 1, borderColor: 'rgba(108,77,217,0.18)' }} />
        <View style={{ position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(22,160,133,0.25)' }} />
        <View style={{ position: 'absolute', width: 170, height: 170, borderRadius: 85,  borderWidth: 1, borderColor: 'rgba(22,160,133,0.38)' }} />
      </Animated.View>

      <Animated.View style={[logoStyle, { alignItems: 'center', gap: 10 }]}>
        <Image
          source={require('@/assets/images/SEEGLA-LOGO-VARIATIONICON.png')}
          style={{ width: 108, height: 108 }}
          resizeMode="contain"
          tintColor="#FFFFFF"
        />
        <Text className="text-white/40 text-xs tracking-[0.35em] uppercase">www.seegla.ph</Text>
      </Animated.View>
    </View>
  );
}

// ─── Slide 2 Hero — Daily Check-In Preview ───────────────────────────────────

const CHECK_IN_QUESTIONS = [
  { label: 'Mood',   icon: '😊' },
  { label: 'Energy', icon: '⚡' },
  { label: 'Sleep',  icon: '🌙' },
] as const;

function CheckInCardItem({
  label, icon, delay, active,
}: {
  label: string; icon: string; delay: number; active: boolean;
}) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (active) {
      opacity.value    = withDelay(delay, withTiming(1, { duration: 300 }));
      translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 200 }));
    } else {
      opacity.value    = withTiming(0, { duration: 150 });
      translateY.value = 20;
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20,
    }]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text className="text-white font-medium text-base flex-1">{label}</Text>
      <View style={{
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 1.5, borderColor: 'rgba(22,160,133,0.5)',
      }} />
    </Animated.View>
  );
}

function CheckInHero({ active }: { active: boolean }) {
  const labelOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      labelOpacity.value = withDelay(120, withTiming(1, { duration: 350 }));
    } else {
      labelOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [active]);

  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 10 }}>
      <Animated.View style={labelStyle}>
        <Text className="text-white/40 text-[10px] tracking-[0.25em] uppercase" style={{ marginBottom: 4 }}>
          Daily Check-In
        </Text>
      </Animated.View>
      {CHECK_IN_QUESTIONS.map((q, i) => (
        <CheckInCardItem
          key={q.label}
          label={q.label}
          icon={q.icon}
          delay={160 + i * 100}
          active={active}
        />
      ))}
    </View>
  );
}

// ─── Slide 3 Hero — Brand ─────────────────────────────────────────────────────

function BrandHero({ active }: { active: boolean }) {
  const scale        = useSharedValue(0.7);
  const opacity      = useSharedValue(0);
  const accentOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value         = withDelay(200, withSpring(1, { damping: 12, stiffness: 180 }));
      opacity.value       = withDelay(200, withTiming(1, { duration: 500 }));
      accentOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    } else {
      scale.value         = 0.7;
      opacity.value       = 0;
      accentOpacity.value = 0;
    }
  }, [active]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }));

  const accentStyle = useAnimatedStyle(() => ({
    opacity: accentOpacity.value,
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Diagonal geometric accent (structural wireframe element) */}
      <Animated.View style={[accentStyle, { position: 'absolute', bottom: -20, right: -20, width: '70%', height: '70%', backgroundColor: 'rgba(255,255,255,0.05)', transform: [{ rotate: '28deg' }], borderRadius: 24 }]} />
      <Animated.View style={[accentStyle, { position: 'absolute', bottom: 0,   right: 0,   width: '45%', height: '45%', backgroundColor: 'rgba(255,255,255,0.04)', transform: [{ rotate: '28deg' }], borderRadius: 20 }]} />

      {/* Concentric teal rings */}
      <View style={{ position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(22,160,133,0.15)' }} />
      <View style={{ position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 1, borderColor: 'rgba(22,160,133,0.22)' }} />
      <View style={{ position: 'absolute', width: 148, height: 148, borderRadius: 74,  borderWidth: 1, borderColor: 'rgba(22,160,133,0.32)' }} />

      <Animated.View style={[logoStyle, { alignItems: 'center', gap: 8 }]}>
        <Image
          source={require('@/assets/images/SEEGLA-LOGO-VARIATIONICON.png')}
          style={{ width: 96, height: 96 }}
          resizeMode="contain"
          tintColor="#FFFFFF"
        />
        <Text className="text-white/40 text-xs tracking-[0.3em] uppercase">www.seegla.ph</Text>
      </Animated.View>
    </View>
  );
}

// ─── Slide text content ───────────────────────────────────────────────────────

function SlideContent({ headline, body, active }: { headline: string; body: string; active: boolean }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    if (active) {
      opacity.value    = withDelay(200, withTiming(1, { duration: 400 }));
      translateY.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 200 }));
    } else {
      opacity.value    = withTiming(0, { duration: 180 });
      translateY.value = 18;
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, { flex: 1, paddingHorizontal: 28, paddingTop: 20, gap: 12 }]}>
      <Text className="text-white text-3xl font-extrabold leading-tight">{headline}</Text>
      <Text className="text-white/70 text-sm leading-relaxed">{body}</Text>
    </Animated.View>
  );
}

// ─── Slide CTA ────────────────────────────────────────────────────────────────

function SlideFooter({ cta, active, onPress }: { cta: string; active: boolean; onPress: () => void }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (active) {
      opacity.value    = withDelay(350, withTiming(1, { duration: 400 }));
      translateY.value = withDelay(350, withSpring(0, { damping: 14, stiffness: 200 }));
    } else {
      opacity.value    = withTiming(0, { duration: 180 });
      translateY.value = 16;
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, { paddingHorizontal: 28, paddingBottom: 48 }]}>
      <Button size="lg" className="rounded-full" onPress={onPress}>
        <Text>{cta}</Text>
      </Button>
    </Animated.View>
  );
}

// ─── Hero registry ────────────────────────────────────────────────────────────

const HERO_COMPONENTS = [WelcomeHero, CheckInHero, BrandHero] as const;

// ─── Single slide ─────────────────────────────────────────────────────────────

function SlideView({
  slide,
  index,
  active,
  onNext,
}: {
  slide: typeof SLIDES[number];
  index: number;
  active: boolean;
  onNext: () => void;
}) {
  const HeroComponent = HERO_COMPONENTS[index];

  return (
    <View style={{ width: W, flex: 1, backgroundColor: '#0A2E5C' }}>
      {/* Reserve space for fixed pagination + skip overlay */}
      <View style={{ height: 80 }} />

      {/* Hero visual — upper ~50% of remaining space */}
      <View style={{ height: H * 0.50 }}>
        <HeroComponent active={active} />
      </View>

      {/* Text */}
      <SlideContent headline={slide.headline} body={slide.body} active={active} />

      {/* CTA */}
      <SlideFooter cta={slide.cta} active={active} onPress={onNext} />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const panX      = useSharedValue(0);
  const snapIndex = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      panX.value = -snapIndex.value * W + e.translationX;
    })
    .onEnd((e) => {
      let next = snapIndex.value;
      if (e.translationX < -W * 0.25 && snapIndex.value < SLIDES.length - 1) {
        next = snapIndex.value + 1;
      } else if (e.translationX > W * 0.25 && snapIndex.value > 0) {
        next = snapIndex.value - 1;
      }
      snapIndex.value = next;
      panX.value = withSpring(-next * W, { damping: 22, stiffness: 200, mass: 0.8 });
      runOnJS(setActiveIndex)(next);
    });

  const slidesStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.value }],
  }));

  function handleSkip() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/login');
  }

  function handleNext() {
    const next = activeIndex + 1;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (next < SLIDES.length) {
      panX.value      = withSpring(-next * W, { damping: 22, stiffness: 200, mass: 0.8 });
      snapIndex.value = next;
      setActiveIndex(next);
    } else {
      router.replace('/login');
    }
  }

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A2E5C', overflow: 'hidden' }}>
      <StatusBar style="light" translucent />

      {/* ── Fixed pagination + skip overlay (above slides) ── */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400).springify()}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 10, paddingTop: 54, paddingHorizontal: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Pagination dots */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {SLIDES.map((_, i) => <AnimatedDot key={i} index={i} panX={panX} />)}
          </View>

          {/* SKIP — hidden on last slide */}
          {!isLastSlide && (
            <Pressable
              onPress={handleSkip}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text className="text-white/50 text-xs tracking-[0.2em] uppercase">SKIP</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* ── Horizontal pager ── */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            { flexDirection: 'row', flex: 1, width: W * SLIDES.length },
            slidesStyle,
          ]}
        >
          {SLIDES.map((slide, i) => (
            <SlideView
              key={slide.id}
              slide={slide}
              index={i}
              active={activeIndex === i}
              onNext={handleNext}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
