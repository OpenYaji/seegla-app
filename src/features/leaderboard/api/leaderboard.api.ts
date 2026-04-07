import { supabase } from '@/src/app-config/supabase';
import type { ReadResult } from '@/src/shared/api/types';
import { toAvatarClass } from '@/src/shared/api/utils';
import { getCurrentUserProfile } from '@/src/features/auth/api/profile.api';

export type LeaderboardEntryDto = {
  rank: number;
  name: string;
  initials: string;
  avatarColor: string;
  department: string;
  points: number;
  isCurrentUser?: boolean;
};

function getWeekStartIso(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export async function getIndividualLeaderboard(weekStart?: string): Promise<ReadResult<LeaderboardEntryDto[]>> {
  const me = await getCurrentUserProfile();
  if (!me) return { data: [] };

  const wk = weekStart ?? getWeekStartIso();
  const snapRes = await supabase
    .from('leaderboard_weekly_snapshots')
    .select(`
      user_id,
      points_earned,
      rank,
      profiles (
        full_name,
        initials,
        avatar_color,
        departments ( name )
      )
    `)
    .eq('company_id', me.companyId)
    .eq('week_start', wk)
    .order('points_earned', { ascending: false })
    .limit(100);

  if (snapRes.error) throw snapRes.error;

  const data: LeaderboardEntryDto[] = (snapRes.data ?? []).map((row: any, idx: number) => {
    const profile = Array.isArray((row as any).profiles) ? (row as any).profiles[0] : (row as any).profiles;
    const department = Array.isArray(profile?.departments)
      ? profile?.departments[0]?.name
      : profile?.departments?.name;

    return {
      rank: row.rank ?? idx + 1,
      name: profile?.full_name ?? 'Team Member',
      initials: profile?.initials ?? 'TM',
      avatarColor: toAvatarClass(profile?.avatar_color),
      department: department ?? 'Department',
      points: row.points_earned ?? 0,
      isCurrentUser: row.user_id === me.id,
    };
  });

  return { data };
}

export async function getDepartmentLeaderboard(): Promise<ReadResult<LeaderboardEntryDto[]>> {
  const me = await getCurrentUserProfile();
  if (!me) return { data: [] };

  const deptRes = await supabase
    .from('department_leaderboard')
    .select('department_id, department_name, member_count, total_points, dept_rank')
    .eq('company_id', me.companyId)
    .order('dept_rank', { ascending: true });

  if (deptRes.error) throw deptRes.error;

  const data: LeaderboardEntryDto[] = (deptRes.data ?? []).map((row: any, idx: number) => {
    const initials = row.department_name
      .split(/\s+/)
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? '')
      .join('');
    return {
      rank: row.dept_rank ?? idx + 1,
      name: row.department_name,
      initials,
      avatarColor: 'bg-seegla-navy',
      department: `${row.member_count} members`,
      points: row.total_points ?? 0,
      isCurrentUser: row.department_name === me.department,
    };
  });

  return { data };
}
