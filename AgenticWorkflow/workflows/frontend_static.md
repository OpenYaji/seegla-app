# Workflow: Static Frontend Build

**Version:** 1.0
**Phase:** Frontend-first (no live database). All data comes from `lib/data/static.ts`.

---

## Objective
Build all app screens using realistic static data so UX and visual design can be validated before Supabase integration.

## Prerequisites
- `lib/utils.ts` — `cn` helper exists
- `lib/constants.ts` — `COLORS`, `FONTS` exports exist
- `components/ui/button.tsx`, `text.tsx`, `progress.tsx` — rn-reusables primitives installed
- `global.css` — CSS variables mapped to Seegla palette
- `tailwind.config.js` — `seegla.*` tokens configured

## Data Layer Rule
All mock data lives in **`lib/data/static.ts`** only.
UI components import from there. Never hardcode data inside screen files.

## Screen Inventory

| Screen | Route | Status |
|--------|-------|--------|
| Home (Engagement Hub) | `app/(tabs)/index.tsx` | - |
| Activity Feed | `app/(tabs)/feed.tsx` | - |
| Challenges | `app/(tabs)/challenges.tsx` | - |
| Leaderboard | `app/(tabs)/leaderboard.tsx` | - |
| Marketplace | `app/(tabs)/marketplace.tsx` | - |

## Execution Steps

1. **Create `lib/data/static.ts`** with: `CURRENT_USER`, `ACTIVITY_FEED`, `CHALLENGES`, `LEADERBOARD`, `MARKETPLACE_ITEMS`.
2. **Update `app/(tabs)/_layout.tsx`** — replace placeholder Expo tabs with 5 Seegla core tabs using lucide icons.
3. **Build each screen** using only `className` (NativeWind v4). No `StyleSheet.create`, no inline `style={{}}`.
4. **Use rn-reusables primitives:** `Button` for all CTAs, `Text` for all copy, `Progress` for progress indicators.
5. **Color rule:** Use semantic tokens (`bg-primary`, `text-foreground`, `bg-seegla-navy`) not raw hex values.

## Migration Path (When Supabase is Ready)
Replace `import { X } from '@/lib/data/static'` with Supabase query hooks.
Screens require zero structural changes — only the data source swaps.
