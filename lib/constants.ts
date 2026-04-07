/**
 * Seegla Design System — Theme Constants
 * Source of truth: AgenticWorkflow/workflows/SEEGLA_GUIDELINES.MD
 * Ratio rule: 60 / 25 / 10 / 3 / 2
 */

export const COLORS = {
  /** 60% — Main app background */
  background: '#F7F9FC',

  /** 25% — Brand anchor: headings, navigation, key numbers */
  navy: '#0A2E5C',

  /** 10% — Primary action buttons and engagement CTAs */
  teal: '#16A085',

  /** 3% — Health outcomes and progress indicators */
  green: '#4CAF7A',

  /** 2% — Rewards ONLY: unlocked rewards or points earned */
  orange: '#F59E0B',

  /** Decorative gradient: Purple → Teal → Amber */
  gradient: {
    purple: '#6C4DD9',
    teal: '#16A085',
    amber: '#F59E0B',
  },

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const FONTS = {
  /** App UI, buttons, and body text */
  sans: 'Inter',
  /** Reward cards and marketing banners only */
  marketing: 'Poppins',
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Minimum contrast ratio per WCAG AA */
export const MIN_CONTRAST_RATIO = 4.5;
