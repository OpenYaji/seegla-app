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

function toDayNumber(dateIso: string): number {
  const [y, m, d] = dateIso.split('-').map(Number);
  return Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86400000);
}

function toLocalDateIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

async function getEffectiveStreak(userId: string, todayIso: string): Promise<number> {
  const checkinsRes = await supabase
    .from('daily_checkins')
    .select('checkin_date')
    .eq('user_id', userId)
    .lte('checkin_date', todayIso)
    .order('checkin_date', { ascending: false })
    .limit(120);

  if (checkinsRes.error || !checkinsRes.data?.length) return 0;

  const dates = checkinsRes.data
    .map((row: { checkin_date: string }) => row.checkin_date)
    .filter(Boolean);

  if (!dates.length) return 0;

  const todayDay = toDayNumber(todayIso);
  let prevDay = toDayNumber(dates[0]);
  const latestGap = todayDay - prevDay;
  if (latestGap > 1) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i += 1) {
    const currentDay = toDayNumber(dates[i]);
    if (prevDay - currentDay !== 1) break;
    streak += 1;
    prevDay = currentDay;
  }

  return streak;
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
      longest_streak,
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
    longest_streak: number;
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

  const effectiveStreak = await getEffectiveStreak(raw.id, toLocalDateIso());
  if (effectiveStreak !== (raw.current_streak ?? 0)) {
    const nextLongestStreak = Math.max(raw.longest_streak ?? 0, effectiveStreak);
    void supabase
      .from('profiles')
      .update({ current_streak: effectiveStreak, longest_streak: nextLongestStreak })
      .eq('id', raw.id);
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
    streak: effectiveStreak,
    rank,
    initials: raw.initials || getInitials(fullName),
    avatarColor: toAvatarClass(raw.avatar_color),
  };
}
