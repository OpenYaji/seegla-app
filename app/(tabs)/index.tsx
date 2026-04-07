import { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, View } from 'react-native';
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
import {
  Bell,
  CheckCircle2,
  Flame,
  HelpCircle,
  Lock,
  LogOut,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AnimatedBar, SegmentedBar } from '@/components/ui/animated-progress';
import { COLORS } from '@/lib/constants';
import {
  CURRENT_USER,
  CHECK_IN,
  DAILY_PROGRESS,
  ACTIVITY_FEED,
  WELLNESS_SCORE,
  WEEKLY_ACTIVITY,
} from '@/lib/data/static';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.80;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Points level helper
function getLevel(pts: number): { label: string; emoji: string } {
  if (pts >= 2000) return { label: 'Platinum', emoji: '💎' };
  if (pts >= 1000) return { label: 'Gold',     emoji: '🥇' };
  if (pts >= 500)  return { label: 'Silver',   emoji: '🥈' };
  return              { label: 'Bronze',   emoji: '🥉' };
}

// ─── Wellness Score Arc (SVG gauge) ──────────────────────────────────────────

const ARC_CX = 100, ARC_CY = 110, ARC_R = 82;
const ARC_CIRC  = 2 * Math.PI * ARC_R;        // ≈ 515.2
const ARC_DEG   = 240;
const ARC_LEN   = ARC_CIRC * ARC_DEG / 360;   // ≈ 343.5  (visible 240° arc)
const ARC_ROT   = 150;                          // rotate so gap sits at bottom-centre

function WellnessArc({ score, maxScore }: { score: number; maxScore: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      350,
      withTiming(score / maxScore, { duration: 1300, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  // Animate strokeDashoffset: at 0% → offset = ARC_LEN (nothing drawn)
  // at 100% → offset = 0 (full arc drawn). Fill from start (8 o'clock) rightward.
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: ARC_LEN * (1 - progress.value),
  }));

  return (
    <View className="w-[200px] h-[155px] self-center">
      <Svg width={200} height={155} viewBox="0 0 200 175">
        {/* Gray track */}
        <Circle
          cx={ARC_CX} cy={ARC_CY} r={ARC_R}
          stroke="#E2E8F0"
          strokeWidth={11}
          fill="none"
          strokeDasharray={`${ARC_LEN} ${ARC_CIRC - ARC_LEN}`}
          transform={`rotate(${ARC_ROT}, ${ARC_CX}, ${ARC_CY})`}
          strokeLinecap="round"
        />
        {/* Teal progress arc */}
        <AnimatedCircle
          cx={ARC_CX} cy={ARC_CY} r={ARC_R}
          stroke={COLORS.teal}
          strokeWidth={11}
          fill="none"
          strokeDasharray={`${ARC_LEN} ${ARC_CIRC}`}
          animatedProps={arcProps}
          transform={`rotate(${ARC_ROT}, ${ARC_CX}, ${ARC_CY})`}
          strokeLinecap="round"
        />
      </Svg>
      {/* Score overlay */}
      <View className="absolute inset-0 items-center pt-14">
        <Text className="text-foreground text-4xl font-bold">{score.toFixed(1)}</Text>
        <Text variant="muted" className="text-xs -mt-1">/ {maxScore}</Text>
        <Text className="text-seegla-green text-xs font-semibold mt-1">{WELLNESS_SCORE.label}</Text>
      </View>
    </View>
  );
}

// ─── Hanger Sidebar ───────────────────────────────────────────────────────────

const SIDEBAR_LINKS = [
  { icon: User,        label: 'View Profile'    },
  { icon: Settings,    label: 'Settings'        },
  { icon: HelpCircle,  label: 'Help & Support'  },
  { icon: Shield,      label: 'Privacy'         },
] as const;

function Sidebar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const translateX    = useSharedValue(SIDEBAR_WIDTH);
  const backdropAlpha = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value    = withSpring(0,             { damping: 20, stiffness: 230, mass: 1.1 });
      backdropAlpha.value = withTiming(1, { duration: 260 });
    } else if (mounted) {
      translateX.value    = withSpring(SIDEBAR_WIDTH, { damping: 24, stiffness: 320, mass: 1.0 }, () => {
        runOnJS(setMounted)(false);
      });
      backdropAlpha.value = withTiming(0, { duration: 220 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropAlpha.value }));
  const panelStyle    = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: SIDEBAR_WIDTH,
  }));

  return (
    // Modal renders above ALL navigation chrome, including the floating tab bar
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        {/* Translucent backdrop — tap to close */}
        <Animated.View style={[backdropStyle, { flex: 1 }]} className="bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Sidebar panel — slides in from right */}
        <Animated.View
          style={panelStyle}
          className="absolute top-0 bottom-0 right-0 bg-seegla-navy"
        >
        <SafeAreaView className="flex-1">
          {/* Close button */}
          <View className="flex-row justify-end px-5 pt-4 pb-2">
            <Pressable
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
              onPress={onClose}
            >
              <X size={18} color="#fff" />
            </Pressable>
          </View>

          {/* User profile section */}
          <View className="px-6 pb-6 border-b border-white/10">
            <View className={`w-16 h-16 rounded-full ${CURRENT_USER.avatarColor} items-center justify-center mb-3`}>
              <Text className="text-white text-xl font-bold">{CURRENT_USER.initials}</Text>
            </View>
            <Text className="text-white text-lg font-bold">{CURRENT_USER.name}</Text>
            <Text className="text-white/60 text-sm">{CURRENT_USER.role}</Text>
            <Text className="text-white/40 text-xs mt-0.5">{CURRENT_USER.company}</Text>
          </View>

          {/* Navigation links */}
          <View className="flex-1 py-4">
            {SIDEBAR_LINKS.map(({ icon: Icon, label }) => (
              <Pressable
                key={label}
                className="flex-row items-center gap-4 px-6 py-4"
                onPress={onClose}
              >
                <Icon size={20} color="rgba(255,255,255,0.70)" />
                <Text className="text-white text-base font-medium">{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Log out */}
          <Pressable
            className="flex-row items-center gap-4 px-6 py-5 border-t border-white/10"
            onPress={onClose}
          >
            <LogOut size={20} color={COLORS.orange} />
            <Text className="text-seegla-orange text-base font-medium">Log Out</Text>
          </Pressable>
        </SafeAreaView>
      </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Check-in Modal ───────────────────────────────────────────────────────────

const RATING_OPTIONS = [
  ['😞', '😕', '😐', '🙂', '😄'],
  ['💤', '😴', '⚡', '🔋', '🚀'],
  ['😩', '😟', '😐', '😌', '🌟'],
] as const;

const RATING_LABELS = [
  ['Terrible', 'Bad', 'Okay', 'Good', 'Great'],
  ['Drained',  'Low', 'Moderate', 'Good', 'High'],
  ['Awful',    'Poor', 'Fair', 'Good', 'Amazing'],
] as const;

function CheckInModal({ visible, onComplete, onClose }: {
  visible: boolean; onComplete: () => void; onClose: () => void;
}) {
  const [step, setStep]         = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone]         = useState(false);

  function handleNext() {
    if (selected === null) return;
    if (step < CHECK_IN.questions.length - 1) {
      setStep(step + 1);
      setSelected(null);
    } else {
      setDone(true);
      setTimeout(() => { onComplete(); setStep(0); setSelected(null); setDone(false); }, 1600);
    }
  }

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
                  <Text className="text-seegla-green font-semibold">+{CHECK_IN.pointsReward} pts earned 🎉</Text>
                </View>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-center gap-2 mb-6">
                  {CHECK_IN.questions.map((_, i) => (
                    <View key={i} className={i === step ? 'w-6 h-2 rounded-full bg-primary' : i < step ? 'w-2 h-2 rounded-full bg-primary/40' : 'w-2 h-2 rounded-full bg-border'} />
                  ))}
                </View>
                <Text variant="muted" className="text-xs uppercase tracking-widest text-center mb-2">
                  Question {step + 1} of {CHECK_IN.questions.length}
                </Text>
                <Text className="text-foreground text-xl font-bold text-center mb-7">
                  {CHECK_IN.questions[step]}
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
                <Button className="rounded-lg mt-4" disabled={selected === null} onPress={handleNext}>
                  <Text>{step === CHECK_IN.questions.length - 1 ? 'Submit Check-in' : 'Next'}</Text>
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

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [checkedIn, setCheckedIn]   = useState(CHECK_IN.completed);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const level = getLevel(CURRENT_USER.points);

  const stepsPercent = Math.round((DAILY_PROGRESS.steps.current / DAILY_PROGRESS.steps.goal) * 100);
  const calPercent   = Math.round((DAILY_PROGRESS.calories.current / DAILY_PROGRESS.calories.goal) * 100);

  const weeklyCheckins = WEEKLY_ACTIVITY.filter((d) => d.checkedIn).length;

  return (
    <SafeAreaView className="flex-1 bg-seegla-navy" edges={['top']}>
      {/* Light status bar — navy header area */}
      <StatusBar style="light" />

      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* NAVY HEADER                                                          */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <View className="bg-seegla-navy px-5 pt-3 pb-16">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/60 text-xs uppercase tracking-widest">Good morning</Text>
              <Text className="text-white text-2xl font-bold mt-0.5">{CURRENT_USER.firstName} 👋</Text>
            </View>

            {/* Avatar → sidebar */}
            <View className="flex-row items-center gap-3">
              {/* Notification dot */}
              <Pressable onPress={() => router.push('/modal')} className="relative">
                <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center">
                  <Bell size={18} color="rgba(255,255,255,0.85)" />
                </View>
                <View className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-seegla-orange border-2 border-seegla-navy" />
              </Pressable>

              {/* Profile avatar */}
              <Pressable onPress={() => setSidebarOpen(true)}>
                <View className={`w-10 h-10 rounded-full ${CURRENT_USER.avatarColor} items-center justify-center border-2 border-white/30`}>
                  <Text className="text-white text-sm font-bold">{CURRENT_USER.initials}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* POINTS HERO CARD — the only elevated element, overlaps header        */}
        {/* ──────────────────────────────────────────────────────────────────── */}
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
                {CURRENT_USER.points.toLocaleString()}
              </Text>
              <Text className="text-foreground/40 text-xs mt-1">{CURRENT_USER.company}</Text>
            </View>

            <View className="items-end gap-2">
              {/* Level badge */}
              <View className="bg-seegla-orange/15 px-3 py-1 rounded-full flex-row items-center gap-1">
                <Text className="text-xs">{level.emoji}</Text>
                <Text className="text-seegla-orange text-xs font-bold">{level.label}</Text>
              </View>
              {/* Streak */}
              <View className="items-center gap-0.5">
                <Flame size={22} color={COLORS.orange} />
                <Text className="text-seegla-orange text-sm font-bold leading-none">{CURRENT_USER.streak}d</Text>
              </View>
            </View>
          </View>

          {/* Rank pill */}
          <View className="flex-row items-center gap-3 mt-4 pt-3 border-t border-border">
            <View className="flex-row items-center gap-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-seegla-green" />
              <Text className="text-foreground/50 text-xs">Rank #{CURRENT_USER.rank} company-wide</Text>
            </View>
            <View className="flex-1" />
            <Text className="text-foreground/50 text-xs">{CURRENT_USER.department}</Text>
          </View>
        </View>
        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* DAILY CHECK-IN BANNER                                                */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <View className="h-2 bg-muted" />

        <View className="bg-seegla-navy px-5 py-5 overflow-hidden">
          <View className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-seegla-teal opacity-20" />
          <View className="absolute right-2 bottom-0 w-16 h-16 rounded-full bg-seegla-purple opacity-20" />
          {checkedIn ? (
            <View className="flex-row items-center gap-3">
              <CheckCircle2 size={24} color={COLORS.green} />
              <View>
                <Text className="text-white font-semibold">Check-in complete!</Text>
                <Text className="text-white/60 text-xs">+{CHECK_IN.pointsReward} pts earned · Promo Hour unlocks at 8PM</Text>
              </View>
            </View>
          ) : (
            <>
              <Text className="text-seegla-orange text-xs font-bold tracking-widest uppercase mb-1">
                Daily Check-in
              </Text>
              <Text className="text-white text-base font-bold mb-1">
                Answer 3 quick questions
              </Text>
              <Text className="text-white/60 text-xs mb-4">
                Mood · Energy · Sleep — earn +{CHECK_IN.pointsReward} pts
              </Text>
              <Button className="rounded-lg self-start" onPress={() => setShowCheckIn(true)}>
                <Text>Start Check-in</Text>
              </Button>
            </>
          )}
        </View>
        
        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* WELLNESS SCORE + DAILY PROGRESS                                      */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <View className="h-2 bg-muted mt-3" />

        <View className="bg-background px-5 pb-5">
          <Text className="text-foreground text-base font-semibold mb-4">Wellness Score</Text>

          <View className="flex-row items-center gap-4">
            {/* Arc gauge */}
            <View className="flex-1 items-center">
              <WellnessArc score={WELLNESS_SCORE.score} maxScore={WELLNESS_SCORE.maxScore} />
              <View className="flex-row items-center gap-1 mt-1">
                <View className="bg-seegla-green/15 px-2 py-0.5 rounded-full">
                  <Text className="text-seegla-green text-xs font-semibold">+{WELLNESS_SCORE.change}% this week</Text>
                </View>
              </View>
            </View>

            {/* Daily metrics stack */}
            <View className="flex-1 gap-4">
              {/* Water */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-xs font-semibold">💧 Water</Text>
                  <Text variant="muted" className="text-xs">
                    {DAILY_PROGRESS.water.current}/{DAILY_PROGRESS.water.goal} glasses
                  </Text>
                </View>
                <SegmentedBar
                  filled={DAILY_PROGRESS.water.current}
                  total={DAILY_PROGRESS.water.goal}
                  color={COLORS.teal}
                />
              </View>

              {/* Steps */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-xs font-semibold">🚶 Steps</Text>
                  <Text variant="muted" className="text-xs">{stepsPercent}%</Text>
                </View>
                <AnimatedBar value={stepsPercent} color={COLORS.green} delay={200} height="h-2.5" />
                <Text variant="muted" className="text-xs -mt-1">
                  {DAILY_PROGRESS.steps.current.toLocaleString()} / {DAILY_PROGRESS.steps.goal.toLocaleString()}
                </Text>
              </View>

              {/* Calories */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground text-xs font-semibold">⚡ Calories</Text>
                  <Text variant="muted" className="text-xs">{calPercent}%</Text>
                </View>
                <AnimatedBar value={calPercent} color={COLORS.orange} delay={400} height="h-2.5" />
              </View>
            </View>
          </View>
        </View>

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* THIS WEEK — Training Days calendar                                   */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <View className="h-2 bg-muted" />

        <View className="bg-background px-5 py-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-foreground text-base font-semibold">This Week</Text>
            <Text variant="muted" className="text-xs">March 2026</Text>
          </View>

          {/* 7-day calendar row */}
          <View className="flex-row justify-between mb-5">
            {WEEKLY_ACTIVITY.map((d) => (
              <View key={d.date} className="items-center gap-1.5">
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
                {/* Activity dot */}
                <View
                  className={`w-1.5 h-1.5 rounded-full ${
                    d.checkedIn ? 'bg-seegla-green' : 'bg-transparent'
                  }`}
                />
              </View>
            ))}
          </View>

          {/* Week stats row */}
          <View className="flex-row bg-muted rounded-xl overflow-hidden">
            <View className="flex-1 items-center py-3">
              <Text className="text-foreground text-lg font-bold">{weeklyCheckins}</Text>
              <Text variant="muted" className="text-xs">Check-ins</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center py-3">
              <Text className="text-foreground text-lg font-bold">
                {Math.round(WEEKLY_ACTIVITY.reduce((a, d) => a + d.steps, 0) / 1000)}k
              </Text>
              <Text variant="muted" className="text-xs">Steps</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center py-3">
              <Text className="text-foreground text-lg font-bold">{CURRENT_USER.streak}d</Text>
              <Text variant="muted" className="text-xs">Streak</Text>
            </View>
          </View>
        </View>



        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* RECENT ACTIVITY                                                       */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <View className="h-2 bg-muted" />

        <View className="bg-background px-5 pt-5 pb-36">
          <Text className="text-foreground text-base font-semibold mb-4">Recent Activity</Text>
          {ACTIVITY_FEED.slice(0, 2).map((post, i) => (
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
        </View>
      </ScrollView>

      {/* Sidebar overlay (rendered outside ScrollView, full-screen z-index) */}
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Check-in modal */}
      <CheckInModal
        visible={showCheckIn}
        onComplete={() => { setCheckedIn(true); setShowCheckIn(false); }}
        onClose={() => setShowCheckIn(false)}
      />
    </SafeAreaView>
  );
}
