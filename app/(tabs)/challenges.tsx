import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Trophy, Users, Zap } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import {
  listChallengesByType,
  setChallengeJoinState,
  type ChallengeDto,
} from '@/src/features/challenges/api/challenges.api';

type TabKey = 'daily' | 'weekly' | 'team';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'team', label: 'Team' },
];

function ChallengeCard({
  challenge,
  isLast,
  onToggle,
}: {
  challenge: ChallengeDto;
  isLast: boolean;
  onToggle: (id: string, joined: boolean) => void;
}) {
  const iconColor = challenge.type === 'team' ? COLORS.teal : COLORS.green;

  return (
    <View className={`px-5 py-4 bg-background ${isLast ? '' : 'border-b border-border'}`}>
      <View className="flex-row items-start gap-3">
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

      {challenge.joined && challenge.progress > 0 && (
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
          variant={challenge.joined ? 'outline' : 'default'}
          size="sm"
          className="rounded-lg"
          onPress={() => onToggle(challenge.id, !challenge.joined)}
        >
          <Text>{challenge.joined ? 'Joined ✓' : 'Join Challenge'}</Text>
        </Button>
      </View>
    </View>
  );
}

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [challenges, setChallenges] = useState<ChallengeDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await listChallengesByType(activeTab);
        if (!active) return;
        setChallenges(res.data);
      } catch {
        if (!active) return;
        setChallenges([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [activeTab]);

  const handleToggle = async (challengeId: string, shouldJoin: boolean) => {
    const prev = challenges;
    setChallenges((curr) => curr.map((c) => (
      c.id === challengeId ? { ...c, joined: shouldJoin, progress: shouldJoin ? c.progress : 0 } : c
    )));

    const res = await setChallengeJoinState(challengeId, shouldJoin);
    if (res.error) {
      setChallenges(prev);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <View className="px-5 pt-4 pb-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Challenges</Text>
        <Text variant="muted" className="text-sm mt-0.5">Stay active, earn points</Text>
      </View>

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
        {!loading && challenges.length === 0 ? (
          <View className="items-center justify-center py-16 px-8">
            <Zap size={40} color="#D1D5DB" />
            <Text variant="muted" className="text-center mt-3">
              No challenges scheduled, check back tomorrow for more ways to stay healthy.
            </Text>
          </View>
        ) : (
          challenges.map((challenge, i) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isLast={i === challenges.length - 1}
              onToggle={handleToggle}
            />
          ))
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

