import { View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import type { DashboardState } from '@/src/features/home/types';

type Props = {
  userData: Pick<DashboardState, 'points' | 'company' | 'rank' | 'department' | 'streak'>;
  level: { label: string; emoji: string };
};

export function PointsCard({ userData, level }: Props) {
  return (
    <View
      className="mx-5 -mt-10 bg-white rounded-2xl px-5 py-5"
      style={{
        shadowColor: '#0A2E5C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 16,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-foreground/50 text-xs uppercase tracking-widest">Your Points</Text>
          <Text className="text-foreground text-5xl font-bold mt-0.5 leading-tight">
            {userData.points.toLocaleString()}
          </Text>
          <Text className="text-foreground/40 text-xs mt-1">{userData.company}</Text>
        </View>
        <View className="items-end gap-2">
          <View className="bg-seegla-orange/15 px-3 py-1 rounded-full flex-row items-center gap-1">
            <Text className="text-xs">{level.emoji}</Text>
            <Text className="text-seegla-orange text-xs font-bold">{level.label}</Text>
          </View>
          <View className="items-center gap-0.5">
            <Flame size={22} color={COLORS.orange} />
            <Text className="text-seegla-orange text-sm font-bold leading-none">{userData.streak}d</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-3 mt-4 pt-3 border-t border-border">
        <View className="flex-row items-center gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-seegla-green" />
          <Text className="text-foreground/50 text-xs">Rank #{userData.rank || '-'} company-wide</Text>
        </View>
        <View className="flex-1" />
        <Text className="text-foreground/50 text-xs">{userData.department}</Text>
      </View>
    </View>
  );
}
