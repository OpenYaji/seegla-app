import type { HomeDashboardDto } from '@/src/features/home/api/home.api';

export type { HomeDashboardDto };

export type DashboardState = HomeDashboardDto['currentUser'] & {
  stepTrackingPaused: boolean;
  checkIn: HomeDashboardDto['checkIn'];
  dailyProgress: HomeDashboardDto['dailyProgress'];
  wellnessScore: HomeDashboardDto['wellnessScore'];
  weeklyActivity: HomeDashboardDto['weeklyActivity'];
  activityFeed: HomeDashboardDto['activityFeed'];
};
