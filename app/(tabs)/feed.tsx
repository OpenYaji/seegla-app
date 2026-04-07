import { useState } from 'react';
import { ScrollView, View, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Star, Plus, Camera } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import { CURRENT_USER, ACTIVITY_FEED, type FeedPost } from '@/lib/data/static';

// ─── Stories ──────────────────────────────────────────────────────────────────

type Story = {
  id:          string;
  name:        string;
  initials:    string;
  avatarColor: string;
  ringColor:   string;
  isOwn?:      boolean;
  hasStory:    boolean;
};

const STORIES: Story[] = [
  // "Your Story" always first
  {
    id:          'own',
    name:        'Your Story',
    initials:    CURRENT_USER.initials,
    avatarColor: CURRENT_USER.avatarColor,
    ringColor:   'border-seegla-teal',
    isOwn:       true,
    hasStory:    false,
  },
  // Derive from activity feed
  {
    id:          'f1',
    name:        'Marco',
    initials:    'MS',
    avatarColor: 'bg-seegla-purple',
    ringColor:   'border-seegla-orange',
    hasStory:    true,
  },
  {
    id:          'f2',
    name:        'Ana',
    initials:    'AR',
    avatarColor: 'bg-seegla-green',
    ringColor:   'border-seegla-teal',
    hasStory:    true,
  },
  {
    id:          'f3',
    name:        'Paolo',
    initials:    'PM',
    avatarColor: 'bg-seegla-navy',
    ringColor:   'border-seegla-orange',
    hasStory:    true,
  },
  {
    id:          'f4',
    name:        'Carla',
    initials:    'CB',
    avatarColor: 'bg-primary',
    ringColor:   'border-seegla-green',
    hasStory:    true,
  },
  {
    id:          'f5',
    name:        'Rico',
    initials:    'RD',
    avatarColor: 'bg-seegla-orange',
    ringColor:   'border-seegla-purple',
    hasStory:    true,
  },
];

function StoryBubble({ story }: { story: Story }) {
  return (
    <Pressable className="items-center gap-1.5 mr-4">
      {/* Ring + avatar */}
      <View className={`p-[2.5px] rounded-full ${story.hasStory ? story.ringColor : 'border-transparent'} border-2`}>
        <View className={`w-14 h-14 rounded-full ${story.avatarColor} items-center justify-center`}>
          {story.isOwn ? (
            <View className="items-center justify-center">
              <Text className="text-white text-base font-bold">{story.initials}</Text>
              {/* Add Story badge */}
              <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary border-2 border-background items-center justify-center">
                <Plus size={10} color="#fff" />
              </View>
            </View>
          ) : (
            <Text className="text-white text-base font-bold">{story.initials}</Text>
          )}
        </View>
      </View>
      <Text variant="muted" className="text-[10px]" numberOfLines={1}>{story.name}</Text>
    </Pressable>
  );
}

// ─── Add Post Modal (simplified) ─────────────────────────────────────────────

function AddPostBanner() {
  const [showBanner, setShowBanner] = useState(false);

  return (
    <Pressable
      className="flex-row items-center gap-3 px-5 py-3 border-b border-border"
      onPress={() => setShowBanner(!showBanner)}
    >
      <View className={`w-9 h-9 rounded-full ${CURRENT_USER.avatarColor} items-center justify-center shrink-0`}>
        <Text className="text-white text-xs font-bold">{CURRENT_USER.initials}</Text>
      </View>
      <View className="flex-1 bg-muted rounded-full px-4 py-2.5">
        <Text variant="muted" className="text-sm">Share a wellness moment...</Text>
      </View>
      <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
        <Camera size={18} color={COLORS.teal} />
      </View>
    </Pressable>
  );
}

// ─── Feed Card ────────────────────────────────────────────────────────────────

function FeedCard({ post, isLast }: { post: FeedPost; isLast: boolean }) {
  const [liked, setLiked]         = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (liked) { setLiked(false); setLikeCount((c) => c - 1); }
    else        { setLiked(true);  setLikeCount((c) => c + 1); }
  };

  return (
    <View className={`bg-background px-5 py-4 ${isLast ? '' : 'border-b border-border'}`}>
      <View className="flex-row items-center gap-3 mb-3">
        <View className={`w-10 h-10 rounded-full ${post.avatarColor} items-center justify-center`}>
          <Text className="text-white text-sm font-bold">{post.initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-foreground text-sm font-semibold">{post.author}</Text>
          <Text variant="muted" className="text-xs">{post.department} · {post.timeAgo}</Text>
        </View>
      </View>

      <Text variant="muted" className="text-xs mb-1 uppercase tracking-wider">{post.activity}</Text>
      <Text className="text-foreground text-sm leading-5">{post.detail}</Text>

      <View className="flex-row gap-4 mt-4 pt-3 border-t border-border">
        <Pressable className="flex-row items-center gap-1.5" onPress={handleLike}>
          <Heart size={18} color={liked ? COLORS.orange : '#9CA3AF'} fill={liked ? COLORS.orange : 'transparent'} />
          <Text className={`text-sm font-medium ${liked ? 'text-seegla-orange' : 'text-muted-foreground'}`}>
            {likeCount}
          </Text>
        </Pressable>
        <Pressable className="flex-row items-center gap-1.5">
          <Star size={18} color={COLORS.teal} />
          <Text className="text-primary text-sm font-medium">Celebrate</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Feed Screen ──────────────────────────────────────────────────────────────

export default function FeedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="px-5 pt-4 pb-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Activity Feed</Text>
        <Text variant="muted" className="text-sm mt-0.5">See what your team is up to</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* ── Instagram-style Stories ── */}
        <View className="py-4 border-b border-border">
          <FlatList
            data={STORIES}
            keyExtractor={(s) => s.id}
            renderItem={({ item }) => <StoryBubble story={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* ── Add Post ── */}
        <AddPostBanner />

        {/* ── Posts ── */}
        {ACTIVITY_FEED.map((post, i) => (
          <FeedCard key={post.id} post={post} isLast={i === ACTIVITY_FEED.length - 1} />
        ))}

        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
