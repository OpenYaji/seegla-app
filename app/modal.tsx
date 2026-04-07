import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Flame, Trophy, Gift, CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';

type Notification = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    icon: <Gift size={18} color={COLORS.orange} />,
    iconBg: 'bg-seegla-orange/10',
    title: 'Promo Hour starts in 1 hour!',
    body: 'Complete your Daily Check-in now so your voucher is ready to claim at 8PM.',
    time: 'Just now',
    read: false,
  },
  {
    id: 'n2',
    icon: <Trophy size={18} color={COLORS.teal} />,
    iconBg: 'bg-primary/10',
    title: 'Your team is 860 pts ahead!',
    body: 'Marketing is currently ranked #4. Join the Team Walk challenge to catch up.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'n3',
    icon: <Flame size={18} color={COLORS.orange} />,
    iconBg: 'bg-seegla-orange/10',
    title: '5-day streak! Keep it up 🔥',
    body: "You've checked in for 5 days straight. Hit 7 days to unlock a streak badge.",
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n4',
    icon: <CheckCircle2 size={18} color={COLORS.green} />,
    iconBg: 'bg-secondary/10',
    title: 'Challenge completed',
    body: 'You finished the 8 Glasses a Day challenge and earned +30 pts.',
    time: '2 days ago',
    read: true,
  },
];

export default function NotificationsModal() {
  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-border">
        <Text className="text-foreground text-xl font-bold">Notifications</Text>
        <Pressable
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
          onPress={() => router.back()}
        >
          <X size={18} color={COLORS.navy} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-3">
          {NOTIFICATIONS.map((n) => (
            <View
              key={n.id}
              className={`flex-row items-start gap-3 px-5 py-4 border-b border-border/50 ${
                n.read ? 'opacity-60' : ''
              }`}
            >
              <View className={`w-10 h-10 rounded-full ${n.iconBg} items-center justify-center shrink-0 mt-0.5`}>
                {n.icon}
              </View>
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-2">
                  <Text className="text-foreground text-sm font-semibold flex-1">{n.title}</Text>
                  {!n.read && (
                    <View className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </View>
                <Text variant="muted" className="text-xs leading-4">{n.body}</Text>
                <Text variant="muted" className="text-xs mt-1">{n.time}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="items-center py-8">
          <Text variant="muted" className="text-xs">You're all caught up!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
