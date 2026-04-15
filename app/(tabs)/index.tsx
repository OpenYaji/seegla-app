import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Dimensions, Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Bell, CheckCircle2, Flame, HelpCircle, LogOut, Settings, Shield, User, X } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AnimatedBar, SegmentedBar } from '@/components/ui/animated-progress';
import { COLORS } from '@/lib/constants';
import {
  getHomeDashboard,
  syncPedometerSteps,
  setStepTrackingPaused,
  submitDailyCheckin,
  type HomeDashboardDto,
} from '@/src/features/home/api/home.api';
import { setAuthenticated } from '@/src/features/auth/hooks/use-auth-gate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.8;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type DashboardState = HomeDashboardDto['currentUser'] & {
  stepTrackingPaused: boolean;
  checkIn: HomeDashboardDto['checkIn'];
  dailyProgress: HomeDashboardDto['dailyProgress'];
  wellnessScore: HomeDashboardDto['wellnessScore'];
  weeklyActivity: HomeDashboardDto['weeklyActivity'];
  activityFeed: HomeDashboardDto['activityFeed'];
};

function getLevel(pts: number): { label: string; emoji: string } {
  if (pts >= 2000) return { label: 'Platinum', emoji: '💎' };
  if (pts >= 1000) return { label: 'Gold', emoji: '🥇' };
  if (pts >= 500) return { label: 'Silver', emoji: '🥈' };
  return { label: 'Bronze', emoji: '🥉' };
}

const ARC_CX = 100;
const ARC_CY = 110;
const ARC_R = 82;
const ARC_CIRC = 2 * Math.PI * ARC_R;
const ARC_DEG = 240;
const ARC_LEN = (ARC_CIRC * ARC_DEG) / 360;
const ARC_ROT = 150;

function WellnessArc({ score, maxScore, label }: { score: number; maxScore: number; label: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      350,
      withTiming(score / Math.max(1, maxScore), { duration: 1300, easing: Easing.out(Easing.cubic) }),
    );
  }, [score, maxScore]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: ARC_LEN * (1 - progress.value),
  }));

  return (
    <View className="w-[200px] h-[155px] self-center">
      <Svg width={200} height={155} viewBox="0 0 200 175">
        <Circle
          cx={ARC_CX}
          cy={ARC_CY}
          r={ARC_R}
          stroke="#E2E8F0"
          strokeWidth={11}
          fill="none"
          strokeDasharray={`${ARC_LEN} ${ARC_CIRC - ARC_LEN}`}
          transform={`rotate(${ARC_ROT}, ${ARC_CX}, ${ARC_CY})`}
          strokeLinecap="round"
        />
        <AnimatedCircle
          cx={ARC_CX}
          cy={ARC_CY}
          r={ARC_R}
          stroke={COLORS.teal}
          strokeWidth={11}
          fill="none"
          strokeDasharray={`${ARC_LEN} ${ARC_CIRC}`}
          animatedProps={arcProps}
          transform={`rotate(${ARC_ROT}, ${ARC_CX}, ${ARC_CY})`}
          strokeLinecap="round"
        />
      </Svg>
      <View className="absolute inset-0 items-center pt-14">
        <Text className="text-foreground text-4xl font-bold">{score.toFixed(1)}</Text>
        <Text variant="muted" className="text-xs -mt-1">/ {maxScore}</Text>
        <Text className="text-seegla-green text-xs font-semibold mt-1">{label}</Text>
      </View>
    </View>
  );
}

const SIDEBAR_LINKS = [
  { icon: User, label: 'View Profile' },
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help & Support' },
  { icon: Shield, label: 'Privacy' },
] as const;

function Sidebar({
  visible,
  onClose,
  user,
  onLogout,
}: {
  visible: boolean;
  onClose: () => void;
  user: DashboardState;
  onLogout: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const translateX = useSharedValue(SIDEBAR_WIDTH);
  const backdropAlpha = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value = withSpring(0, { damping: 20, stiffness: 230, mass: 1.1 });
      backdropAlpha.value = withTiming(1, { duration: 260 });
    } else if (mounted) {
      translateX.value = withSpring(SIDEBAR_WIDTH, { damping: 24, stiffness: 320, mass: 1.0 }, () => {
        runOnJS(setMounted)(false);
      });
      backdropAlpha.value = withTiming(0, { duration: 220 });
    }
  }, [visible, mounted]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropAlpha.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: SIDEBAR_WIDTH,
  }));

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <Animated.View style={[backdropStyle, { flex: 1 }]} className="bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View style={panelStyle} className="absolute top-0 bottom-0 right-0 bg-seegla-navy">
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-end px-5 pt-4 pb-2">
              <Pressable className="w-9 h-9 rounded-full bg-white/10 items-center justify-center" onPress={onClose}>
                <X size={18} color="#fff" />
              </Pressable>
            </View>

            <View className="px-6 pb-6 border-b border-white/10">
              <View className={`w-16 h-16 rounded-full ${user.avatarColor} items-center justify-center mb-3`}>
                <Text className="text-white text-xl font-bold">{user.initials}</Text>
              </View>
              <Text className="text-white text-lg font-bold">{user.name}</Text>
              <Text className="text-white/60 text-sm">{user.role}</Text>
              <Text className="text-white/40 text-xs mt-0.5">{user.company}</Text>
            </View>

            <View className="flex-1 py-4">
              {SIDEBAR_LINKS.map(({ icon: Icon, label }) => (
                <Pressable key={label} className="flex-row items-center gap-4 px-6 py-4" onPress={onClose}>
                  <Icon size={20} color="rgba(255,255,255,0.70)" />
                  <Text className="text-white text-base font-medium">{label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable className="flex-row items-center gap-4 px-6 py-5 border-t border-white/10" onPress={onLogout}>
              <LogOut size={20} color={COLORS.orange} />
              <Text className="text-seegla-orange text-base font-medium">Log Out</Text>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const RATING_OPTIONS = [
  ['😞', '😕', '😐', '🙂', '😄'],
  ['💤', '😴', '⚡', '🔋', '🚀'],
  ['😩', '😟', '😐', '😌', '🌟'],
] as const;

const RATING_LABELS = [
  ['Terrible', 'Bad', 'Okay', 'Good', 'Great'],
  ['Drained', 'Low', 'Moderate', 'Good', 'High'],
  ['Awful', 'Poor', 'Fair', 'Good', 'Amazing'],
] as const;

function CheckInModal({
  visible,
  checkIn,
  onComplete,
  onClose,
}: {
  visible: boolean;
  checkIn: HomeDashboardDto['checkIn'];
  onComplete: (answers: number[]) => Promise<void>;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (selected === null || saving) return;
    const nextAnswers = [...answers];
    nextAnswers[step] = selected + 1;
    setAnswers(nextAnswers);

    if (step < checkIn.questions.length - 1) {
      setStep(step + 1);
      setSelected(null);
      return;
    }

    setSaving(true);
    await onComplete(nextAnswers);
    setSaving(false);
    setDone(true);
    setTimeout(() => {
      setStep(0);
      setSelected(null);
      setAnswers([]);
      setDone(false);
      onClose();
    }, 1600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={done ? undefined : onClose}>
        <Pressable onPress={() => {}}>
          <View className="bg-background rounded-t-3xl px-6 pt-5 pb-10">
            <View className="w-10 h-1 rounded-full bg-border self-center mb-5" />
            {done ? (
              <View className="items-center py-8 gap-4">
                <CheckCircle2 size={56} color={COLORS.green} />
                <Text className="text-foreground text-xl font-bold text-center">Check-in Complete!</Text>
                <View className="bg-seegla-green/15 px-4 py-2 rounded-full">
                  <Text className="text-seegla-green font-semibold">+{checkIn.pointsReward} pts earned</Text>
                </View>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-center gap-2 mb-6">
                  {checkIn.questions.map((_, i) => (
                    <View
                      key={i}
                      className={i === step ? 'w-6 h-2 rounded-full bg-primary' : i < step ? 'w-2 h-2 rounded-full bg-primary/40' : 'w-2 h-2 rounded-full bg-border'}
                    />
                  ))}
                </View>
                <Text variant="muted" className="text-xs uppercase tracking-widest text-center mb-2">
                  Question {step + 1} of {checkIn.questions.length}
                </Text>
                <Text className="text-foreground text-xl font-bold text-center mb-7">
                  {checkIn.questions[step]}
                </Text>
                <View className="flex-row justify-between mb-3">
                  {RATING_OPTIONS[step].map((emoji, i) => (
                    <Pressable
                      key={i}
                      onPress={() => setSelected(i)}
                      className={`items-center gap-1.5 px-2 py-3 rounded-xl flex-1 mx-1 ${selected === i ? 'bg-primary/10 border border-primary' : 'bg-card border border-border'}`}
                    >
                      <Text className="text-2xl">{emoji}</Text>
                      <Text className={`text-[10px] text-center ${selected === i ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        {RATING_LABELS[step][i]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Button className="rounded-lg mt-4" disabled={selected === null || saving} onPress={handleNext}>
                  <Text>{step === checkIn.questions.length - 1 ? 'Submit Check-in' : 'Next'}</Text>
                </Button>
                <Pressable className="items-center mt-3 py-2" onPress={onClose}>
                  <Text variant="muted" className="text-sm">Skip for now</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<HomeDashboardDto | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [waterLogged, setWaterLogged] = useState(0);
  const [liveStepCount, setLiveStepCount] = useState<number | null>(null);
  const [stepTrackingLoading, setStepTrackingLoading] = useState(false);
  const lastSyncedStepsRef = useRef<number | null>(null);
  const lastSyncedAtMsRef = useRef<number | null>(null);
  const syncInFlightRef = useRef(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getHomeDashboard();
      setDashboard(res.data);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const fallback: DashboardState = {
    id: 'na',
    companyId: 'na',
    name: 'Member',
    firstName: 'Member',
    role: 'Member',
    department: 'General',
    company: 'Company',
    points: 0,
    streak: 0,
    rank: 0,
    initials: 'ME',
    avatarColor: 'bg-seegla-teal',
    checkIn: {
      completed: false,
      pointsReward: 10,
      questions: ['How is your mood today?', 'How is your energy level?', 'How well did you sleep?'],
    },
    dailyProgress: {
      steps: { current: 0, goal: 8000, unit: 'steps', label: 'Steps' },
      water: { current: 0, goal: 8, unit: 'glasses', label: 'Water' },
      calories: { current: 0, goal: 2200, unit: 'kcal', label: 'Calories' },
    },
    stepTrackingPaused: false,
    wellnessScore: { score: 0, maxScore: 10, label: 'Good', change: 0 },
    weeklyActivity: [],
    activityFeed: [],
  };

  const userData: DashboardState = dashboard
    ? {
        ...dashboard.currentUser,
        stepTrackingPaused: dashboard.stepTrackingPaused,
        checkIn: dashboard.checkIn,
        dailyProgress: dashboard.dailyProgress,
        wellnessScore: dashboard.wellnessScore,
        weeklyActivity: dashboard.weeklyActivity,
        activityFeed: dashboard.activityFeed,
      }
    : fallback;

  const checkedIn = userData.checkIn.completed;
  const level = getLevel(userData.points);
  const displayedSteps = Math.max(userData.dailyProgress.steps.current, liveStepCount ?? 0);
  const stepsPercent = Math.round((displayedSteps / Math.max(1, userData.dailyProgress.steps.goal)) * 100);
  const weeklyCheckins = userData.weeklyActivity.filter((d) => d.checkedIn).length;
  const monthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, []);

  const handleCompleteCheckin = async (answers: number[]) => {
    const res = await submitDailyCheckin({
      moodScore: answers[0] ?? 3,
      energyScore: answers[1] ?? 3,
      stressScore: answers[2] ?? 3,
    });
    if (!res.error) await loadDashboard();
  };

  const handleLogout = async () => {
    await setAuthenticated(false);
    setSidebarOpen(false);
    router.replace('/login');
  };

  const readTodayPedometerSteps = async (): Promise<{ steps: number | null; reason?: 'MISSING_MODULE' | 'UNAVAILABLE' | 'PERMISSION_DENIED' }> => {
    try {
      const Sensors = require('expo-sensors');
      const Pedometer = Sensors?.Pedometer;
      if (!Pedometer) return { steps: null, reason: 'MISSING_MODULE' };

      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) return { steps: null, reason: 'UNAVAILABLE' };

      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission?.granted) return { steps: null, reason: 'PERMISSION_DENIED' };

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      const result = await Pedometer.getStepCountAsync(start, end);
      return { steps: Math.max(0, Math.round(result?.steps ?? 0)) };
    } catch {
      return { steps: null, reason: 'MISSING_MODULE' };
    }
  };

  const syncPedometerTotal = async (totalStepsToday: number, nowMs: number, minStepDelta: number) => {
    if (syncInFlightRef.current) return;
    const roundedTotal = Math.max(0, Math.round(totalStepsToday));
    const lastTotal = lastSyncedStepsRef.current;
    const lastAt = lastSyncedAtMsRef.current;

    if (lastTotal !== null) {
      const deltaSteps = roundedTotal - lastTotal;
      if (deltaSteps < minStepDelta) return;
      if (deltaSteps <= 0) return;

      if (lastAt !== null) {
        const elapsedMinutes = Math.max((nowMs - lastAt) / 60000, 1 / 60);
        const cadence = deltaSteps / elapsedMinutes;
        // Human cadence rarely sustains over ~220 steps/min. Above this is usually non-walking vibration.
        if (cadence > 220) return;
      }
    }

    syncInFlightRef.current = true;
    let res: Awaited<ReturnType<typeof syncPedometerSteps>>;
    try {
      res = await syncPedometerSteps(roundedTotal);
    } finally {
      syncInFlightRef.current = false;
    }

    if (res.error === 'TRACKING_PAUSED') return;
    if (res.error) return;

    lastSyncedStepsRef.current = roundedTotal;
    lastSyncedAtMsRef.current = nowMs;
    setLiveStepCount(roundedTotal);
    void loadDashboard();
  };

  const startOfToday = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  };

  useEffect(() => {
    if (!dashboard || userData.stepTrackingPaused) return;

    let stopped = false;
    let subscription: { remove: () => void } | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let appStateSub: { remove: () => void } | null = null;
    let baseline = 0;

    const syncSnapshot = async (minStepDelta: number) => {
      const pedometerResult = await readTodayPedometerSteps();
      if (stopped || pedometerResult.steps === null) return;
      baseline = pedometerResult.steps;
      setLiveStepCount(baseline);
      await syncPedometerTotal(baseline, Date.now(), minStepDelta);
    };

    const run = async () => {
      const Sensors = require('expo-sensors');
      const Pedometer = Sensors?.Pedometer;
      if (!Pedometer) return;

      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) return;

      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission?.granted) return;

      const initial = await Pedometer.getStepCountAsync(startOfToday(), new Date());
      if (stopped) return;
      baseline = Math.max(0, Math.round(initial?.steps ?? 0));
      setLiveStepCount(baseline);
      await syncPedometerTotal(baseline, Date.now(), 1);

      subscription = Pedometer.watchStepCount((event: { steps?: number }) => {
        const eventSteps = Math.max(0, Math.round(event?.steps ?? 0));
        const total = baseline + eventSteps;
        setLiveStepCount(total);
        void syncPedometerTotal(total, Date.now(), 15);
      });

      appStateSub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          void syncSnapshot(1);
        }
      });

      timer = setInterval(() => {
        void syncSnapshot(10);
      }, 120000);
    };

    void run();

    return () => {
      stopped = true;
      subscription?.remove();
      appStateSub?.remove();
      if (timer) clearInterval(timer);
    };
  }, [dashboard?.currentUser.id, userData.stepTrackingPaused]);

  const handleToggleStepTracking = async () => {
    if (stepTrackingLoading) return;
    setStepTrackingLoading(true);
    await setStepTrackingPaused(!userData.stepTrackingPaused);
    setStepTrackingLoading(false);
    if (userData.stepTrackingPaused) {
      lastSyncedStepsRef.current = null;
      lastSyncedAtMsRef.current = null;
    } else {
      syncInFlightRef.current = false;
    }
    await loadDashboard();
  };

  useEffect(() => {
    if (!userData.stepTrackingPaused) {
      return;
    }
    lastSyncedStepsRef.current = null;
    lastSyncedAtMsRef.current = null;
    syncInFlightRef.current = false;
  }, [userData.stepTrackingPaused]);

  useEffect(() => {
    if (!dashboard) {
      return;
    }
    lastSyncedStepsRef.current = userData.dailyProgress.steps.current;
    lastSyncedAtMsRef.current = Date.now();
    setLiveStepCount((prev) => Math.max(prev ?? 0, userData.dailyProgress.steps.current));
  }, [dashboard, userData.dailyProgress.steps.current]);

  useEffect(() => {
    setWaterLogged(userData.dailyProgress.water.current);
  }, [userData.dailyProgress.water.current]);

  return (
    <SafeAreaView className="flex-1 bg-seegla-navy" edges={['top']}>
      <StatusBar style="light" />

      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        <View className="bg-seegla-navy px-5 pt-3 pb-16">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/60 text-xs uppercase tracking-widest">Good morning</Text>
              <Text className="text-white text-2xl font-bold mt-0.5">{userData.firstName} 👋</Text>
            </View>

            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => router.push('/modal')} className="relative">
                <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center">
                  <Bell size={18} color="rgba(255,255,255,0.85)" />
                </View>
                <View className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-seegla-orange border-2 border-seegla-navy" />
              </Pressable>

              <Pressable onPress={() => setSidebarOpen(true)}>
                <View className={`w-10 h-10 rounded-full ${userData.avatarColor} items-center justify-center border-2 border-white/30`}>
                  <Text className="text-white text-sm font-bold">{userData.initials}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        <View
          className="mx-5 -mt-10 bg-white rounded-2xl px-5 py-5"
          style={{
            shadowColor: '#0A2E5C',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 20,
            elevation: 16,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-foreground/50 text-xs uppercase tracking-widest">Your Points</Text>
              <Text className="text-foreground text-5xl font-bold mt-0.5 leading-tight">
                {userData.points.toLocaleString()}
              </Text>
              <Text className="text-foreground/40 text-xs mt-1">{userData.company}</Text>
            </View>

            <View className="items-end gap-2">
              <View className="bg-seegla-orange/15 px-3 py-1 rounded-full flex-row items-center gap-1">
                <Text className="text-xs">{level.emoji}</Text>
                <Text className="text-seegla-orange text-xs font-bold">{level.label}</Text>
              </View>
              <View className="items-center gap-0.5">
                <Flame size={22} color={COLORS.orange} />
                <Text className="text-seegla-orange text-sm font-bold leading-none">{userData.streak}d</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-3 mt-4 pt-3 border-t border-border">
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-seegla-green" />
              <Text className="text-foreground/50 text-xs">Rank #{userData.rank || '-'} company-wide</Text>
            </View>
            <View className="flex-1" />
            <Text className="text-foreground/50 text-xs">{userData.department}</Text>
          </View>
        </View>

        <View className="h-2 bg-muted" />

        <View className="bg-seegla-navy px-5 py-5 overflow-hidden">
          <View className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-seegla-teal opacity-20" />
          <View className="absolute right-2 bottom-0 w-16 h-16 rounded-full bg-seegla-purple opacity-20" />
          {checkedIn ? (
            <View className="flex-row items-center gap-3">
              <CheckCircle2 size={24} color={COLORS.green} />
              <View>
                <Text className="text-white font-semibold">Check-in complete!</Text>
                <Text className="text-white/60 text-xs">+{userData.checkIn.pointsReward} pts earned</Text>
              </View>
            </View>
          ) : (
            <>
              <Text className="text-seegla-orange text-xs font-bold tracking-widest uppercase mb-1">
                Daily Check-in
              </Text>
              <Text className="text-white text-base font-bold mb-1">Answer 3 quick questions</Text>
              <Text className="text-white/60 text-xs mb-4">
                Mood · Energy · Sleep — earn +{userData.checkIn.pointsReward} pts
              </Text>
              <Button className="rounded-lg self-start" onPress={() => setShowCheckIn(true)}>
                <Text>Start Check-in</Text>
              </Button>
            </>
          )}
        </View>

        <View className="h-2 bg-muted mt-3" />

        <View className="bg-background px-5 pb-5">
          <Text className="text-foreground text-base font-semibold mb-4">Wellness Score</Text>

          <View className="flex-row items-center gap-4">
            <View className="flex-1 items-center">
              <WellnessArc
                score={userData.wellnessScore.score}
                maxScore={userData.wellnessScore.maxScore}
                label={userData.wellnessScore.label}
              />
              <View className="flex-row items-center gap-1 mt-1">
                <View className="bg-seegla-green/15 px-2 py-0.5 rounded-full">
                  <Text className="text-seegla-green text-xs font-semibold">+{userData.wellnessScore.change}% this week</Text>
                </View>
              </View>
            </View>

            <View className="flex-1 gap-4">
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-xs font-semibold">Water</Text>
                  <Text variant="muted" className="text-xs">
                    {waterLogged}/{userData.dailyProgress.water.goal} glasses
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => setWaterLogged((v) => Math.max(0, v - 1))}
                    className="w-7 h-7 rounded-full bg-muted items-center justify-center"
                  >
                    <Text className="text-foreground text-base font-bold">-</Text>
                  </Pressable>
                  <View className="flex-1">
                    <SegmentedBar
                      filled={waterLogged}
                      total={userData.dailyProgress.water.goal}
                      color={COLORS.teal}
                    />
                  </View>
                  <Pressable
                    onPress={() => setWaterLogged((v) => Math.min(userData.dailyProgress.water.goal, v + 1))}
                    className="w-7 h-7 rounded-full bg-primary items-center justify-center"
                  >
                    <Text className="text-white text-base font-bold">+</Text>
                  </Pressable>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-xs font-semibold">Steps</Text>
                  <Text variant="muted" className="text-xs">{stepsPercent}%</Text>
                </View>
                <AnimatedBar value={stepsPercent} color={COLORS.green} delay={200} height="h-2.5" />
                <Text variant="muted" className="text-xs -mt-1">
                  {displayedSteps.toLocaleString()} / {userData.dailyProgress.steps.goal.toLocaleString()}
                </Text>
                <View className="flex-row gap-2 mt-1">
                  <Button
                    size="sm"
                    variant={userData.stepTrackingPaused ? 'default' : 'outline'}
                    className="rounded-lg h-8 px-3"
                    onPress={handleToggleStepTracking}
                    disabled={stepTrackingLoading}
                  >
                    <Text className="text-xs">{userData.stepTrackingPaused ? 'Resume' : 'Pause'}</Text>
                  </Button>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-xs font-semibold">Burned Calories</Text>
                  <Text variant="muted" className="text-xs">{userData.dailyProgress.calories.current.toLocaleString()} kcal</Text>
                </View>
                <AnimatedBar
                  value={Math.round((userData.dailyProgress.calories.current / Math.max(1, userData.dailyProgress.calories.goal)) * 100)}
                  color={COLORS.orange}
                  delay={400}
                  height="h-2.5"
                />
              </View>
            </View>
          </View>
        </View>

        <View className="h-2 bg-muted" />

        <View className="bg-background px-5 py-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-foreground text-base font-semibold">This Week</Text>
            <Text variant="muted" className="text-xs">{monthLabel}</Text>
          </View>

          <View className="flex-row justify-between mb-5">
            {userData.weeklyActivity.map((d, idx) => (
              <View key={`${d.date}-${idx}`} className="items-center gap-1.5">
                <Text variant="muted" className="text-xs font-medium">{d.day}</Text>
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    d.isToday
                      ? 'bg-seegla-navy'
                      : d.checkedIn
                      ? 'bg-seegla-teal/15'
                      : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      d.isToday ? 'text-white' : d.checkedIn ? 'text-seegla-teal' : 'text-muted-foreground'
                    }`}
                  >
                    {d.date}
                  </Text>
                </View>
                <View className={`w-1.5 h-1.5 rounded-full ${d.checkedIn ? 'bg-seegla-green' : 'bg-transparent'}`} />
              </View>
            ))}
          </View>

          <View className="flex-row bg-muted rounded-xl overflow-hidden">
            <View className="flex-1 items-center py-3">
              <Text className="text-foreground text-lg font-bold">{weeklyCheckins}</Text>
              <Text variant="muted" className="text-xs">Check-ins</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center py-3">
              <Text className="text-foreground text-lg font-bold">
                {Math.round(userData.weeklyActivity.reduce((a, d) => a + d.steps, 0) / 1000)}k
              </Text>
              <Text variant="muted" className="text-xs">Steps</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center py-3">
              <Text className="text-foreground text-lg font-bold">{userData.streak}d</Text>
              <Text variant="muted" className="text-xs">Streak</Text>
            </View>
          </View>
        </View>

        <View className="h-2 bg-muted" />

        <View className="bg-background px-5 pt-5 pb-36">
          <Text className="text-foreground text-base font-semibold mb-4">Recent Activity</Text>
          {userData.activityFeed.slice(0, 2).map((post, i) => (
            <View
              key={post.id}
              className={`flex-row items-start gap-3 py-3 ${i < 1 ? 'border-b border-border' : ''}`}
            >
              <View className={`w-9 h-9 rounded-full ${post.avatarColor} items-center justify-center shrink-0`}>
                <Text className="text-white text-xs font-bold">{post.initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-sm font-medium">{post.author}</Text>
                <Text variant="muted" className="text-xs">{post.detail}</Text>
              </View>
              <Text variant="muted" className="text-xs shrink-0">{post.timeAgo}</Text>
            </View>
          ))}

          {!loading && userData.activityFeed.length === 0 ? (
            <Text variant="muted" className="text-xs">No recent activity yet.</Text>
          ) : null}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={userData}
        onLogout={handleLogout}
      />

      <CheckInModal
        visible={showCheckIn}
        checkIn={userData.checkIn}
        onComplete={handleCompleteCheckin}
        onClose={() => setShowCheckIn(false)}
      />
    </SafeAreaView>
  );
}
