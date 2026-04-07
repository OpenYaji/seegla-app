/**
 * SEEGLA — Supabase Database Types
 * Hand-authored to match supabase/migrations/20260407000000_initial_schema.sql
 * Replace with `supabase gen types typescript` once the project is linked.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type PointActivity =
  | 'daily_checkin'
  | 'steps_2000'
  | 'steps_5000'
  | 'steps_8000'
  | 'steps_10000'
  | 'daily_login_streak'
  | 'streak_7_day_bonus'
  | 'streak_14_day_bonus'
  | 'streak_30_day_bonus'
  | 'promo_hour_drop'
  | 'weekly_challenge_completion'
  | 'monthly_leaderboard_winner'
  | 'team_challenge_winner'
  | 'redemption_spend'
  | 'manual_admin_adjustment';

export type ChallengeType     = 'daily' | 'weekly' | 'team';
export type ChallengeScope    = 'individual' | 'department' | 'company';
export type HealthPlatform    = 'apple_health' | 'google_fit' | 'fitbit' | 'manual';
export type MarketplaceCategory = 'food' | 'transport' | 'retail' | 'wellness';
export type RedemptionStatus  = 'pending' | 'fulfilled' | 'cancelled' | 'expired';
export type UserLevel         = 'bronze' | 'silver' | 'gold' | 'platinum';
export type ReactionType      = 'like' | 'celebrate';
export type FeedPostType      =
  | 'challenge_completed'
  | 'reward_earned'
  | 'checkin_completed'
  | 'challenge_joined'
  | 'step_milestone'
  | 'user_post';
export type NotificationType  =
  | 'checkin_reminder'
  | 'hydration_reminder'
  | 'meditation_reminder'
  | 'promo_hour_teaser'
  | 'promo_hour_drop'
  | 'missed_checkin'
  | 'challenge_joined'
  | 'challenge_completed'
  | 'reward_redeemed';

// ─── Tables ───────────────────────────────────────────────────────────────────

export interface Company {
  id:          string;
  name:        string;
  slug:        string;
  logo_url:    string | null;
  timezone:    string;
  promo_hour:  string;             // 'HH:MM:SS'
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
}

export interface Department {
  id:         string;
  company_id: string;
  name:       string;
  created_at: string;
}

export interface Profile {
  id:                   string;   // matches auth.users.id
  company_id:           string;
  department_id:        string | null;
  full_name:            string;
  initials:             string;
  avatar_color:         string;
  role:                 string | null;
  email:                string;
  total_points:         number;
  points_spent:         number;
  current_streak:       number;
  longest_streak:       number;
  level:                UserLevel;
  health_platform:      HealthPlatform | null;
  health_connected:     boolean;
  onboarding_completed: boolean;
  created_at:           string;
  updated_at:           string;
}

export interface WellnessInterest {
  id:    string;
  label: string;
  emoji: string;
}

export interface UserWellnessInterest {
  user_id:     string;
  interest_id: string;
}

export interface PushToken {
  id:         string;
  user_id:    string;
  token:      string;
  platform:   'ios' | 'android';
  is_active:  boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckin {
  id:                  string;
  user_id:             string;
  company_id:          string;
  checkin_date:        string;     // 'YYYY-MM-DD'
  mood_score:          number;     // 1–5
  energy_score:        number;     // 1–5
  stress_score:        number;     // 1–5
  wellness_score:      number;     // generated: avg of 3 scores
  promo_hour_eligible: boolean;
  promo_hour_claimed:  boolean;
  completed_at:        string;
}

export interface DailyStepRecord {
  id:                      string;
  user_id:                 string;
  company_id:              string;
  record_date:             string;
  step_count:              number;
  platform:                HealthPlatform;
  milestone_2000_awarded:  boolean;
  milestone_5000_awarded:  boolean;
  milestone_8000_awarded:  boolean;
  milestone_10000_awarded: boolean;
  synced_at:               string;
}

export interface StreakSnapshot {
  id:            string;
  user_id:       string;
  streak_count:  number;
  snapshot_date: string;
  broken:        boolean;
  created_at:    string;
}

export interface PointTransaction {
  id:              string;
  user_id:         string;
  company_id:      string;
  activity:        PointActivity;
  points:          number;         // positive = earned, negative = spent
  reference_id:    string | null;
  reference_table: string | null;
  note:            string | null;
  created_at:      string;
}

export interface PromoHourDrop {
  id:             string;
  user_id:        string;
  company_id:     string;
  drop_date:      string;
  points_awarded: number;          // 15–30
  transaction_id: string | null;
  notified_at:    string | null;
  created_at:     string;
}

export interface Challenge {
  id:               string;
  company_id:       string;
  department_id:    string | null;
  title:            string;
  description:      string;
  type:             ChallengeType;
  scope:            ChallengeScope;
  points_reward:    number;
  starts_at:        string;
  ends_at:          string;
  max_participants: number | null;
  is_active:        boolean;
  created_at:       string;
  updated_at:       string;
}

export interface UserChallenge {
  id:             string;
  user_id:        string;
  challenge_id:   string;
  company_id:     string;
  progress:       number;          // 0–100
  completed:      boolean;
  completed_at:   string | null;
  points_awarded: number | null;
  joined_at:      string;
}

export interface LeaderboardWeeklySnapshot {
  id:            string;
  company_id:    string;
  user_id:       string;
  department_id: string | null;
  week_start:    string;           // 'YYYY-MM-DD' Monday
  points_earned: number;
  rank:          number | null;
  created_at:    string;
}

export interface MarketplaceItem {
  id:              string;
  company_id:      string | null;  // null = global catalog
  brand:           string;
  title:           string;
  description:     string | null;
  value_display:   string;
  points_cost:     number;
  category:        MarketplaceCategory;
  brand_initials:  string;
  brand_color:     string;
  stock_total:     number | null;
  stock_remaining: number | null;
  is_active:       boolean;
  valid_from:      string | null;
  valid_until:     string | null;
  created_at:      string;
  updated_at:      string;
}

export interface Redemption {
  id:             string;
  user_id:        string;
  company_id:     string;
  item_id:        string;
  points_spent:   number;
  status:         RedemptionStatus;
  voucher_code:   string | null;
  fulfilled_at:   string | null;
  expires_at:     string | null;
  transaction_id: string | null;
  created_at:     string;
  updated_at:     string;
}

export interface FeedPost {
  id:              string;
  user_id:         string;
  company_id:      string;
  post_type:       FeedPostType;
  content:         string | null;
  auto_detail:     string | null;
  reference_id:    string | null;
  reference_table: string | null;
  like_count:      number;
  celebrate_count: number;
  is_visible:      boolean;
  created_at:      string;
}

export interface FeedReaction {
  id:         string;
  post_id:    string;
  user_id:    string;
  reaction:   ReactionType;
  created_at: string;
}

export interface Story {
  id:         string;
  user_id:    string;
  company_id: string;
  media_url:  string;
  expires_at: string;
  view_count: number;
  created_at: string;
}

export interface StoryView {
  story_id:  string;
  viewer_id: string;
  viewed_at: string;
}

export interface NotificationLog {
  id:           string;
  user_id:      string;
  company_id:   string;
  type:         NotificationType;
  title:        string;
  body:         string;
  reference_id: string | null;
  sent_at:      string;
  opened_at:    string | null;
}

// ─── Views ───────────────────────────────────────────────────────────────────

export interface UserBalance {
  id:               string;
  company_id:       string;
  department_id:    string | null;
  full_name:        string;
  initials:         string;
  avatar_color:     string;
  total_points:     number;
  points_spent:     number;
  available_points: number;
  current_streak:   number;
  longest_streak:   number;
  level:            UserLevel;
}

export interface WeeklyWellnessScore {
  user_id:            string;
  company_id:         string;
  week_start:         string;
  avg_wellness_score: number;
  avg_mood:           number;
  avg_energy:         number;
  avg_stress:         number;
  checkin_count:      number;
}

export interface DepartmentLeaderboardRow {
  department_id:          string;
  department_name:        string;
  company_id:             string;
  member_count:           number;
  total_points:           number;
  avg_points_per_member:  number;
  dept_rank:              number;
}

// ─── Database schema type (for createClient<Database>()) ─────────────────────

export interface Database {
  public: {
    Tables: {
      companies:                    { Row: Company;                    Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Company>; };
      departments:                  { Row: Department;                 Insert: Omit<Department, 'id' | 'created_at'>; Update: Partial<Department>; };
      profiles:                     { Row: Profile;                    Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile>; };
      wellness_interests:           { Row: WellnessInterest;           Insert: WellnessInterest; Update: Partial<WellnessInterest>; };
      user_wellness_interests:      { Row: UserWellnessInterest;       Insert: UserWellnessInterest; Update: never; };
      push_tokens:                  { Row: PushToken;                  Insert: Omit<PushToken, 'id' | 'created_at' | 'updated_at'>; Update: Partial<PushToken>; };
      daily_checkins:               { Row: DailyCheckin;               Insert: Omit<DailyCheckin, 'id' | 'wellness_score' | 'completed_at'>; Update: Partial<DailyCheckin>; };
      daily_step_records:           { Row: DailyStepRecord;            Insert: Omit<DailyStepRecord, 'id' | 'synced_at'>; Update: Partial<DailyStepRecord>; };
      streak_snapshots:             { Row: StreakSnapshot;              Insert: Omit<StreakSnapshot, 'id' | 'created_at'>; Update: never; };
      point_transactions:           { Row: PointTransaction;           Insert: Omit<PointTransaction, 'id' | 'created_at'>; Update: never; };
      promo_hour_drops:             { Row: PromoHourDrop;              Insert: Omit<PromoHourDrop, 'id' | 'created_at'>; Update: Partial<PromoHourDrop>; };
      challenges:                   { Row: Challenge;                  Insert: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Challenge>; };
      user_challenges:              { Row: UserChallenge;              Insert: Omit<UserChallenge, 'id' | 'joined_at'>; Update: Partial<UserChallenge>; };
      leaderboard_weekly_snapshots: { Row: LeaderboardWeeklySnapshot;  Insert: Omit<LeaderboardWeeklySnapshot, 'id' | 'created_at'>; Update: Partial<LeaderboardWeeklySnapshot>; };
      marketplace_items:            { Row: MarketplaceItem;            Insert: Omit<MarketplaceItem, 'id' | 'created_at' | 'updated_at'>; Update: Partial<MarketplaceItem>; };
      redemptions:                  { Row: Redemption;                 Insert: Omit<Redemption, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Redemption>; };
      feed_posts:                   { Row: FeedPost;                   Insert: Omit<FeedPost, 'id' | 'like_count' | 'celebrate_count' | 'created_at'>; Update: Partial<FeedPost>; };
      feed_reactions:               { Row: FeedReaction;               Insert: Omit<FeedReaction, 'id' | 'created_at'>; Update: never; };
      stories:                      { Row: Story;                      Insert: Omit<Story, 'id' | 'view_count' | 'created_at'>; Update: Partial<Story>; };
      story_views:                  { Row: StoryView;                  Insert: StoryView; Update: never; };
      notification_log:             { Row: NotificationLog;            Insert: Omit<NotificationLog, 'id' | 'sent_at'>; Update: Partial<NotificationLog>; };
    };
    Views: {
      user_balances:            { Row: UserBalance; };
      weekly_wellness_scores:   { Row: WeeklyWellnessScore; };
      department_leaderboard:   { Row: DepartmentLeaderboardRow; };
    };
    Enums: {
      point_activity:       PointActivity;
      challenge_type:       ChallengeType;
      challenge_scope:      ChallengeScope;
      health_platform:      HealthPlatform;
      marketplace_category: MarketplaceCategory;
      redemption_status:    RedemptionStatus;
      user_level:           UserLevel;
      reaction_type:        ReactionType;
      feed_post_type:       FeedPostType;
      notification_type:    NotificationType;
    };
  };
}
