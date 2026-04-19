import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  syncPedometerSteps,
  setStepTrackingPaused,
  type HomeDashboardDto,
} from '@/src/features/home/api/home.api';

async function readTodayPedometerSteps(): Promise<{
  steps: number | null;
  reason?: 'MISSING_MODULE' | 'UNAVAILABLE' | 'PERMISSION_DENIED';
}> {
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
    const result = await Pedometer.getStepCountAsync(start, new Date());
    return { steps: Math.max(0, Math.round(result?.steps ?? 0)) };
  } catch {
    return { steps: null, reason: 'MISSING_MODULE' };
  }
}

export function usePedometer(
  dashboard: HomeDashboardDto | null,
  stepTrackingPaused: boolean,
  loadDashboard: () => Promise<void>,
) {
  const [liveStepCount, setLiveStepCount] = useState<number | null>(null);
  const [stepTrackingLoading, setStepTrackingLoading] = useState(false);
  const lastSyncedStepsRef = useRef<number | null>(null);
  const lastSyncedAtMsRef = useRef<number | null>(null);
  const syncInFlightRef = useRef(false);
  const loadDashboardRef = useRef(loadDashboard);
  useEffect(() => { loadDashboardRef.current = loadDashboard; });

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
    void loadDashboardRef.current();
  };

  useEffect(() => {
    if (!dashboard || stepTrackingPaused) return;

    let stopped = false;
    let subscription: { remove: () => void } | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let appStateSub: { remove: () => void } | null = null;
    let baseline = 0;

    const startOfToday = () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return start;
    };

    const syncSnapshot = async (minStepDelta: number) => {
      const result = await readTodayPedometerSteps();
      if (stopped || result.steps === null) return;
      baseline = result.steps;
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
        if (state === 'active') void syncSnapshot(1);
      });

      timer = setInterval(() => void syncSnapshot(10), 120000);
    };

    void run();

    return () => {
      stopped = true;
      subscription?.remove();
      appStateSub?.remove();
      if (timer) clearInterval(timer);
    };
  }, [dashboard?.currentUser.id, stepTrackingPaused]);

  // Reset sync refs when tracking is paused
  useEffect(() => {
    if (!stepTrackingPaused) return;
    lastSyncedStepsRef.current = null;
    lastSyncedAtMsRef.current = null;
    syncInFlightRef.current = false;
  }, [stepTrackingPaused]);

  // Seed refs from freshly loaded dashboard data
  useEffect(() => {
    if (!dashboard) return;
    const currentSteps = dashboard.dailyProgress.steps.current;
    lastSyncedStepsRef.current = currentSteps;
    lastSyncedAtMsRef.current = Date.now();
    setLiveStepCount((prev) => Math.max(prev ?? 0, currentSteps));
  }, [dashboard]);

  const handleToggleStepTracking = async () => {
    if (stepTrackingLoading) return;
    setStepTrackingLoading(true);
    const wasPaused = stepTrackingPaused;
    await setStepTrackingPaused(!wasPaused);
    setStepTrackingLoading(false);
    if (wasPaused) {
      // Unpausing: fresh sync state so next reading isn't skipped
      lastSyncedStepsRef.current = null;
      lastSyncedAtMsRef.current = null;
    } else {
      syncInFlightRef.current = false;
    }
    await loadDashboardRef.current();
  };

  return { liveStepCount, stepTrackingLoading, handleToggleStepTracking };
}
