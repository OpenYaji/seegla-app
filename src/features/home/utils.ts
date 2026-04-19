export function getLevel(pts: number): { label: string; emoji: string } {
  if (pts >= 2000) return { label: 'Platinum', emoji: '💎' };
  if (pts >= 1000) return { label: 'Gold', emoji: '🥇' };
  if (pts >= 500) return { label: 'Silver', emoji: '🥈' };
  return { label: 'Bronze', emoji: '🥉' };
}

export function getMonthLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
