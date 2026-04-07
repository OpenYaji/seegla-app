import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Medal } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import {
  getDepartmentLeaderboard,
  getIndividualLeaderboard,
  type LeaderboardEntryDto,
} from '@/src/features/leaderboard/api/leaderboard.api';
import { getCurrentUserProfile } from '@/src/features/auth/api/profile.api';

type TabKey = 'individual' | 'department';

const PODIUM_COLORS = ['text-seegla-orange', 'text-muted-foreground', 'text-amber-700'];
const MEDAL_COLORS = [COLORS.orange, '#9CA3AF', '#B45309'];

function PodiumCard({ entry, position }: { entry: LeaderboardEntryDto; position: 0 | 1 | 2 }) {
  const sizes = ['w-20 h-20', 'w-16 h-16', 'w-14 h-14'];
  const orders = ['order-2', 'order-1', 'order-3'];
  const tops = ['', 'mt-4', 'mt-8'];

  return (
    <View className={`flex-1 items-center ${orders[position]} ${tops[position]}`}>
      <Medal size={20} color={MEDAL_COLORS[position]} />
      <View className={`${sizes[position]} rounded-full ${entry.avatarColor} items-center justify-center mt-1 border-2 border-seegla-navy`}>
        <Text className="text-white font-bold text-base">{entry.initials}</Text>
      </View>
      <Text className="text-white text-xs font-semibold mt-1.5 text-center" numberOfLines={1}>
        {entry.name.split(' ')[0]}
      </Text>
      <Text className={`text-xs font-bold ${PODIUM_COLORS[position]}`}>
        {entry.points.toLocaleString()}
      </Text>
    </View>
  );
}

function RankRow({ entry }: { entry: LeaderboardEntryDto }) {
  return (
    <View
      className={`flex-row items-center px-5 py-3 border-b border-border ${
        entry.isCurrentUser ? 'bg-primary/5' : 'bg-background'
      }`}
    >
      <Text
        className={`w-8 text-sm font-bold ${
          entry.rank <= 3 ? 'text-seegla-orange' : 'text-muted-foreground'
        }`}
      >
        #{entry.rank}
      </Text>
      <View className={`w-9 h-9 rounded-full ${entry.avatarColor} items-center justify-center mr-3`}>
        <Text className="text-white text-xs font-bold">{entry.initials}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-foreground text-sm font-medium">{entry.name}</Text>
          {entry.isCurrentUser && (
            <View className="bg-primary/15 px-1.5 py-0.5 rounded-full">
              <Text className="text-primary text-[10px] font-bold">You</Text>
            </View>
          )}
        </View>
        <Text variant="muted" className="text-xs">{entry.department}</Text>
      </View>
      <Text className="text-foreground text-sm font-bold">{entry.points.toLocaleString()}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('individual');
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [me, board] = await Promise.all([
          getCurrentUserProfile(),
          activeTab === 'individual' ? getIndividualLeaderboard() : getDepartmentLeaderboard(),
        ]);
        if (!active) return;
        setEntries(board.data);
        setCurrentPoints(me?.points ?? 0);
      } catch {
        if (!active) return;
        setEntries([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [activeTab]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const delta = Math.max(0, (entries[0]?.points ?? 0) - currentPoints);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <View className="px-5 pt-4 pb-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Leaderboard</Text>
        <Text variant="muted" className="text-sm mt-0.5">
          Your team is {delta.toLocaleString()} pts ahead, let's catch up!
        </Text>
      </View>

      <View className="flex-row border-b border-border">
        {(['individual', 'department'] as TabKey[]).map((tab) => (
          <Pressable
            key={tab}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === tab ? 'border-primary' : 'border-transparent'
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`text-sm font-semibold capitalize ${
                activeTab === tab ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-seegla-navy pt-6 pb-5 px-5">
          <Text className="text-white/50 text-xs text-center uppercase tracking-widest mb-4">
            Top Performers
          </Text>
          <View className="flex-row items-end justify-center gap-2">
            {top3.map((entry, i) => (
              <PodiumCard key={`${entry.rank}-${entry.name}`} entry={entry} position={i as 0 | 1 | 2} />
            ))}
          </View>
        </View>

        <View className="h-2 bg-muted" />

        {rest.map((entry) => (
          <RankRow key={`${entry.rank}-${entry.name}`} entry={entry} />
        ))}

        {entries.length === 0 ? (
          <View className="px-5 py-8">
            <Text variant="muted">No leaderboard data yet.</Text>
          </View>
        ) : null}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

