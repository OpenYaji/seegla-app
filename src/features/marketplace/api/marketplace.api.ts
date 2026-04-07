import { supabase } from '@/src/app-config/supabase';
import type { ReadResult, WriteResult } from '@/src/shared/api/types';
import { toAvatarClass } from '@/src/shared/api/utils';
import { getCurrentUserProfile } from '@/src/features/auth/api/profile.api';

export type MarketplaceItemDto = {
  id: string;
  brand: string;
  title: string;
  value: string;
  pointsCost: number;
  category: 'food' | 'transport' | 'retail' | 'wellness';
  available: boolean;
  initials: string;
  brandColor: string;
};

type RedeemError =
  | 'UNAUTHENTICATED'
  | 'ITEM_UNAVAILABLE'
  | 'INSUFFICIENT_POINTS'
  | 'UNKNOWN';

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

export async function listMarketplaceItems(): Promise<ReadResult<MarketplaceItemDto[]>> {
  const me = await getCurrentUserProfile();
  if (!me) return { data: [] };

  const nowIso = new Date().toISOString();
  const itemsRes = await supabase
    .from('marketplace_items')
    .select(`
      id,
      brand,
      title,
      value_display,
      points_cost,
      category,
      brand_initials,
      brand_color,
      stock_remaining,
      is_active,
      valid_from,
      valid_until,
      company_id
    `)
    .or(`company_id.is.null,company_id.eq.${me.companyId}`)
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('points_cost', { ascending: true });

  if (itemsRes.error) throw itemsRes.error;

  const data: MarketplaceItemDto[] = (itemsRes.data ?? []).map((row: any) => {
    const withinStart = !row.valid_from || row.valid_from <= nowIso;
    const withinEnd = !row.valid_until || row.valid_until >= nowIso;
    const inStock = row.stock_remaining === null || row.stock_remaining > 0;
    return {
      id: row.id,
      brand: row.brand,
      title: row.title,
      value: row.value_display,
      pointsCost: row.points_cost,
      category: row.category,
      available: withinStart && withinEnd && inStock,
      initials: row.brand_initials,
      brandColor: toAvatarClass(row.brand_color),
    };
  });

  return { data };
}

export async function redeemMarketplaceItem(itemId: string): Promise<WriteResult<{ redeemed: boolean }, RedeemError>> {
  const me = await getCurrentUserProfile();
  const userId = await resolveActiveUserId();
  if (!me || !userId) return { data: null, error: 'UNAUTHENTICATED' };

  const itemRes = await supabase
    .from('marketplace_items')
    .select('id, points_cost, stock_remaining, is_active, company_id')
    .eq('id', itemId)
    .maybeSingle();

  if (itemRes.error || !itemRes.data) return { data: null, error: 'ITEM_UNAVAILABLE' };

  const item = itemRes.data;
  const companyMatch = item.company_id === null || item.company_id === me.companyId;
  const inStock = item.stock_remaining === null || item.stock_remaining > 0;
  if (!item.is_active || !companyMatch || !inStock) {
    return { data: null, error: 'ITEM_UNAVAILABLE' };
  }

  const balanceRes = await supabase
    .from('user_balances')
    .select('available_points')
    .eq('id', userId)
    .maybeSingle();

  if (balanceRes.error || !balanceRes.data) return { data: null, error: 'UNKNOWN' };
  if (balanceRes.data.available_points < item.points_cost) {
    return { data: null, error: 'INSUFFICIENT_POINTS' };
  }

  const profileRes = await supabase
    .from('profiles')
    .select('points_spent')
    .eq('id', userId)
    .maybeSingle();

  if (profileRes.error || !profileRes.data) return { data: null, error: 'UNKNOWN' };

  const redemptionRes = await supabase
    .from('redemptions')
    .insert({
      user_id: userId,
      company_id: me.companyId,
      item_id: item.id,
      points_spent: item.points_cost,
      status: 'pending',
    });

  if (redemptionRes.error) return { data: null, error: 'UNKNOWN' };

  const profileUpdateRes = await supabase
    .from('profiles')
    .update({ points_spent: profileRes.data.points_spent + item.points_cost })
    .eq('id', userId);

  if (profileUpdateRes.error) return { data: null, error: 'UNKNOWN' };

  if (item.stock_remaining !== null) {
    await supabase
      .from('marketplace_items')
      .update({ stock_remaining: Math.max(0, item.stock_remaining - 1) })
      .eq('id', item.id);
  }

  await supabase.from('point_transactions').insert({
    user_id: userId,
    company_id: me.companyId,
    activity: 'redemption_spend',
    points: -item.points_cost,
    reference_id: null,
    reference_table: 'redemptions',
    note: `Redeemed item ${item.id}`,
  });

  return { data: { redeemed: true }, error: null };
}
