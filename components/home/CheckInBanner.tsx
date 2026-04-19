import { View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import type { HomeDashboardDto } from '@/src/features/home/types';

type Props = {
  checkIn: HomeDashboardDto['checkIn'];
  onStart: () => void;
};

export function CheckInBanner({ checkIn, onStart }: Props) {
  return (
    <View className="bg-seegla-navy px-5 py-5 overflow-hidden">
      <View className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-seegla-teal opacity-20" />
      <View className="absolute right-2 bottom-0 w-16 h-16 rounded-full bg-seegla-purple opacity-20" />
      {checkIn.completed ? (
        <View className="flex-row items-center gap-3">
          <CheckCircle2 size={24} color={COLORS.green} />
          <View>
            <Text className="text-white font-semibold">Check-in complete!</Text>
            <Text className="text-white/60 text-xs">+{checkIn.pointsReward} pts earned</Text>
          </View>
        </View>
      ) : (
        <>
          <Text className="text-seegla-orange text-xs font-bold tracking-widest uppercase mb-1">
            Daily Check-in
          </Text>
          <Text className="text-white text-base font-bold mb-1">Answer 3 quick questions</Text>
          <Text className="text-white/60 text-xs mb-4">
            Mood · Energy · Sleep — earn +{checkIn.pointsReward} pts
          </Text>
          <Button className="rounded-lg self-start" onPress={onStart}>
            <Text>Start Check-in</Text>
          </Button>
        </>
      )}
    </View>
  );
}
