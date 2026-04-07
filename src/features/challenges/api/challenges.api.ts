import { supabase } from '@/src/app-config/supabase';
import { getCurrentUserProfile } from '@/src/features/auth/api/profile.api';
import type { ReadResult, WriteResult } from '@/src/shared/api/types';
import type { ChallengeType } from '@/src/shared/types/database';

export type ChallengeDto = {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'team';
  points: number;
  progress: number;
  joined: boolean;
  daysLeft?: number;
  participants?: number;
};

type ChallengeWriteError = 'UNAUTHENTICATED' | 'ALREADY_JOINED' | 'NOT_JOINED' | 'UNKNOWN';

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

export async function listChallengesByType(type: ChallengeType): Promise<ReadResult<ChallengeDto[]>> {
  const me = await getCurrentUserProfile();
  if (!me) return { data: [] };

  const nowIso = new Date().toISOString();
  const challengesRes = await supabase
    .from('challenges')
    .select(`
      id,
      title,
      description,
      type,
      points_reward,
      ends_at
    `)
    .eq('company_id', me.companyId)
    .eq('is_active', true)
    .eq('type', type)
    .lte('starts_at', nowIso)
    .order('ends_at', { ascending: true });

  if (challengesRes.error) throw challengesRes.error;

  const challengeIds = (challengesRes.data ?? []).map((c: { id: string }) => c.id);
  const enrollmentRes = challengeIds.length
    ? await supabase
        .from('user_challenges')
        .select('challenge_id, progress')
        .eq('user_id', me.id)
        .in('challenge_id', challengeIds)
    : { data: [], error: null };

  if (enrollmentRes.error) throw enrollmentRes.error;

  const progressByChallenge = new Map(
    (enrollmentRes.data ?? []).map((e: { challenge_id: string; progress: number }) => [e.challenge_id, e.progress]),
  );

  const participantsRes = challengeIds.length
    ? await supabase
        .from('user_challenges')
        .select('challenge_id')
        .in('challenge_id', challengeIds)
    : { data: [], error: null };

  if (participantsRes.error) throw participantsRes.error;
  const participantCount = new Map<string, number>();
  for (const row of (participantsRes.data ?? []) as Array<{ challenge_id: string }>) {
    participantCount.set(row.challenge_id, (participantCount.get(row.challenge_id) ?? 0) + 1);
  }

  const data: ChallengeDto[] = (challengesRes.data ?? []).map((row: any) => {
    const progress = progressByChallenge.get(row.id) ?? 0;
    const joined = progressByChallenge.has(row.id);
    const daysLeft = Math.max(0, Math.ceil((new Date(row.ends_at).getTime() - Date.now()) / 86400000));
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      points: row.points_reward,
      progress,
      joined,
      daysLeft,
      participants: participantCount.get(row.id) ?? 0,
    };
  });

  return { data };
}

export async function setChallengeJoinState(
  challengeId: string,
  joined: boolean,
): Promise<WriteResult<{ joined: boolean }, ChallengeWriteError>> {
  const me = await getCurrentUserProfile();
  const userId = await resolveActiveUserId();
  if (!me || !userId) return { data: null, error: 'UNAUTHENTICATED' };

  const existing = await supabase
    .from('user_challenges')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .maybeSingle();

  if (existing.error) return { data: null, error: 'UNKNOWN' };

  if (joined) {
    if (existing.data?.id) return { data: null, error: 'ALREADY_JOINED' };
    const insRes = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        company_id: me.companyId,
        progress: 0,
        completed: false,
      });
    if (insRes.error) return { data: null, error: 'UNKNOWN' };
    return { data: { joined: true }, error: null };
  }

  if (!existing.data?.id) return { data: null, error: 'NOT_JOINED' };

  const delRes = await supabase
    .from('user_challenges')
    .delete()
    .eq('id', existing.data.id);
  if (delRes.error) return { data: null, error: 'UNKNOWN' };

  return { data: { joined: false }, error: null };
}
