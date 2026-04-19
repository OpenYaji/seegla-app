import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  getHomeDashboard,
  submitDailyCheckin,
  type HomeDashboardDto,
} from '@/src/features/home/api/home.api';
import { setAuthenticated } from '@/src/features/auth/hooks/use-auth-gate';
import { getLevel, getMonthLabel } from '@/src/features/home/utils';
import type { DashboardState } from '@/src/features/home/types';

const FALLBACK: DashboardState = {
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

export function useHomeDashboard() {
  const [dashboard, setDashboard] = useState<HomeDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterLogged, setWaterLogged] = useState(0);
  // Skeleton is only shown on the very first load, never on background re-fetches.
  const hasLoadedOnce = useRef(false);

  const loadDashboard = useCallback(async () => {
    try {
      if (!hasLoadedOnce.current) setLoading(true);
      const res = await getHomeDashboard();
      setDashboard(res.data);
      hasLoadedOnce.current = true;
    } catch {
      if (!hasLoadedOnce.current) setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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
    : FALLBACK;

  useEffect(() => {
    setWaterLogged(userData.dailyProgress.water.current);
  }, [userData.dailyProgress.water.current]);

  const level = getLevel(userData.points);
  const monthLabel = useMemo(() => getMonthLabel(), []);
  const weeklyCheckins = userData.weeklyActivity.filter((d) => d.checkedIn).length;

  const handleCompleteCheckin = async (answers: number[]) => {
    const res = await submitDailyCheckin({
      moodScore: answers[0] ?? 3,
      energyScore: answers[1] ?? 3,
      stressScore: answers[2] ?? 3,
    });
    if (!res.error) {
      // Flip the banner immediately — no skeleton, no wait.
      setDashboard((prev) =>
        prev ? { ...prev, checkIn: { ...prev.checkIn, completed: true } } : prev,
      );
      // Silently re-fetch to sync points, streak, and wellness score in the background.
      void loadDashboard();
    }
  };

  const handleLogout = async () => {
    await setAuthenticated(false);
    router.replace('/login');
  };

  return {
    dashboard,
    userData,
    loading,
    waterLogged,
    setWaterLogged,
    level,
    monthLabel,
    weeklyCheckins,
    loadDashboard,
    handleCompleteCheckin,
    handleLogout,
  };
}
