import { supabase } from '@/src/app-config/supabase';
import { getCurrentUserProfile } from '@/src/features/auth/api/profile.api';
import type { ReadResult, WriteResult } from '@/src/shared/api/types';
import { formatTimeAgo, toAvatarClass } from '@/src/shared/api/utils';
import type { ReactionType } from '@/src/shared/types/database';

export type FeedPostDto = {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  department: string;
  timeAgo: string;
  activity: string;
  detail: string;
  likes: number;
  likedByMe: boolean;
  celebrates: number;
  celebratedByMe: boolean;
};

export type StoryDto = {
  id: string;
  storyId?: string;
  name: string;
  initials: string;
  avatarColor: string;
  ringColor: string;
  isOwn?: boolean;
  hasStory: boolean;
  mediaUrl?: string;
  caption?: string;
};

const DEFAULT_PAGE_SIZE = 20;

function activityLabel(postType: string): string {
  if (postType === 'challenge_completed') return 'completed a challenge';
  if (postType === 'reward_earned') return 'earned a reward';
  if (postType === 'checkin_completed') return 'checked in';
  if (postType === 'challenge_joined') return 'joined a challenge';
  if (postType === 'step_milestone') return 'hit a milestone';
  return 'posted an update';
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

export async function listFeedPosts(cursor?: string): Promise<ReadResult<FeedPostDto[]>> {
  const me = await getCurrentUserProfile();
  if (!me) return { data: [] };

  let query = supabase
    .from('feed_posts')
    .select(`
      id,
      user_id,
      post_type,
      auto_detail,
      content,
      like_count,
      celebrate_count,
      created_at,
      profiles (
        full_name,
        initials,
        avatar_color,
        departments ( name )
      )
    `)
    .eq('company_id', me.companyId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(DEFAULT_PAGE_SIZE + 1);

  if (cursor) {
    const [cursorDate, cursorId] = cursor.split('|');
    if (cursorDate && cursorId) {
      query = query.or(`created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`);
    }
  }

  const postsRes = await query;
  if (postsRes.error) return { data: [] };

  const rows = (postsRes.data ?? []) as Array<{
    id: string;
    user_id: string;
    post_type: string;
    auto_detail: string | null;
    content: string | null;
    like_count: number;
    celebrate_count: number;
    created_at: string;
    profiles?: {
      full_name?: string;
      initials?: string;
      avatar_color?: string;
      departments?: { name?: string } | Array<{ name?: string }>;
    } | Array<{
      full_name?: string;
      initials?: string;
      avatar_color?: string;
      departments?: { name?: string } | Array<{ name?: string }>;
    }>;
  }>;

  const page = rows.slice(0, DEFAULT_PAGE_SIZE);
  const hasMore = rows.length > DEFAULT_PAGE_SIZE;
  const nextCursor = hasMore ? `${page[page.length - 1]?.created_at}|${page[page.length - 1]?.id}` : null;
  const postIds = page.map((p) => p.id);

  let likedMap = new Set<string>();
  let celebratedMap = new Set<string>();
  if (postIds.length > 0) {
    const reactionsRes = await supabase
      .from('feed_reactions')
      .select('post_id, reaction')
      .eq('user_id', me.id)
      .in('post_id', postIds);

    if (!reactionsRes.error && reactionsRes.data) {
      likedMap = new Set(
        reactionsRes.data
          .filter((r: any) => r.reaction === 'like')
          .map((r: any) => r.post_id),
      );
      celebratedMap = new Set(
        reactionsRes.data
          .filter((r: any) => r.reaction === 'celebrate')
          .map((r: any) => r.post_id),
      );
    }
  }

  const data: FeedPostDto[] = page.map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const department = Array.isArray(profile?.departments)
      ? profile?.departments[0]?.name
      : profile?.departments?.name;
    const detail = row.auto_detail || row.content || 'Wellness update';
    return {
      id: row.id,
      author: profile?.full_name ?? 'Team Member',
      initials: profile?.initials ?? 'TM',
      avatarColor: toAvatarClass(profile?.avatar_color),
      department: department ?? 'Department',
      timeAgo: formatTimeAgo(row.created_at),
      activity: activityLabel(row.post_type),
      detail,
      likes: row.like_count ?? 0,
      likedByMe: likedMap.has(row.id),
      celebrates: row.celebrate_count ?? 0,
      celebratedByMe: celebratedMap.has(row.id),
    };
  });

  return {
    data,
    nextCursor,
  };
}

export async function listStories(): Promise<ReadResult<StoryDto[]>> {
  const me = await getCurrentUserProfile();
  if (!me) return { data: [] };

  const nowIso = new Date().toISOString();
  const storiesRes = await supabase
    .from('stories')
    .select('id, user_id, media_url, caption, created_at')
    .eq('company_id', me.companyId)
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: false })
    .limit(50);

  if (storiesRes.error) {
    return {
      data: [
        {
          id: me.id,
          name: 'Your Story',
          initials: me.initials,
          avatarColor: me.avatarColor,
          ringColor: 'border-seegla-teal',
          isOwn: true,
          hasStory: false,
        },
      ],
    };
  }

  const storyRows = (storiesRes.data ?? []) as Array<{
    id: string;
    user_id: string;
    media_url: string;
    caption: string | null;
    created_at: string;
  }>;

  const userIds = Array.from(new Set(storyRows.map((r) => r.user_id)));
  const profilesRes = userIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name, initials, avatar_color')
        .in('id', userIds)
    : { data: [], error: null };

  const profileById = new Map<string, { full_name?: string; initials?: string; avatar_color?: string }>();
  if (!profilesRes.error && profilesRes.data) {
    for (const p of profilesRes.data as Array<{ id: string; full_name?: string; initials?: string; avatar_color?: string }>) {
      profileById.set(p.id, p);
    }
  }

  const usersSeen = new Set<string>();
  const mapped: StoryDto[] = [];
  for (const row of storyRows) {
    if (usersSeen.has(row.user_id)) continue;
    usersSeen.add(row.user_id);
    const profile = profileById.get(row.user_id);
    const isOwn = row.user_id === me.id;
    mapped.push({
      id: row.user_id,
      storyId: row.id,
      name: isOwn ? 'Your Story' : (profile?.full_name?.split(' ')[0] ?? 'Member'),
      initials: profile?.initials ?? 'TM',
      avatarColor: toAvatarClass(profile?.avatar_color),
      ringColor: isOwn ? 'border-seegla-teal' : 'border-seegla-orange',
      isOwn,
      hasStory: true,
      mediaUrl: row.media_url,
      caption: row.caption ?? undefined,
    });
  }

  if (!mapped.some((s) => s.isOwn)) {
    mapped.unshift({
      id: me.id,
      name: 'Your Story',
      initials: me.initials,
      avatarColor: me.avatarColor,
      ringColor: 'border-seegla-teal',
      isOwn: true,
      hasStory: false,
    });
  }

  return { data: mapped };
}

type ToggleReactionError = 'UNAUTHENTICATED' | 'UNKNOWN';
type CreatePostError = 'UNAUTHENTICATED' | 'EMPTY_CONTENT' | 'UNKNOWN';
type CreateStoryError = 'UNAUTHENTICATED' | 'UNKNOWN';

export async function toggleFeedReaction(
  postId: string,
  reaction: ReactionType,
): Promise<WriteResult<{ active: boolean }, ToggleReactionError>> {
  const userId = await resolveActiveUserId();
  if (!userId) return { data: null, error: 'UNAUTHENTICATED' };

  const existsRes = await supabase
    .from('feed_reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('reaction', reaction)
    .maybeSingle();

  if (existsRes.error) return { data: null, error: 'UNKNOWN' };

  if (existsRes.data?.id) {
    const delRes = await supabase
      .from('feed_reactions')
      .delete()
      .eq('id', existsRes.data.id);

    if (delRes.error) return { data: null, error: 'UNKNOWN' };
    return { data: { active: false }, error: null };
  }

  const insRes = await supabase
    .from('feed_reactions')
    .insert({
      post_id: postId,
      user_id: userId,
      reaction,
    });

  if (insRes.error) return { data: null, error: 'UNKNOWN' };
  return { data: { active: true }, error: null };
}

export async function createFeedPost(
  content: string,
): Promise<WriteResult<{ created: boolean }, CreatePostError>> {
  const body = content.trim();
  if (!body) return { data: null, error: 'EMPTY_CONTENT' };

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return { data: null, error: 'UNAUTHENTICATED' };

  const me = await getCurrentUserProfile();
  if (!me) return { data: null, error: 'UNAUTHENTICATED' };

  const insRes = await supabase
    .from('feed_posts')
    .insert({
      user_id: userId,
      company_id: me.companyId,
      post_type: 'user_post',
      content: body,
      auto_detail: null,
      reference_id: null,
      reference_table: null,
      is_visible: true,
    });

  if (insRes.error) return { data: null, error: 'UNKNOWN' };
  return { data: { created: true }, error: null };
}

export async function createStory(
  mediaUrl?: string,
  caption?: string,
): Promise<WriteResult<{ created: boolean; storyId: string; mediaUrl: string; caption?: string }, CreateStoryError>> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return { data: null, error: 'UNAUTHENTICATED' };

  const me = await getCurrentUserProfile();
  if (!me) return { data: null, error: 'UNAUTHENTICATED' };

  const seed = `${userId}-${Date.now()}`;
  const fallbackRemoteUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}/720/1280`;
  const pickedMediaUrl = mediaUrl?.trim() || fallbackRemoteUrl;
  let resolvedMediaUrl = pickedMediaUrl.startsWith('http') ? pickedMediaUrl : fallbackRemoteUrl;

  // Try uploading local image to Supabase Storage so other users can view it too.
  if (pickedMediaUrl.startsWith('file://') || pickedMediaUrl.startsWith('content://')) {
    try {
      const extMatch = pickedMediaUrl.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)(\?|$)/);
      const ext = extMatch?.[1] ?? 'jpg';
      const path = `stories/${me.companyId}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const response = await fetch(pickedMediaUrl);
      const arrayBuffer = await response.arrayBuffer();

      const uploadRes = await supabase.storage
        .from('stories')
        .upload(path, arrayBuffer, { contentType: `image/${ext}`, upsert: false });

      if (!uploadRes.error) {
        const publicRes = supabase.storage.from('stories').getPublicUrl(path);
        if (publicRes.data.publicUrl) {
          resolvedMediaUrl = publicRes.data.publicUrl;
        }
      }
    } catch {
      // Keep local URL fallback
    }
  }

  const insRes = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      company_id: me.companyId,
      media_url: resolvedMediaUrl,
      caption: caption?.trim() || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id, media_url, caption')
    .single();

  if (insRes.error) return { data: null, error: 'UNKNOWN' };

  return {
    data: {
      created: true,
      storyId: insRes.data.id,
      mediaUrl: insRes.data.media_url,
      caption: insRes.data.caption ?? undefined,
    },
    error: null,
  };
}
