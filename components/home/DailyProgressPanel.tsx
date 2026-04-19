import { Pressable, View } from 'react-native';
import { AnimatedBar, SegmentedBar } from '@/components/ui/animated-progress';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import { WellnessArc } from '@/components/home/WellnessArc';
import type { HomeDashboardDto } from '@/src/features/home/types';

type Props = {
  wellnessScore: HomeDashboardDto['wellnessScore'];
  dailyProgress: HomeDashboardDto['dailyProgress'];
  waterLogged: number;
  onWaterDecrement: () => void;
  onWaterIncrement: () => void;
  displayedSteps: number;
  stepsPercent: number;
  stepTrackingPaused: boolean;
  stepTrackingLoading: boolean;
  onToggleStepTracking: () => void;
};

export function DailyProgressPanel({
  wellnessScore,
  dailyProgress,
  waterLogged,
  onWaterDecrement,
  onWaterIncrement,
  displayedSteps,
  stepsPercent,
  stepTrackingPaused,
  stepTrackingLoading,
  onToggleStepTracking,
}: Props) {
  return (
    <View className="bg-background px-5 pb-5">
      <Text className="text-foreground text-base font-semibold mb-4">Wellness Score</Text>
      <View className="flex-row items-center gap-4">
        <View className="flex-1 items-center">
          <WellnessArc score={wellnessScore.score} maxScore={wellnessScore.maxScore} label={wellnessScore.label} />
          <View className="flex-row items-center gap-1 mt-1">
            <View className="bg-seegla-green/15 px-2 py-0.5 rounded-full">
              <Text className="text-seegla-green text-xs font-semibold">+{wellnessScore.change}% this week</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 gap-4">
          {/* Water */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-xs font-semibold">Water</Text>
              <Text variant="muted" className="text-xs">{waterLogged}/{dailyProgress.water.goal} glasses</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable onPress={onWaterDecrement} className="w-7 h-7 rounded-full bg-muted items-center justify-center">
                <Text className="text-foreground text-base font-bold">-</Text>
              </Pressable>
              <View className="flex-1">
                <SegmentedBar filled={waterLogged} total={dailyProgress.water.goal} color={COLORS.teal} />
              </View>
              <Pressable onPress={onWaterIncrement} className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-base font-bold">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Steps */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-xs font-semibold">Steps</Text>
              <Text variant="muted" className="text-xs">{stepsPercent}%</Text>
            </View>
            <AnimatedBar value={stepsPercent} color={COLORS.green} delay={200} height="h-2.5" />
            <Text variant="muted" className="text-xs -mt-1">
              {displayedSteps.toLocaleString()} / {dailyProgress.steps.goal.toLocaleString()}
            </Text>
            <View className="flex-row gap-2 mt-1">
              <Button
                size="sm"
                variant={stepTrackingPaused ? 'default' : 'outline'}
                className="rounded-lg h-8 px-3"
                onPress={onToggleStepTracking}
                disabled={stepTrackingLoading}
              >
                <Text className="text-xs">{stepTrackingPaused ? 'Resume' : 'Pause'}</Text>
              </Button>
            </View>
          </View>

          {/* Calories */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-xs font-semibold">Burned Calories</Text>
              <Text variant="muted" className="text-xs">{dailyProgress.calories.current.toLocaleString()} kcal</Text>
            </View>
            <AnimatedBar
              value={Math.round((dailyProgress.calories.current / Math.max(1, dailyProgress.calories.goal)) * 100)}
              color={COLORS.orange}
              delay={400}
              height="h-2.5"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
