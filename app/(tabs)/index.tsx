import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Sidebar } from '@/components/home/Sidebar';
import { CheckInModal } from '@/components/home/CheckInModal';
import { CheckInBanner } from '@/components/home/CheckInBanner';
import { PointsCard } from '@/components/home/PointsCard';
import { DailyProgressPanel } from '@/components/home/DailyProgressPanel';
import { WeeklyActivityCard } from '@/components/home/WeeklyActivityCard';
import { ActivityFeed } from '@/components/home/ActivityFeed';
import { HomeScreenSkeleton } from '@/components/home/HomeScreenSkeleton';
import { useHomeDashboard } from '@/src/features/home/hooks/useHomeDashboard';
import { usePedometer } from '@/src/features/home/hooks/usePedometer';

export default function HomeScreen() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    dashboard,
    userData,
    loading,
    waterLogged,
    setWaterLogged,
    level,
    monthLabel,
    weeklyCheckins,
    loadDashboard,
    handleCompleteCheckin,
    handleLogout,
  } = useHomeDashboard();

  const { liveStepCount, stepTrackingLoading, handleToggleStepTracking } = usePedometer(
    dashboard,
    userData.stepTrackingPaused,
    loadDashboard,
  );

  const displayedSteps = Math.max(userData.dailyProgress.steps.current, liveStepCount ?? 0);
  const stepsPercent = Math.round((displayedSteps / Math.max(1, userData.dailyProgress.steps.goal)) * 100);

  return (
    <SafeAreaView className="flex-1 bg-seegla-navy" edges={['top']}>
      <StatusBar style="light" />

      {loading ? (
        <HomeScreenSkeleton />
      ) : (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
          {/* Header */}
          <View className="bg-seegla-navy px-5 pt-3 pb-16">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/60 text-xs uppercase tracking-widest">Good morning</Text>
                <Text className="text-white text-2xl font-bold mt-0.5">{userData.firstName} 👋</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Pressable onPress={() => router.push('/modal')} className="relative">
                  <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center">
                    <Bell size={18} color="rgba(255,255,255,0.85)" />
                  </View>
                  <View className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-seegla-orange border-2 border-seegla-navy" />
                </Pressable>
                <Pressable onPress={() => setSidebarOpen(true)}>
                  <View className={`w-10 h-10 rounded-full ${userData.avatarColor} items-center justify-center border-2 border-white/30`}>
                    <Text className="text-white text-sm font-bold">{userData.initials}</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>

          <PointsCard userData={userData} level={level} />

          <View className="h-2 bg-muted" />

          <CheckInBanner checkIn={userData.checkIn} onStart={() => setShowCheckIn(true)} />

          <View className="h-2 bg-muted mt-3" />

          <DailyProgressPanel
            wellnessScore={userData.wellnessScore}
            dailyProgress={userData.dailyProgress}
            waterLogged={waterLogged}
            onWaterDecrement={() => setWaterLogged((v) => Math.max(0, v - 1))}
            onWaterIncrement={() => setWaterLogged((v) => Math.min(userData.dailyProgress.water.goal, v + 1))}
            displayedSteps={displayedSteps}
            stepsPercent={stepsPercent}
            stepTrackingPaused={userData.stepTrackingPaused}
            stepTrackingLoading={stepTrackingLoading}
            onToggleStepTracking={handleToggleStepTracking}
          />

          <View className="h-2 bg-muted" />

          <WeeklyActivityCard
            weeklyActivity={userData.weeklyActivity}
            weeklyCheckins={weeklyCheckins}
            streak={userData.streak}
            monthLabel={monthLabel}
          />

          <View className="h-2 bg-muted" />

          <ActivityFeed activityFeed={userData.activityFeed} loading={loading} />
        </ScrollView>
      )}

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={userData}
        onLogout={async () => { setSidebarOpen(false); await handleLogout(); }}
      />

      <CheckInModal
        visible={showCheckIn}
        checkIn={userData.checkIn}
        onComplete={handleCompleteCheckin}
        onClose={() => setShowCheckIn(false)}
      />
    </SafeAreaView>
  );
}
