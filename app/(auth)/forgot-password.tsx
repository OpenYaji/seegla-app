import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Mail, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import { useToast } from '@/components/ui/toast';
import { supabase } from '@/src/app-config/supabase';

type Step = 'form' | 'sent';

export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const isRequesting = useRef(false);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isValidEmail = email.includes('@') && email.includes('.');

  function startCooldown(seconds: number) {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    setCooldown(seconds);
    cooldownTimer.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current!);
          cooldownTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  async function handleSend() {
    if (!isValidEmail || isRequesting.current || cooldown > 0) return;
    isRequesting.current = true;
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'seegla://reset-password' },
    );

    setLoading(false);
    isRequesting.current = false;

    if (error) {
      toast.error('Request failed', 'Could not send reset email. Please try again.');
      startCooldown(30);
      return;
    }

    setStep('sent');
  }

  // ── STEP: Form ───────────────────────────────────────────────────────────────

  if (step === 'form') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Back */}
          <View className="px-5 pt-2">
            <View className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center">
              <ChevronLeft
                size={20}
                color={COLORS.navy}
                onPress={() => router.back()}
              />
            </View>
          </View>

          <Animated.View
            entering={FadeInUp.duration(500)}
            className="flex-1 px-6 pt-8 gap-6"
          >
            {/* Header */}
            <View className="gap-2">
              <Text className="text-foreground text-2xl font-bold">Forgot Password?</Text>
              <Text variant="muted" className="text-sm leading-relaxed">
                Enter the email linked to your account and we'll send you a reset link.
              </Text>
            </View>

            {/* Email input */}
            <View className="gap-2">
              <Text className="text-foreground text-sm font-medium">Company Email</Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 gap-3">
                <Mail size={18} color={COLORS.teal} />
                <TextInput
                  className="flex-1 py-4 text-sm text-foreground"
                  placeholder="yourname@company.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Send button */}
            <Button
              size="lg"
              className="rounded-full"
              disabled={!isValidEmail || loading || cooldown > 0}
              onPress={handleSend}
            >
              <Text>
                {loading
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Send Reset Link'}
              </Text>
            </Button>

            {/* Back to login */}
            <View className="flex-row justify-center">
              <Text variant="muted" className="text-sm">Remember your password? </Text>
              <Text
                className="text-primary text-sm font-medium"
                onPress={() => router.back()}
              >
                Sign in
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── STEP: Email Sent ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
      <Animated.View entering={FadeIn.duration(500)} className="items-center gap-5 w-full">

        {/* Icon rings */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="w-32 h-32 rounded-full bg-seegla-teal/8 items-center justify-center">
            <View className="w-24 h-24 rounded-full bg-seegla-teal/15 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-seegla-teal/20 items-center justify-center">
                <CheckCircle2 size={40} color={COLORS.teal} />
              </View>
            </View>
          </View>
        </Animated.View>

        <View className="items-center gap-2">
          <Text className="text-foreground text-2xl font-bold text-center">
            Check your inbox
          </Text>
          <Text variant="muted" className="text-center text-sm leading-relaxed">
            We've sent a password reset link to
          </Text>
          <View className="bg-seegla-teal/10 rounded-full px-4 py-1.5">
            <Text className="text-seegla-teal text-xs font-semibold">{email}</Text>
          </View>
          <Text variant="muted" className="text-center text-xs leading-relaxed px-4 mt-1">
            If it doesn't arrive within a few minutes, check your spam folder.
          </Text>
        </View>

        {/* Resend */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-full"
          disabled={cooldown > 0}
          onPress={() => {
            setStep('form');
            startCooldown(60);
          }}
        >
          <Text>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}</Text>
        </Button>

        {/* Back to login */}
        <Button
          size="lg"
          className="rounded-full w-full"
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text>Back to Sign In</Text>
        </Button>

      </Animated.View>
    </SafeAreaView>
  );
}
