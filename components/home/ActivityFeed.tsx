import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { HomeDashboardDto } from '@/src/features/home/types';

type Props = {
  activityFeed: HomeDashboardDto['activityFeed'];
  loading: boolean;
};

export function ActivityFeed({ activityFeed, loading }: Props) {
  const posts = activityFeed.slice(0, 2);

  return (
    <View className="bg-background px-5 pt-5 pb-36">
      <Text className="text-foreground text-base font-semibold mb-4">Recent Activity</Text>
      {posts.map((post, i) => (
        <View
          key={post.id}
          className={`flex-row items-start gap-3 py-3 ${i < posts.length - 1 ? 'border-b border-border' : ''}`}
        >
          <View className={`w-9 h-9 rounded-full ${post.avatarColor} items-center justify-center shrink-0`}>
            <Text className="text-white text-xs font-bold">{post.initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-foreground text-sm font-medium">{post.author}</Text>
            <Text variant="muted" className="text-xs">{post.detail}</Text>
          </View>
          <Text variant="muted" className="text-xs shrink-0">{post.timeAgo}</Text>
        </View>
      ))}
      {!loading && activityFeed.length === 0 && (
        <Text variant="muted" className="text-xs">No recent activity yet.</Text>
      )}
    </View>
  );
}
