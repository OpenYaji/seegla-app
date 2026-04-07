02
Daily Burnout Check-in
Dev 1 + Dev 2
Must Have


How It Works
Every day at 7AM, employees receive a push notification prompting them to complete their daily wellness check-in. The check-in consists of 3 quick questions that take under 60 seconds to complete. Responses are stored and used to calculate the employee's daily wellness score and the company's overall burnout index shown on the CEO dashboard.

The 3 Check-in Questions
Question 1
How are you feeling today? (Scale 1-5: Very Bad / Bad / Okay / Good / Great)
Question 2
How is your energy level? (Scale 1-5: Exhausted / Tired / Neutral / Energized / Fully Charged)
Question 3
How is your stress level? (Scale 1-5: Overwhelmed / Stressed / Manageable / Calm / Relaxed)


Points & Scoring
Completing check-in earns: +10 points (regardless of answers — no judgment on responses)
Completing check-in also unlocks access to the 8PM Promo Hour Points Drop
Answers are NEVER shown individually to employers — only aggregated as team/department scores

Technical Requirements
Trigger
7AM push notification daily
Time Limit
Check-in available from 7AM to 11:59PM — expires at midnight
Response Storage
Stored per employee per day — used for dashboard aggregation
Anonymization
Individual responses never exposed to employer — dashboard shows averages only
Streak Tracking
Consecutive daily check-ins tracked for streak counter and bonus points



03
Step Tracker Integration
Dev 1 + Dev 2
Must Have


How It Works
The app connects to the device's native health platform — Google Fit on Android, Apple Health on iOS — to automatically read daily step count. No manual input required. Steps are synced once per day and converted to points based on milestone thresholds.

Step Milestones & Points
Steps Completed
Points Awarded
Notes
2,000 steps
+5 pts
Minimum threshold
5,000 steps
+10 pts
Moderate activity
8,000 steps
+15 pts
Active day
10,000 steps
+20 pts
Maximum daily award


Technical Requirements
Android
Google Fit API or Health Connect API
iOS
Apple HealthKit
Sync Frequency
Once daily — syncs at end of day or on app open after 8PM
Permission
Requested during onboarding — skippable (step points not earned if skipped)
Fallback
If permission denied, step tracker section shows as locked with prompt to enable



04
Points Engine
Dev 1 (Backend)
Must Have — Core System


Overview
The Points Engine is the backbone of all engagement mechanics in Seegla. Every point-earning activity runs through this system. It calculates points, applies multipliers, tracks streaks, and feeds the leaderboard in real time.

Complete Points Table
Activity
Points
Limit
Daily Burnout Check-in
+10 pts
Once per day
Steps — 2,000 threshold
+5 pts
Once per day
Steps — 5,000 threshold
+10 pts
Once per day
Steps — 8,000 threshold
+15 pts
Once per day
Steps — 10,000 threshold
+20 pts
Once per day
Daily Login Streak
+5 pts/day
Every consecutive day
7-Day Streak Bonus
+50 pts
Once per 7-day cycle
14-Day Streak Bonus
+100 pts
Once per 14-day cycle
30-Day Streak Bonus
+200 pts
Once per 30-day cycle
8PM Promo Hour Points Drop
+15 to +30 pts
Once per day (check-in required)
Weekly Challenge Completion
+25 pts
Once per week per challenge
Monthly Leaderboard Winner
+100 pts
Once per month
Team Challenge Winner
+75 pts
Once per challenge


Important Rules
Points are ONLY awarded for verifiable activities — no manual override by employees
Check-in must be completed before 8PM to unlock the Promo Hour Points Drop
Streak resets at midnight if check-in is missed — no retroactive streak recovery
Points never expire — they accumulate until redeemed
Employers set what points are worth — Seegla does not define the redemption value

Streak Logic
Streak Start
Day 1 check-in completed
Streak Continue
Check-in completed before midnight each consecutive day
Streak Break
Missed check-in at midnight — streak resets to 0
Streak Display
Shown on home screen with fire emoji and day count
Grace Period
None at beta — consider adding later based on user feedback



05
8PM Promo Hour Points Drop
Dev 1 (Backend)
Must Have


How It Works
Every night at 8PM, employees who completed their daily check-in receive a bonus points drop. This is the most anticipated moment of the day — it creates a nightly ritual that drives daily check-in completion. The points drop is automated by the backend and delivered via push notification.

The Flow
Gate 1
Employee must complete daily burnout check-in before 8PM
Gate 2 (Optional)
Employee must have minimum 50 points balance — consider adding this in Phase 2
Trigger
8PM server-side cron job runs — awards points to all eligible employees
Points Drop
Random between 15 and 30 points — keeps it exciting
Notification
Push notification: 'Your Promo Hour points are ready! Tap to see your reward.'
Display
Animated points counter on home screen shows new points arriving


Technical Requirements
Server-side cron job triggers at 8PM Philippine Standard Time (UTC+8) daily
Job queries all employees who completed check-in that day
Generates random point value (15-30) per eligible employee
Updates each employee's point balance in database
Sends push notification to each eligible employee
Ineligible employees receive a different notification: 'Complete tomorrow's check-in by 8PM to unlock your Promo Hour rewards'


06
Leaderboard
Dev 2 (Frontend)
Must Have


How It Works
The leaderboard shows employee rankings within their company based on total points accumulated. It updates in real time as points are earned. Employees can see their own rank, the ranks of teammates, and their points relative to others. This drives healthy competition and team engagement.

Leaderboard Types
Individual — Weekly
Points earned in the current week — resets every Monday at midnight
Individual — All Time
Total cumulative points since account creation — never resets
Department
Average wellness score per department — shown on CEO dashboard
Team Challenge
Points earned by team during a specific challenge period


Display Requirements
Top 10 employees shown with rank number, name, avatar initials, and points
Current user's rank always visible — even if outside top 10
Gold / Silver / Bronze medals for ranks 1, 2, 3
Points difference shown: 'You are 45 pts behind #2'
Weekly leaderboard is default view — all-time accessible via tab
Leaderboard refreshes every time user opens the screen


07
Push Notifications
Dev 1 (Backend)
Must Have


Notification Schedule
Time
Type
Message
7:00 AM
Check-in Reminder
Good morning! Time for your daily wellness check-in. It only takes 60 seconds. +10 pts waiting for you.
12:00 PM
Hydration Reminder
Drink a glass of water! Staying hydrated keeps you sharp and energized. 💧
3:00 PM
Meditation Reminder
Take a 2-minute breathing break. Your mind will thank you. 🧘
7:30 PM
Promo Hour Teaser
Promo Hour starts in 30 minutes! Complete your check-in now to unlock your rewards.
8:00 PM
Promo Hour Drop
Your Promo Hour points are ready! Tap to claim your reward tonight. 🎁
8:01 PM
Missed Check-in
(Only if check-in not done) You missed tonight's Promo Hour. Complete tomorrow's check-in by 8PM to unlock rewards.

