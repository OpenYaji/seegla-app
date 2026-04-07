# Seegla Project Guidelines

## 1. Visual Identity (Color & Typography)

### Core Color Palette
[cite_start]The design system follows a strict **60/25/10/3/2 ratio** to maintain a professional, clean, and motivating interface[cite: 72, 74].

| Element | Color | Hex | Role |
| :--- | :--- | :--- | :--- |
| **Background** | Light Gray | `#F7F9FC` | [cite_start]Main app background[cite: 21, 44]. |
| **Headings/Text**| Navy | `#0A2E5C` | [cite_start]Brand anchor; titles, navigation, and key numbers [cite: 4, 68-71, 84]. |
| **Primary Action**| Teal | `#16A085` | [cite_start]Primary buttons and engagement[cite: 4, 45]. |
| **Progress** | Green | `#4CAF7A` | [cite_start]Health outcomes and progress indicators[cite: 46, 62, 102]. |
| **Rewards** | Orange | `#F59E0B` | [cite_start]**Rule:** Only appears when something good happens[cite: 11, 13, 47]. |

### Decorative Gradients
* [cite_start]**Palette:** Purple (#6C4DD9) → Teal (#16A085) → Amber (#F59E0B)[cite: 27, 29].
* [cite_start]**Usage:** High-engagement areas only (Reward cards, progress rings, celebration animations, and onboarding) [cite: 25, 30-35, 48].
* [cite_start]**Restriction:** Avoid in data dashboards, tables, or HR reports [cite: 36-40].

### Typography
* [cite_start]**Primary Font (Inter):** Used for App UI, buttons, and body text [cite: 111, 117-121].
* [cite_start]**Secondary Font (Poppins):** Reserved for reward cards and marketing banners[cite: 136, 140].
* [cite_start]**Key Metric Style:** Bold, Navy (#0A2E5C) for important numbers [cite: 156-158].

---

## 2. App Structure & User Experience

### Home Screen (Engagement Hub)
* [cite_start]**Top Section:** Greeting and a "Streak" indicator that activates after 3 days [cite: 202-206].
* [cite_start]**Daily Check-in Card:** 3 quick questions regarding mood, energy, and sleep [cite: 207-214].
* [cite_start]**Daily Promo Hour:** A highly visible card for unlocking daily rewards [cite: 218-221].
* [cite_start]**Progress Section:** Daily goal rings for steps and hydration [cite: 231-235].

### Core Tabs
* [cite_start]**Activity Feed:** Social layer for posts, likes, and "Celebrate" interactions [cite: 237, 250-253].
* [cite_start]**Challenges:** Daily, weekly, and team challenges with point rewards [cite: 255-259, 264-265].
* [cite_start]**Leaderboard:** Individual, Department, and Company rankings [cite: 267-271].
* [cite_start]**Marketplace:** Redemption center for converting points to real vouchers [cite: 276-277].

---

## 3. Onboarding Workflow (90-Second Goal)
[cite_start]The goal is to reach the first reward within 60 seconds[cite: 343, 465].

1.  [cite_start]**Welcome:** Introduce value (Stay healthy, earn rewards) [cite: 346-351].
2.  [cite_start]**Verification:** Join via company email or QR code [cite: 361-364].
3.  [cite_start]**Profile & Health:** Quick setup (<20s) and health data connection [cite: 373-375, 385-388].
4.  [cite_start]**First Win:** Complete the first check-in (+10 pts) and unlock the Promo Hour reward [cite: 396-407, 409-416].
5.  [cite_start]**Engagement:** Join the first challenge and view the leaderboard [cite: 425-432, 434].

---

## 4. Operational Microcopy
* [cite_start]**Greetings:** "Good morning, [Name]! Let's make today count." [cite: 499]
* [cite_start]**Team Nudge:** "Your team is [X] points ahead, let's catch up!" [cite: 538]
* [cite_start]**Reward Claim:** "Unlock your first reward today." [cite: 414]
* [cite_start]**Empty State:** "No challenges scheduled, check back tomorrow for more ways to stay healthy." [cite: 506]

---

## 5. Implementation Notes for Agents
* [cite_start]**Accessibility:** Maintain a minimum 4.5:1 contrast ratio for all text[cite: 90].
* [cite_start]**Buttons:** Always use Medium (500) weight; avoid long text [cite: 126, 170-171, 176].
* [cite_start]**Iconography:** Color-code by category: Health (Green), Engagement (Teal), Rewards (Orange), Insights (Navy) [cite: 91-97].