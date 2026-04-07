export function toAvatarClass(raw: string | null | undefined): string {
  if (!raw) return 'bg-seegla-teal';
  if (raw.startsWith('bg-')) return raw;

  const normalized = raw.toLowerCase();
  if (normalized.includes('green')) return 'bg-seegla-green';
  if (normalized.includes('orange')) return 'bg-seegla-orange';
  if (normalized.includes('purple')) return 'bg-seegla-purple';
  if (normalized.includes('navy') || normalized.includes('blue')) return 'bg-seegla-navy';
  if (normalized.includes('teal')) return 'bg-seegla-teal';
  return 'bg-seegla-teal';
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function formatTimeAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - ts) / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

