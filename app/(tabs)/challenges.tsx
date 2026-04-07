import { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Trophy, Users, Zap } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import { CHALLENGES, type Challenge } from '@/lib/data/static';

type TabKey = 'daily' | 'weekly' | 'team';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'daily',  label: 'Daily'  },
  { key: 'weekly', label: 'Weekly' },
  { key: 'team',   label: 'Team'   },
];

function ChallengeCard({ challenge, isLast }: { challenge: Challenge; isLast: boolean }) {
  const [joined, setJoined] = useState(challenge.joined);
  const iconColor = challenge.type === 'team' ? COLORS.teal : COLORS.green;

  return (
    <View className={`px-5 py-4 bg-background ${isLast ? '' : 'border-b border-border'}`}>
      <View className="flex-row items-start gap-3">
        {/* Icon */}
        <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center shrink-0">
          {challenge.type === 'team'
            ? <Users size={20} color={iconColor} />
            : <Trophy size={20} color={iconColor} />
          }
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-sm font-semibold flex-1 mr-2">{challenge.title}</Text>
            <View className="bg-seegla-orange/10 px-2 py-0.5 rounded-full">
              <Text className="text-seegla-orange text-xs font-bold">+{challenge.points} pts</Text>
            </View>
          </View>

          <Text variant="muted" className="text-xs leading-4">{challenge.description}</Text>

          {challenge.daysLeft !== undefined && (
            <Text className="text-seegla-teal text-xs font-medium">{challenge.daysLeft} days left</Text>
          )}
          {challenge.participants !== undefined && (
            <Text variant="muted" className="text-xs">{challenge.participants} participants</Text>
          )}
        </View>
      </View>

      {joined && challenge.progress > 0 && (
        <View className="mt-3 ml-13">
          <View className="flex-row justify-between mb-1">
            <Text variant="muted" className="text-xs">Progress</Text>
            <Text className="text-foreground text-xs font-medium">{challenge.progress}%</Text>
          </View>
          <Progress
            value={challenge.progress}
            className="h-1 bg-secondary/20 rounded-none"
            indicatorClassName="bg-secondary"
          />
        </View>
      )}

      <View className="mt-3">
        <Button
          variant={joined ? 'outline' : 'default'}
          size="sm"
          className="rounded-lg"
          onPress={() => setJoined((j) => !j)}
        >
          <Text>{joined ? 'Joined ✓' : 'Join Challenge'}</Text>
        </Button>
      </View>
    </View>
  );
}

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const filtered = CHALLENGES.filter((c) => c.type === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="px-5 pt-4 pb-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Challenges</Text>
        <Text variant="muted" className="text-sm mt-0.5">Stay active, earn points</Text>
      </View>

      {/* Underline tab bar — full width, flush */}
      <View className="flex-row border-b border-border">
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-16 px-8">
            <Zap size={40} color="#D1D5DB" />
            <Text variant="muted" className="text-center mt-3">
              No challenges scheduled, check back tomorrow for more ways to stay healthy.
            </Text>
          </View>
        ) : (
          filtered.map((challenge, i) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isLast={i === filtered.length - 1}
            />
          ))
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
