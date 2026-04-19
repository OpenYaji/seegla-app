import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { HomeDashboardDto } from '@/src/features/home/types';

type Props = {
  weeklyActivity: HomeDashboardDto['weeklyActivity'];
  weeklyCheckins: number;
  streak: number;
  monthLabel: string;
};

export function WeeklyActivityCard({ weeklyActivity, weeklyCheckins, streak, monthLabel }: Props) {
  const totalStepsK = Math.round(weeklyActivity.reduce((a, d) => a + d.steps, 0) / 1000);

  return (
    <View className="bg-background px-5 py-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-foreground text-base font-semibold">This Week</Text>
        <Text variant="muted" className="text-xs">{monthLabel}</Text>
      </View>

      <View className="flex-row justify-between mb-5">
        {weeklyActivity.map((d, idx) => (
          <View key={`${d.date}-${idx}`} className="items-center gap-1.5">
            <Text variant="muted" className="text-xs font-medium">{d.day}</Text>
            <View
              className={`w-9 h-9 rounded-full items-center justify-center ${
                d.isToday ? 'bg-seegla-navy' : d.checkedIn ? 'bg-seegla-teal/15' : 'bg-muted'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  d.isToday ? 'text-white' : d.checkedIn ? 'text-seegla-teal' : 'text-muted-foreground'
                }`}
              >
                {d.date}
              </Text>
            </View>
            <View className={`w-1.5 h-1.5 rounded-full ${d.checkedIn ? 'bg-seegla-green' : 'bg-transparent'}`} />
          </View>
        ))}
      </View>

      <View className="flex-row bg-muted rounded-xl overflow-hidden">
        <View className="flex-1 items-center py-3">
          <Text className="text-foreground text-lg font-bold">{weeklyCheckins}</Text>
          <Text variant="muted" className="text-xs">Check-ins</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center py-3">
          <Text className="text-foreground text-lg font-bold">{totalStepsK}k</Text>
          <Text variant="muted" className="text-xs">Steps</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center py-3">
          <Text className="text-foreground text-lg font-bold">{streak}d</Text>
          <Text variant="muted" className="text-xs">Streak</Text>
        </View>
      </View>
    </View>
  );
}
