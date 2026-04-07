import { supabase } from '@/src/app-config/supabase';
import type { ReadResult, WriteResult } from '@/src/shared/api/types';
import { getCurrentUserProfile, type CurrentUserProfile } from '@/src/features/auth/api/profile.api';
import { listFeedPosts, type FeedPostDto } from '@/src/features/feed/api/feed.api';
import { safeStorage } from '@/src/shared/storage/safe-storage';

export type HomeDashboardDto = {
  currentUser: CurrentUserProfile;
  stepTrackingPaused: boolean;
  checkIn: {
    completed: boolean;
    pointsReward: number;
    questions: string[];
  };
  dailyProgress: {
    steps: { current: number; goal: number; unit: string; label: string };
    water: { current: number; goal: number; unit: string; label: string };
    calories: { current: number; goal: number; unit: string; label: string };
  };
  wellnessScore: {
    score: number;
    maxScore: number;
    label: string;
    change: number;
  };
  weeklyActivity: Array<{
    day: string;
    date: number;
    checkedIn: boolean;
    steps: number;
    isToday?: boolean;
  }>;
  activityFeed: FeedPostDto[];
};

export type SubmitDailyCheckinInput = {
  moodScore: number;
  energyScore: number;
  stressScore: number;
};

type SubmitDailyCheckinError = 'UNAUTHENTICATED' | 'ALREADY_CHECKED_IN' | 'UNKNOWN';
type ManualStepError = 'UNAUTHENTICATED' | 'TRACKING_PAUSED' | 'UNKNOWN';

const CHECKIN_QUESTIONS = [
  'How is your mood today?',
  'How is your energy level?',
  'How well did you sleep?',
];

function toLocalDateIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateIso(date = new Date()): string {
  return toLocalDateIso(date);
}

function getWeekStartIso(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return toLocalDateIso(d);
}

function wellnessLabel(score: number): string {
  if (score >= 8) return 'Great';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Needs Attention';
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function estimateActiveCaloriesFromSteps(steps: number): number {
  // Approximation: walking burns about 0.04 kcal per step.
  return Math.round(steps * 0.04);
}

function estimateHydrationGlasses(steps: number): number {
  // Approximation: ~1 glass per 1500 steps, capped to daily 8-glass target.
  return clamp(Math.round(steps / 1500), 0, 8);
}

async function resolveActiveUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  if (data.user?.id) return data.user.id;

  const fallback = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .maybeSingle();

  return fallback.data?.id ?? null;
}

function stepPauseKey(userId: string): string {
  return `SEEGLA_STEP_TRACKING_PAUSED_${userId}`;
}

async function getStepPaused(userId: string): Promise<boolean> {
  const raw = await safeStorage.getItem(stepPauseKey(userId));
  return raw === '1';
}

export async function setStepTrackingPaused(paused: boolean): Promise<WriteResult<{ paused: boolean }, 'UNAUTHENTICATED'>> {
  const userId = await resolveActiveUserId();
  if (!userId) return { data: null, error: 'UNAUTHENTICATED' };

  await safeStorage.setItem(stepPauseKey(userId), paused ? '1' : '0');
  return { data: { paused }, error: null };
}

export async function getHomeDashboard(): Promise<ReadResult<HomeDashboardDto | null>> {
  const me = await getCurrentUserProfile();
  if (!me) return { data: null };
  const stepTrackingPaused = await getStepPaused(me.id);

  const today = getDateIso();
  const weekStart = getWeekStartIso();
  const weekEndDate = new Date(`${weekStart}T00:00:00.000Z`);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);

  const [checkinRes, todayStepsRes, weeklyCheckinsRes, weeklyStepsRes, weeklyScoreRes, recentFeedRes] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select('id, wellness_score')
      .eq('user_id', me.id)
      .eq('checkin_date', today)
      .maybeSingle(),
    supabase
      .from('daily_step_records')
      .select('step_count')
      .eq('user_id', me.id)
      .eq('record_date', today)
      .maybeSingle(),
    supabase
      .from('daily_checkins')
      .select('checkin_date')
      .eq('user_id', me.id)
      .gte('checkin_date', weekStart)
      .lte('checkin_date', weekEnd),
    supabase
      .from('daily_step_records')
      .select('record_date, step_count')
      .eq('user_id', me.id)
      .gte('record_date', weekStart)
      .lte('record_date', weekEnd),
    supabase
      .from('weekly_wellness_scores')
      .select('avg_wellness_score')
      .eq('user_id', me.id)
      .eq('week_start', weekStart)
      .maybeSingle(),
    listFeedPosts(),
  ]);

  if (checkinRes.error) throw checkinRes.error;
  if (todayStepsRes.error) throw todayStepsRes.error;
  if (weeklyCheckinsRes.error) throw weeklyCheckinsRes.error;
  if (weeklyStepsRes.error) throw weeklyStepsRes.error;
  if (weeklyScoreRes.error) throw weeklyScoreRes.error;

  const checkinDates = new Set((weeklyCheckinsRes.data ?? []).map((r: { checkin_date: string }) => r.checkin_date));
  const stepsByDate = new Map<string, number>(
    (weeklyStepsRes.data ?? []).map((r: { record_date: string; step_count: number }) => [r.record_date, r.step_count]),
  );

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weeklyActivity = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date(`${weekStart}T00:00:00.000Z`);
    date.setDate(date.getDate() + idx);
    const iso = date.toISOString().slice(0, 10);
    return {
      day: weekdays[idx],
      date: date.getDate(),
      checkedIn: checkinDates.has(iso),
      steps: stepsByDate.get(iso) ?? 0,
      isToday: iso === today ? true : undefined,
    };
  });

  const rawWeeklyScore = Number(weeklyScoreRes.data?.avg_wellness_score ?? 0); // 1..5
  const rawTodayScore = Number((checkinRes.data as any)?.wellness_score ?? 0); // 1..5
  const score = clamp(Number(((rawTodayScore || rawWeeklyScore) * 2).toFixed(1)), 0, 10); // normalize to 10-point gauge
  const previousWeekDate = new Date(`${weekStart}T00:00:00.000Z`);
  previousWeekDate.setDate(previousWeekDate.getDate() - 7);
  const previousWeek = previousWeekDate.toISOString().slice(0, 10);
  const previousScoreRes = await supabase
    .from('weekly_wellness_scores')
    .select('avg_wellness_score')
    .eq('user_id', me.id)
    .eq('week_start', previousWeek)
    .maybeSingle();
  if (previousScoreRes.error) throw previousScoreRes.error;
  const previousScoreRaw = Number(previousScoreRes.data?.avg_wellness_score ?? 0);
  const currentForChange = rawTodayScore || rawWeeklyScore;
  const change = previousScoreRaw > 0
    ? Math.round(((currentForChange - previousScoreRaw) / previousScoreRaw) * 100)
    : 0;

  const todaySteps = todayStepsRes.data?.step_count ?? 0;
  const activeCalories = estimateActiveCaloriesFromSteps(todaySteps);
  const hydrationGlasses = estimateHydrationGlasses(todaySteps);

  const dashboard: HomeDashboardDto = {
    currentUser: me,
    stepTrackingPaused,
    checkIn: {
      completed: Boolean(checkinRes.data?.id),
      pointsReward: 10,
      questions: CHECKIN_QUESTIONS,
    },
    dailyProgress: {
      steps: {
        current: todaySteps,
        goal: 8000,
        unit: 'steps',
        label: 'Steps',
      },
      water: {
        current: hydrationGlasses,
        goal: 8,
        unit: 'glasses',
        label: 'Water',
      },
      calories: {
        current: activeCalories,
        goal: 600,
        unit: 'kcal',
        label: 'Burned',
      },
    },
    wellnessScore: {
      score,
      maxScore: 10,
      label: wellnessLabel(score),
      change,
    },
    weeklyActivity,
    activityFeed: recentFeedRes.data,
  };

  return { data: dashboard };
}

export async function syncPedometerSteps(totalStepsToday: number): Promise<WriteResult<{ steps: number }, ManualStepError>> {
  const me = await getCurrentUserProfile();
  const userId = await resolveActiveUserId();
  if (!me || !userId) return { data: null, error: 'UNAUTHENTICATED' };

  const paused = await getStepPaused(userId);
  if (paused) return { data: null, error: 'TRACKING_PAUSED' };

  const today = getDateIso();
  const currentRes = await supabase
    .from('daily_step_records')
    .select('id, step_count')
    .eq('user_id', userId)
    .eq('record_date', today)
    .maybeSingle();

  if (currentRes.error) return { data: null, error: 'UNKNOWN' };

  const nextSteps = Math.max(0, Math.round(totalStepsToday));
  if (currentRes.data?.id) {
    const updRes = await supabase
      .from('daily_step_records')
      .update({
        step_count: nextSteps,
        platform: 'manual',
        milestone_2000_awarded: nextSteps >= 2000,
        milestone_5000_awarded: nextSteps >= 5000,
        milestone_8000_awarded: nextSteps >= 8000,
        milestone_10000_awarded: nextSteps >= 10000,
      })
      .eq('id', currentRes.data.id);
    if (updRes.error) return { data: null, error: 'UNKNOWN' };
    return { data: { steps: nextSteps }, error: null };
  }

  const insRes = await supabase
    .from('daily_step_records')
    .insert({
      user_id: userId,
      company_id: me.companyId,
      record_date: today,
      step_count: nextSteps,
      platform: 'manual',
      milestone_2000_awarded: nextSteps >= 2000,
      milestone_5000_awarded: nextSteps >= 5000,
      milestone_8000_awarded: nextSteps >= 8000,
      milestone_10000_awarded: nextSteps >= 10000,
    });

  if (insRes.error) return { data: null, error: 'UNKNOWN' };
  return { data: { steps: nextSteps }, error: null };
}

export async function submitDailyCheckin(
  input: SubmitDailyCheckinInput,
): Promise<WriteResult<{ completed: boolean }, SubmitDailyCheckinError>> {
  const me = await getCurrentUserProfile();
  const userId = await resolveActiveUserId();
  if (!me || !userId) return { data: null, error: 'UNAUTHENTICATED' };

  const today = getDateIso();
  const existingRes = await supabase
    .from('daily_checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .maybeSingle();

  if (existingRes.error) return { data: null, error: 'UNKNOWN' };
  if (existingRes.data?.id) return { data: null, error: 'ALREADY_CHECKED_IN' };

  const insertRes = await supabase
    .from('daily_checkins')
    .insert({
      user_id: userId,
      company_id: me.companyId,
      checkin_date: today,
      mood_score: input.moodScore,
      energy_score: input.energyScore,
      stress_score: input.stressScore,
      promo_hour_eligible: true,
      promo_hour_claimed: false,
    });

  if (insertRes.error) return { data: null, error: 'UNKNOWN' };

  const profileRes = await supabase
    .from('profiles')
    .select('total_points')
    .eq('id', userId)
    .maybeSingle();
  if (profileRes.error || !profileRes.data) return { data: null, error: 'UNKNOWN' };

  const pointsReward = 10;
  const profileUpdateRes = await supabase
    .from('profiles')
    .update({ total_points: profileRes.data.total_points + pointsReward })
    .eq('id', userId);
  if (profileUpdateRes.error) return { data: null, error: 'UNKNOWN' };

  await supabase.from('point_transactions').insert({
    user_id: userId,
    company_id: me.companyId,
    activity: 'daily_checkin',
    points: pointsReward,
    reference_id: null,
    reference_table: 'daily_checkins',
    note: 'Daily check-in completion',
  });

  await supabase.from('feed_posts').insert({
    user_id: userId,
    company_id: me.companyId,
    post_type: 'checkin_completed',
    auto_detail: "Completed today's Daily Check-in (+10 pts)",
    reference_id: null,
    reference_table: 'daily_checkins',
    is_visible: true,
  });

  return { data: { completed: true }, error: null };
}
