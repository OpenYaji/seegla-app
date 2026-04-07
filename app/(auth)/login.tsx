import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, QrCode, ChevronLeft, CheckCircle2, User, Activity, Lock } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import { setAuthenticated } from '@/src/features/auth/hooks/use-auth-gate';
import { supabase } from '@/src/app-config/supabase';

// ─── Static data ──────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Marketing', 'Engineering', 'Sales', 'HR',
  'Finance', 'Operations', 'Legal', 'Admin',
];

const WELLNESS_INTERESTS = [
  { id: 'walking',    label: 'Walking',    emoji: '🚶' },
  { id: 'running',    label: 'Running',    emoji: '🏃' },
  { id: 'yoga',       label: 'Yoga',       emoji: '🧘' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘‍♀️' },
  { id: 'cycling',    label: 'Cycling',    emoji: '🚴' },
  { id: 'swimming',   label: 'Swimming',   emoji: '🏊' },
] as const;

const AVATAR_COLORS = [
  'bg-seegla-teal',
  'bg-seegla-navy',
  'bg-seegla-purple',
  'bg-seegla-green',
  'bg-seegla-orange',
] as const;

type Step = 'login' | 'success' | 'profile' | 'health';

// ─── Root screen ──────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [step, setStep]       = useState<Step>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [finishingLogin, setFinishingLogin] = useState(false);

  // Profile fields
  const [name, setName]                   = useState('');
  const [department, setDepartment]       = useState('');
  const [avatarIdx, setAvatarIdx]         = useState(0);
  const [interests, setInterests]         = useState<string[]>([]);

  const isValidEmail  = email.includes('@') && email.includes('.');
  const canAttemptLogin = isValidEmail && password.length >= 6;
  const canSaveProfile = name.trim().length > 0 && department.length > 0;

  // Auto-fill name hint from email
  function extractNameFromEmail(e: string) {
    const local = e.split('@')[0].replace(/[._]/g, ' ');
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  function toggleInterest(id: string) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleVerify() {
    if (!canAttemptLogin) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setLoading(false);
      Alert.alert('Login failed', 'Email or password is incorrect.');
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const profileRes = await supabase
        .from('profiles')
        .select('onboarding_completed, full_name')
        .eq('id', userId)
        .maybeSingle();

      const alreadyOnboarded = Boolean(profileRes.data?.onboarding_completed);
      if (alreadyOnboarded) {
        await setAuthenticated(true);
        setLoading(false);
        Alert.alert('Welcome back', 'Signed in successfully.');
        router.replace('/(tabs)');
        return;
      }

      if (profileRes.data?.full_name) {
        setName(profileRes.data.full_name);
      } else {
        setName(extractNameFromEmail(email));
      }
    } else {
      setName(extractNameFromEmail(email));
    }

    setLoading(false);
    setStep('success');
  }

  async function completeLogin() {
    if (finishingLogin) return;
    setFinishingLogin(true);
    try {
      await setAuthenticated(true);
      router.replace('/(tabs)');
    } finally {
      setFinishingLogin(false);
    }
  }

  async function askStepPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const sdk = typeof Platform.Version === 'number' ? Platform.Version : 0;
        if (sdk >= 29) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
            {
              title: 'Allow step tracking',
              message: 'SEEGLA needs activity permission to read your steps and award points.',
              buttonPositive: 'Allow',
              buttonNegative: 'Not now',
            },
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Step Tracking Permission',
        'Allow SEEGLA to access your activity data to record steps?',
        [
          { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Allow', onPress: () => resolve(true) },
        ],
      );
    });
  }

  async function handleConnectHealth() {
    const granted = await askStepPermission();
    if (!granted) {
      Alert.alert('Permission required', 'You can continue with "Skip for now" and enable step tracking later.');
      return;
    }
    await completeLogin();
  }

  // ── STEP: Login ──────────────────────────────────────────────────────────────

  if (step === 'login') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Back */}
          <View className="px-5 pt-2">
            <View className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center">
              <ChevronLeft size={20} color={COLORS.navy} onPress={() => router.replace('/(auth)/onboarding')} />
            </View>
          </View>

          {/* Logo */}
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mt-6 mb-8">
            <Image
              source={require('@/assets/images/SEEGLA-LOGO-VARIATIONPRIMARY.png')}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.duration(600).delay(100)} className="flex-1 px-6 gap-5">
            <View>
              <Text className="text-foreground text-2xl font-bold">Welcome.</Text>
              <Text variant="muted" className="mt-1">Enter your company email to verify access.</Text>
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
              <Text variant="muted" className="text-xs">
                Use the email registered with your company's Seegla account.
              </Text>
            </View>

            {/* Password input */}
            <View className="gap-2">
              <Text className="text-foreground text-sm font-medium">Password</Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 gap-3">
                <Lock size={18} color={COLORS.teal} />
                <TextInput
                  className="flex-1 py-4 text-sm text-foreground"
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Continue */}
            <Button
              size="lg"
              className="rounded-full"
              disabled={!canAttemptLogin || loading}
              onPress={handleVerify}
            >
              <Text>{loading ? 'Signing in...' : 'Sign in'}</Text>
            </Button>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-border" />
              <Text variant="muted" className="text-xs">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* QR option */}
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              disabled={!canAttemptLogin || loading}
              onPress={handleVerify}
            >
              <QrCode size={18} color={COLORS.navy} />
              <Text>Join via QR Code</Text>
            </Button>

            <Text variant="muted" className="text-center text-xs px-4">
              By continuing, you agree to your company's wellness program terms.
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── STEP: Success Popup ───────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Animated.View entering={FadeIn.duration(500)} className="items-center gap-5 w-full">

          {/* Pulsing check rings */}
          <View className="w-32 h-32 rounded-full bg-seegla-green/8 items-center justify-center">
            <View className="w-24 h-24 rounded-full bg-seegla-green/15 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-seegla-green/20 items-center justify-center">
                <CheckCircle2 size={40} color={COLORS.green} />
              </View>
            </View>
          </View>

          <View className="items-center gap-2">
            <Text className="text-foreground text-2xl font-bold text-center">
              Company Verified!
            </Text>
            <Text variant="muted" className="text-center text-sm leading-relaxed">
              Your company email has been recognised.{'\n'}Let's set up your Seegla profile.
            </Text>
          </View>

          {/* Verified email badge */}
          <View className="bg-seegla-green/10 rounded-full px-4 py-1.5">
            <Text className="text-seegla-green text-xs font-semibold">✓ {email}</Text>
          </View>

          <Button
            size="lg"
            className="rounded-full w-full mt-2"
            onPress={() => setStep('profile')}
          >
            <Text>Set Up My Profile</Text>
          </Button>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── STEP: Profile Setup ───────────────────────────────────────────────────────

  if (step === 'profile') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInUp.duration(400)} className="px-6 pt-5 pb-10 gap-7">

            {/* Header */}
            <View className="gap-1">
              <Text variant="muted" className="text-xs uppercase tracking-widest">Step 3 of 4</Text>
              <Text className="text-foreground text-2xl font-bold">Your Profile</Text>
              <Text variant="muted" className="text-sm">
                Quick setup — done in under 20 seconds.
              </Text>
            </View>

            {/* Avatar preview + colour picker */}
            <View className="items-center gap-3">
              <View
                className={`w-20 h-20 rounded-full ${AVATAR_COLORS[avatarIdx]} items-center justify-center`}
              >
                {initials ? (
                  <Text className="text-white text-2xl font-bold">{initials}</Text>
                ) : (
                  <User size={28} color="#fff" />
                )}
              </View>
              <Text variant="muted" className="text-xs">Pick an avatar colour (optional)</Text>
              <View className="flex-row gap-3">
                {AVATAR_COLORS.map((c, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setAvatarIdx(i)}
                    className={`w-8 h-8 rounded-full ${c} ${
                      avatarIdx === i ? 'border-[3px] border-foreground' : ''
                    }`}
                  />
                ))}
              </View>
            </View>

            {/* Full name */}
            <View className="gap-2">
              <Text className="text-foreground text-sm font-medium">
                Full Name <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 gap-3">
                <User size={16} color={COLORS.teal} />
                <TextInput
                  className="flex-1 py-4 text-sm text-foreground"
                  placeholder="e.g. Jenzele Cruz"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Department chips */}
            <View className="gap-2">
              <Text className="text-foreground text-sm font-medium">
                Department <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DEPARTMENTS.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDepartment(d)}
                    className={`px-4 py-2 rounded-full border ${
                      department === d
                        ? 'bg-primary border-primary'
                        : 'bg-card border-border'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        department === d ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {d}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Wellness interests */}
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-foreground text-sm font-medium">Wellness Interests</Text>
                <Text variant="muted" className="text-xs">(optional)</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {WELLNESS_INTERESTS.map((w) => {
                  const active = interests.includes(w.id);
                  return (
                    <Pressable
                      key={w.id}
                      onPress={() => toggleInterest(w.id)}
                      className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
                        active ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <Text className="text-base">{w.emoji}</Text>
                      <Text
                        className={`text-sm font-medium ${
                          active ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {w.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Continue */}
            <Button
              size="lg"
              className="rounded-full"
              disabled={!canSaveProfile}
              onPress={() => setStep('health')}
            >
              <Text>Continue</Text>
            </Button>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── STEP: Connect Health Data ─────────────────────────────────────────────────

  const healthPlatforms = [
    ...(Platform.OS === 'ios'
      ? [{ id: 'apple',  label: 'Apple Health', emoji: '🍎', colorClass: 'bg-[#1C1C1E]' }]
      : [{ id: 'google', label: 'Google Fit',   emoji: '🏃', colorClass: 'bg-seegla-teal' }]),
    { id: 'fitbit', label: 'Fitbit', emoji: '⌚', colorClass: 'bg-seegla-purple' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Animated.View entering={FadeInUp.duration(400)} className="flex-1 px-6 pt-5 gap-6">

        {/* Header */}
        <View className="gap-1">
          <Text variant="muted" className="text-xs uppercase tracking-widest">Step 4 of 4</Text>
          <Text className="text-foreground text-2xl font-bold">Connect Health Data</Text>
          <Text variant="muted" className="text-sm leading-relaxed">
            Connect your health data so Seegla can track your steps automatically.
          </Text>
        </View>

        {/* Graphic */}
        <View className="items-center py-4">
          <View className="w-28 h-28 rounded-full bg-seegla-green/10 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-seegla-green/15 items-center justify-center">
              <Activity size={40} color={COLORS.green} />
            </View>
          </View>
        </View>

        {/* Platform cards */}
        <View className="gap-3">
          {healthPlatforms.map((p) => (
            <Pressable
              key={p.id}
              className="flex-row items-center justify-between bg-card border border-border rounded-2xl px-5 py-4"
              onPress={handleConnectHealth}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-11 h-11 rounded-full ${p.colorClass} items-center justify-center`}>
                  <Text className="text-xl">{p.emoji}</Text>
                </View>
                <View className="gap-0.5">
                  <Text className="text-foreground text-sm font-semibold">{p.label}</Text>
                  <Text variant="muted" className="text-xs">Tap to connect</Text>
                </View>
              </View>
              <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                <Text className="text-primary text-xs font-semibold">Connect Now</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Why connect note */}
        <View className="bg-seegla-teal/5 border border-seegla-teal/20 rounded-2xl px-4 py-3 gap-1">
          <Text className="text-foreground text-sm font-semibold">Why connect?</Text>
          <Text variant="muted" className="text-xs leading-relaxed">
            Automatic step tracking means you never miss out on points. No manual logging needed.
          </Text>
        </View>

        <View className="flex-1" />

        {/* Skip */}
        <Pressable
          className="items-center py-4 mb-2"
          onPress={completeLogin}
        >
          <Text variant="muted" className="text-sm">
            {finishingLogin ? 'Signing in...' : 'Skip for now'}
          </Text>
        </Pressable>

      </Animated.View>
    </SafeAreaView>
  );
}
