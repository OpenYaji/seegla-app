/**
 * Static mock data — frontend-first phase.
 * Replace imports with Supabase query hooks once the DB schema is ready.
 * All names, companies, and amounts are realistic Philippine context.
 */

// ─── Current user ─────────────────────────────────────────────────────────────

export const CURRENT_USER = {
  id: 'u1',
  name: 'Jenzele Cruz',
  firstName: 'Jenzele',
  role: 'Marketing Associate',
  department: 'Marketing',
  company: 'Aboitiz Equity Ventures',
  points: 1_240,
  streak: 5,
  rank: 4,
  initials: 'JC',
  avatarColor: 'bg-seegla-teal',
};

// ─── Daily check-in ───────────────────────────────────────────────────────────

export const CHECK_IN = {
  completed: false,
  pointsReward: 10,
  questions: ['How is your mood today?', 'How is your energy level?', 'How well did you sleep?'],
};

// ─── Daily progress ───────────────────────────────────────────────────────────

export const DAILY_PROGRESS = {
  steps:     { current: 6_450, goal: 8_000,  unit: 'steps', label: 'Steps' },
  water:     { current: 4,     goal: 8,      unit: 'glasses', label: 'Water' },
  calories:  { current: 1_820, goal: 2_200,  unit: 'kcal', label: 'Calories' },
};

// ─── Activity feed ────────────────────────────────────────────────────────────

export type FeedPost = {
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
};

export const ACTIVITY_FEED: FeedPost[] = [
  {
    id: 'f1',
    author: 'Marco Santos',
    initials: 'MS',
    avatarColor: 'bg-seegla-purple',
    department: 'Engineering',
    timeAgo: '2m ago',
    activity: 'completed a challenge',
    detail: '🏃 Hit 10,000 steps — Daily Steps Challenge',
    likes: 8,
    likedByMe: false,
  },
  {
    id: 'f2',
    author: 'Ana Reyes',
    initials: 'AR',
    avatarColor: 'bg-seegla-green',
    department: 'Human Resources',
    timeAgo: '15m ago',
    activity: 'earned a reward',
    detail: '🎉 Unlocked ₱150 Grab voucher from Promo Hour!',
    likes: 14,
    likedByMe: true,
  },
  {
    id: 'f3',
    author: 'Paolo Mendoza',
    initials: 'PM',
    avatarColor: 'bg-seegla-navy',
    department: 'Sales',
    timeAgo: '1h ago',
    activity: 'checked in',
    detail: '✅ Completed today\'s Daily Check-in (+10 pts)',
    likes: 5,
    likedByMe: false,
  },
  {
    id: 'f4',
    author: 'Carla Bautista',
    initials: 'CB',
    avatarColor: 'bg-primary',
    department: 'Finance',
    timeAgo: '2h ago',
    activity: 'joined a challenge',
    detail: '💧 Joined the 8 Glasses a Day — Hydration Challenge',
    likes: 3,
    likedByMe: false,
  },
];

// ─── Challenges ───────────────────────────────────────────────────────────────

export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'team';
  points: number;
  progress: number;   // 0–100
  joined: boolean;
  daysLeft?: number;
  participants?: number;
};

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: '10,000 Steps',
    description: 'Hit your daily step goal to earn points.',
    type: 'daily',
    points: 50,
    progress: 64,
    joined: true,
  },
  {
    id: 'c2',
    title: '8 Glasses a Day',
    description: 'Stay hydrated — log 8 glasses of water today.',
    type: 'daily',
    points: 30,
    progress: 50,
    joined: true,
  },
  {
    id: 'c3',
    title: 'Morning Stretch Week',
    description: 'Complete a 5-min stretch every morning for 7 days.',
    type: 'weekly',
    points: 200,
    progress: 43,
    joined: true,
    daysLeft: 4,
  },
  {
    id: 'c4',
    title: 'Zero Sugar Challenge',
    description: 'Avoid sugary drinks for the entire week.',
    type: 'weekly',
    points: 150,
    progress: 0,
    joined: false,
    daysLeft: 7,
  },
  {
    id: 'c5',
    title: 'Marketing Department Walk',
    description: 'Your team collectively logs 100,000 steps this week.',
    type: 'team',
    points: 500,
    progress: 72,
    joined: true,
    daysLeft: 3,
    participants: 12,
  },
  {
    id: 'c6',
    title: 'Mindfulness Minutes',
    description: 'Log 10 mins of meditation with your team daily.',
    type: 'team',
    points: 300,
    progress: 0,
    joined: false,
    participants: 8,
  },
];

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export type LeaderboardEntry = {
  rank: number;
  name: string;
  initials: string;
  avatarColor: string;
  department: string;
  points: number;
  isCurrentUser?: boolean;
};

export const LEADERBOARD_INDIVIDUAL: LeaderboardEntry[] = [
  { rank: 1, name: 'Marco Santos',   initials: 'MS', avatarColor: 'bg-seegla-purple', department: 'Engineering', points: 2_100 },
  { rank: 2, name: 'Ana Reyes',      initials: 'AR', avatarColor: 'bg-seegla-green',  department: 'HR',          points: 1_890 },
  { rank: 3, name: 'Paolo Mendoza',  initials: 'PM', avatarColor: 'bg-seegla-navy',   department: 'Sales',       points: 1_650 },
  { rank: 4, name: 'Jenzele Cruz',   initials: 'JC', avatarColor: 'bg-seegla-teal',   department: 'Marketing',   points: 1_240, isCurrentUser: true },
  { rank: 5, name: 'Carla Bautista', initials: 'CB', avatarColor: 'bg-primary',       department: 'Finance',     points: 1_100 },
  { rank: 6, name: 'Rico Domingo',   initials: 'RD', avatarColor: 'bg-seegla-orange', department: 'Operations',  points: 980 },
  { rank: 7, name: 'Liza Tan',       initials: 'LT', avatarColor: 'bg-seegla-purple', department: 'Legal',       points: 870 },
];

export const LEADERBOARD_DEPARTMENT: LeaderboardEntry[] = [
  { rank: 1, name: 'Engineering',  initials: 'EN', avatarColor: 'bg-seegla-navy',   department: '18 members', points: 24_800 },
  { rank: 2, name: 'Sales',        initials: 'SA', avatarColor: 'bg-seegla-teal',   department: '22 members', points: 21_450 },
  { rank: 3, name: 'HR',           initials: 'HR', avatarColor: 'bg-seegla-green',  department: '9 members',  points: 18_300 },
  { rank: 4, name: 'Marketing',    initials: 'MK', avatarColor: 'bg-seegla-purple', department: '14 members', points: 15_600, isCurrentUser: true },
  { rank: 5, name: 'Finance',      initials: 'FN', avatarColor: 'bg-primary',       department: '11 members', points: 12_100 },
];

// ─── Wellness score ───────────────────────────────────────────────────────────

export const WELLNESS_SCORE = {
  score:    6.5,
  maxScore: 10,
  label:    'Good',
  change:   +13,   // percentage change vs last week
};

// ─── Weekly training calendar (Mon–Sun of current week) ───────────────────────

export const WEEKLY_ACTIVITY = [
  { day: 'M', date: 17, checkedIn: true,  steps: 8_420 },
  { day: 'T', date: 18, checkedIn: true,  steps: 7_100 },
  { day: 'W', date: 19, checkedIn: false, steps: 3_200 },
  { day: 'T', date: 20, checkedIn: true,  steps: 6_450, isToday: true },
  { day: 'F', date: 21, checkedIn: false, steps: 0 },
  { day: 'S', date: 22, checkedIn: false, steps: 0 },
  { day: 'S', date: 23, checkedIn: false, steps: 0 },
] as const;

// ─── Marketplace ──────────────────────────────────────────────────────────────

export type MarketplaceItem = {
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

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'm1',
    brand: 'GrabFood',
    title: '₱150 GrabFood Voucher',
    value: '₱150',
    pointsCost: 500,
    category: 'food',
    available: true,
    initials: 'GF',
    brandColor: 'bg-seegla-green',
  },
  {
    id: 'm2',
    brand: 'Jollibee',
    title: '₱100 Jollibee GC',
    value: '₱100',
    pointsCost: 350,
    category: 'food',
    available: true,
    initials: 'JB',
    brandColor: 'bg-seegla-orange',
  },
  {
    id: 'm3',
    brand: 'SM Store',
    title: '₱200 SM Gift Card',
    value: '₱200',
    pointsCost: 700,
    category: 'retail',
    available: true,
    initials: 'SM',
    brandColor: 'bg-seegla-navy',
  },
  {
    id: 'm4',
    brand: 'Angkas',
    title: '₱75 Angkas Ride Credit',
    value: '₱75',
    pointsCost: 250,
    category: 'transport',
    available: true,
    initials: 'AK',
    brandColor: 'bg-seegla-teal',
  },
  {
    id: 'm5',
    brand: 'Anytime Fitness',
    title: '1-Week Guest Pass',
    value: '1 Week',
    pointsCost: 800,
    category: 'wellness',
    available: true,
    initials: 'AF',
    brandColor: 'bg-seegla-purple',
  },
  {
    id: 'm6',
    brand: 'Watsons',
    title: '₱100 Watsons Voucher',
    value: '₱100',
    pointsCost: 350,
    category: 'wellness',
    available: false,
    initials: 'WA',
    brandColor: 'bg-primary',
  },
];
