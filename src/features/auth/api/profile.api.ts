import { supabase } from '@/src/app-config/supabase';
import { getInitials, toAvatarClass } from '@/src/shared/api/utils';

export type CurrentUserProfile = {
  id: string;
  companyId: string;
  name: string;
  firstName: string;
  role: string;
  department: string;
  company: string;
  points: number;
  streak: number;
  rank: number;
  initials: string;
  avatarColor: string;
};

function getWeekStartIso(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
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

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const userId = await resolveActiveUserId();
  if (!userId) return null;

  const profileRes = await supabase
    .from('profiles')
    .select(`
      id,
      company_id,
      full_name,
      initials,
      avatar_color,
      role,
      total_points,
      current_streak,
      companies(name),
      departments(name)
    `)
    .eq('id', userId)
    .maybeSingle();

  if (profileRes.error || !profileRes.data) return null;

  const raw = profileRes.data as unknown as {
    id: string;
    company_id: string;
    full_name: string;
    initials: string | null;
    avatar_color: string | null;
    role: string | null;
    total_points: number;
    current_streak: number;
    companies?: { name?: string } | Array<{ name?: string }>;
    departments?: { name?: string } | Array<{ name?: string }>;
  };

  const companyName = Array.isArray(raw.companies)
    ? raw.companies[0]?.name
    : raw.companies?.name;
  const departmentName = Array.isArray(raw.departments)
    ? raw.departments[0]?.name
    : raw.departments?.name;

  const weekStart = getWeekStartIso();
  const rankRes = await supabase
    .from('leaderboard_weekly_snapshots')
    .select('user_id, points_earned')
    .eq('company_id', raw.company_id)
    .eq('week_start', weekStart)
    .order('points_earned', { ascending: false });

  let rank = 0;
  if (rankRes.data) {
    const idx = rankRes.data.findIndex((r: { user_id: string }) => r.user_id === raw.id);
    rank = idx >= 0 ? idx + 1 : 0;
  }

  const fullName = raw.full_name || 'Member';

  return {
    id: raw.id,
    companyId: raw.company_id,
    name: fullName,
    firstName: fullName.split(' ')[0] || fullName,
    role: raw.role ?? 'Member',
    department: departmentName ?? 'General',
    company: companyName ?? 'Company',
    points: raw.total_points ?? 0,
    streak: raw.current_streak ?? 0,
    rank,
    initials: raw.initials || getInitials(fullName),
    avatarColor: toAvatarClass(raw.avatar_color),
  };
}
