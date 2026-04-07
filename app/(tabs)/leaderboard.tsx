import { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Medal } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import {
  CURRENT_USER,
  LEADERBOARD_INDIVIDUAL,
  LEADERBOARD_DEPARTMENT,
  type LeaderboardEntry,
} from '@/lib/data/static';

type TabKey = 'individual' | 'department';

const PODIUM_COLORS = ['text-seegla-orange', 'text-muted-foreground', 'text-amber-700'];
const MEDAL_COLORS  = [COLORS.orange, '#9CA3AF', '#B45309'];

function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 0 | 1 | 2 }) {
  const sizes  = ['w-20 h-20', 'w-16 h-16', 'w-14 h-14'];
  const orders = ['order-2', 'order-1', 'order-3'];
  const tops   = ['', 'mt-4', 'mt-8'];

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

function RankRow({ entry }: { entry: LeaderboardEntry }) {
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
  const entries = activeTab === 'individual' ? LEADERBOARD_INDIVIDUAL : LEADERBOARD_DEPARTMENT;
  const top3    = entries.slice(0, 3);
  const rest    = entries.slice(3);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="px-5 pt-4 pb-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Leaderboard</Text>
        <Text variant="muted" className="text-sm mt-0.5">
          Your team is {(entries[0]?.points - CURRENT_USER.points).toLocaleString()} pts ahead, let's catch up!
        </Text>
      </View>

      {/* Underline tab bar — full width, flush */}
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

        {/* Podium — full-bleed navy */}
        <View className="bg-seegla-navy pt-6 pb-5 px-5">
          <Text className="text-white/50 text-xs text-center uppercase tracking-widest mb-4">
            Top Performers
          </Text>
          <View className="flex-row items-end justify-center gap-2">
            {top3.map((entry, i) => (
              <PodiumCard key={entry.rank} entry={entry} position={i as 0 | 1 | 2} />
            ))}
          </View>
        </View>

        {/* Section gutter */}
        <View className="h-2 bg-muted" />

        {/* Ranked list — full-bleed rows */}
        {rest.map((entry) => (
          <RankRow key={entry.rank} entry={entry} />
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
