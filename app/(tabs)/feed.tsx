import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Plus, Star } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import {
  listFeedPosts,
  listStories,
  toggleFeedReaction,
  createFeedPost,
  createStory,
  type FeedPostDto,
  type StoryDto,
} from '@/src/features/feed/api/feed.api';
import { Button } from '@/components/ui/button';
import { getCurrentUserProfile } from '@/src/features/auth/api/profile.api';

function StoryBubble({ story, onPress }: { story: StoryDto; onPress: () => void }) {
  return (
    <Pressable className="items-center gap-1.5 mr-4" onPress={onPress}>
      <View className={`p-[2.5px] rounded-full ${story.hasStory ? story.ringColor : 'border-transparent'} border-2`}>
        <View className={`w-14 h-14 rounded-full ${story.avatarColor} items-center justify-center`}>
          {story.isOwn && !story.hasStory ? (
            <View className="items-center justify-center">
              <Text className="text-white text-base font-bold">{story.initials}</Text>
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

function FeedComposer({
  initials,
  avatarColor,
  value,
  posting,
  onChangeText,
  onSubmit,
}: {
  initials: string;
  avatarColor: string;
  value: string;
  posting: boolean;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View className="px-5 py-4 border-b border-border bg-background gap-3">
      <View className="flex-row items-start gap-3">
        <View className={`w-10 h-10 rounded-full ${avatarColor} items-center justify-center shrink-0`}>
          <Text className="text-white text-xs font-bold">{initials}</Text>
        </View>
        <View className="flex-1">
          <TextInput
            className="bg-muted rounded-2xl px-4 py-3 text-foreground min-h-[44px]"
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            multiline
            value={value}
            onChangeText={onChangeText}
            maxLength={280}
          />
          <Text className="text-xs text-muted-foreground mt-1">{value.length}/280</Text>
        </View>
      </View>
      <View className="flex-row justify-end">
        <Button
          size="sm"
          className="rounded-lg"
          disabled={!value.trim() || posting}
          onPress={onSubmit}
        >
          <Text>{posting ? 'Posting...' : 'Post'}</Text>
        </Button>
      </View>
    </View>
  );
}

function FeedCard({ post, isLast }: { post: FeedPostDto; isLast: boolean }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [celebrated, setCelebrated] = useState(post.celebratedByMe);
  const [celebrateCount, setCelebrateCount] = useState(post.celebrates);

  useEffect(() => {
    setLiked(post.likedByMe);
    setLikeCount(post.likes);
    setCelebrated(post.celebratedByMe);
    setCelebrateCount(post.celebrates);
  }, [post.likedByMe, post.likes, post.celebratedByMe, post.celebrates]);

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));

    const res = await toggleFeedReaction(post.id, 'like');
    if (res.error) {
      setLiked(!nextLiked);
      setLikeCount((c) => c + (nextLiked ? -1 : 1));
    }
  };

  const handleCelebrate = async () => {
    const next = !celebrated;
    setCelebrated(next);
    setCelebrateCount((c) => c + (next ? 1 : -1));

    const res = await toggleFeedReaction(post.id, 'celebrate');
    if (res.error) {
      setCelebrated(!next);
      setCelebrateCount((c) => c + (next ? -1 : 1));
    }
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
        <Pressable className="flex-row items-center gap-1.5" onPress={handleCelebrate}>
          <Star size={18} color={celebrated ? COLORS.teal : '#9CA3AF'} fill={celebrated ? COLORS.teal : 'transparent'} />
          <Text className={`text-sm font-medium ${celebrated ? 'text-primary' : 'text-muted-foreground'}`}>
            {celebrateCount}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const [stories, setStories] = useState<StoryDto[]>([]);
  const [posts, setPosts] = useState<FeedPostDto[]>([]);
  const [myInitials, setMyInitials] = useState('ME');
  const [myAvatarColor, setMyAvatarColor] = useState('bg-seegla-teal');
  const [loading, setLoading] = useState(true);
  const [postDraft, setPostDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [addingStory, setAddingStory] = useState(false);
  const [showStoryComposer, setShowStoryComposer] = useState(false);
  const [storyImageUri, setStoryImageUri] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [viewingStory, setViewingStory] = useState<StoryDto | null>(null);

  const visibleStories = (() => {
    const own = stories.find((s) => s.isOwn);
    const ownStory: StoryDto = own ?? {
      id: 'own-fallback',
      name: 'Your Story',
      initials: myInitials,
      avatarColor: myAvatarColor,
      ringColor: 'border-seegla-teal',
      isOwn: true,
      hasStory: false,
    };
    const others = stories.filter((s) => !s.isOwn);
    return [ownStory, ...others];
  })();

  const loadFeed = async (activeRef?: { active: boolean }) => {
    try {
      setLoading(true);
      const [profile, storiesRes, postsRes] = await Promise.all([
        getCurrentUserProfile(),
        listStories(),
        listFeedPosts(),
      ]);
      if (activeRef && !activeRef.active) return;
      if (profile) {
        setMyInitials(profile.initials);
        setMyAvatarColor(profile.avatarColor);
      }
      setStories(storiesRes.data);
      setPosts(postsRes.data);
    } catch {
      if (activeRef && !activeRef.active) return;
      // Keep existing UI data on transient failures.
    } finally {
      if (!activeRef || activeRef.active) setLoading(false);
    }
  };

  useEffect(() => {
    const activeRef = { active: true };
    loadFeed(activeRef);
    return () => {
      activeRef.active = false;
    };
  }, []);

  const handleCreatePost = async () => {
    if (!postDraft.trim() || posting) return;
    const draft = postDraft.trim();
    setPosting(true);
    const result = await createFeedPost(draft);
    setPosting(false);
    if (result.error) {
      Alert.alert('Unable to post', 'Please try again.');
      return;
    }
    setPosts((prev) => [
      {
        id: `local-${Date.now()}`,
        author: 'You',
        initials: myInitials,
        avatarColor: myAvatarColor,
        department: 'Now',
        timeAgo: 'now',
        activity: 'posted an update',
        detail: draft,
        likes: 0,
        likedByMe: false,
        celebrates: 0,
        celebratedByMe: false,
      },
      ...prev,
    ]);
    setPostDraft('');
    await loadFeed();
  };

  const handleStoryPress = async (story: StoryDto) => {
    if (!story.isOwn) {
      if (story.mediaUrl) {
        setViewingStory(story);
      } else {
        Alert.alert('Story unavailable', 'This story has no media.');
      }
      return;
    }
    if (story.hasStory && story.mediaUrl) {
      Alert.alert('Your Story', 'What do you want to do?', [
        { text: 'View', onPress: () => setViewingStory(story) },
        { text: 'Add New', onPress: () => setShowStoryComposer(true) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    setShowStoryComposer(true);
  };

  const pickStoryImage = async () => {
    try {
      const ImagePicker: any = require('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission?.granted) {
        Alert.alert('Permission needed', 'Please allow photo library access to add a story image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setStoryImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        'Image picker unavailable',
        'Install expo-image-picker to choose images: npx expo install expo-image-picker',
      );
    }
  };

  const submitStory = async () => {
    if (addingStory) return;
    if (!storyImageUri) {
      Alert.alert('Image required', 'Pick an image first to share your story.');
      return;
    }
    setAddingStory(true);
    const res = await createStory(storyImageUri ?? undefined, storyCaption);
    setAddingStory(false);
    if (res.error) {
      Alert.alert(
        'Unable to add story',
        res.error === 'UNAUTHENTICATED'
          ? 'Your session expired. Please sign in again.'
          : 'Please try again.',
      );
      return;
    }

    const created = res.data;
    if (created) {
      setStories((prev) => {
        const withoutOwn = prev.filter((s) => !s.isOwn);
        const ownStory: StoryDto = {
          id: 'own',
          storyId: created.storyId,
          name: 'Your Story',
          initials: myInitials,
          avatarColor: myAvatarColor,
          ringColor: 'border-seegla-teal',
          isOwn: true,
          hasStory: true,
          mediaUrl: created.mediaUrl,
          caption: created.caption,
        };
        return [ownStory, ...withoutOwn];
      });
    }

    setShowStoryComposer(false);
    setStoryImageUri(null);
    setStoryCaption('');
    Alert.alert('Story posted', 'Your story is now live and viewable in the story lane.');
    await loadFeed();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <View className="px-5 pt-4 pb-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Activity Feed</Text>
        <Text variant="muted" className="text-sm mt-0.5">See what your team is up to</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-4 border-b border-border">
          <FlatList
            data={visibleStories}
            keyExtractor={(s) => s.id}
            renderItem={({ item }) => <StoryBubble story={item} onPress={() => handleStoryPress(item)} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        <FeedComposer
          initials={myInitials}
          avatarColor={myAvatarColor}
          value={postDraft}
          posting={posting}
          onChangeText={setPostDraft}
          onSubmit={handleCreatePost}
        />

        {posts.map((post, i) => (
          <FeedCard key={post.id} post={post} isLast={i === posts.length - 1} />
        ))}

        {!loading && posts.length === 0 ? (
          <View className="px-5 py-8">
            <Text variant="muted">No feed activity yet.</Text>
          </View>
        ) : null}

        <View className="h-32" />
      </ScrollView>

      <Modal
        visible={Boolean(viewingStory)}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingStory(null)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <View className="px-4 pt-1">
              <View className="h-1 rounded-full bg-white/30 overflow-hidden">
                <View className="h-full w-full bg-white" />
              </View>
            </View>

            <View className="absolute top-0 left-0 right-0 z-20 px-4 pt-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className={`w-8 h-8 rounded-full ${viewingStory?.avatarColor ?? 'bg-seegla-teal'} items-center justify-center`}>
                    <Text className="text-white text-xs font-bold">{viewingStory?.initials ?? 'ST'}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm font-semibold">{viewingStory?.name ?? 'Story'}</Text>
                    <Text className="text-white/70 text-[11px]">Just now</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setViewingStory(null)}
                  className="w-8 h-8 rounded-full bg-black/45 items-center justify-center"
                >
                  <Text className="text-white text-lg leading-none">×</Text>
                </Pressable>
              </View>
            </View>

            <View className="flex-1">
              {viewingStory?.mediaUrl ? (
                <Image
                  source={{ uri: viewingStory.mediaUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-white/70">No story media</Text>
                </View>
              )}

              <View className="absolute left-0 right-0 bottom-0 h-44 bg-black/25" />

              {viewingStory?.caption ? (
                <View className="absolute bottom-10 left-5 right-5 bg-black/50 rounded-2xl px-4 py-3">
                  <Text className="text-white text-[15px] leading-6">{viewingStory.caption}</Text>
                </View>
              ) : (
                <View className="absolute bottom-10 left-5 right-5">
                  <Text className="text-white/70 text-center text-sm">No caption</Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        visible={showStoryComposer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStoryComposer(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl px-5 pt-5 pb-8 gap-4">
            <View className="w-10 h-1 rounded-full bg-border self-center" />
            <Text className="text-foreground text-lg font-bold">Create Story</Text>

            <Pressable
              className="h-44 rounded-2xl border border-border bg-muted items-center justify-center overflow-hidden"
              onPress={pickStoryImage}
            >
              {storyImageUri ? (
                <View className="w-full h-full">
                  <Image source={{ uri: storyImageUri }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute inset-0 p-3 justify-end">
                    <View className="bg-black/35 rounded-xl px-3 py-2">
                      <TextInput
                        className="text-white"
                        placeholder="Add text..."
                        placeholderTextColor="rgba(255,255,255,0.75)"
                        value={storyCaption}
                        onChangeText={setStoryCaption}
                        maxLength={160}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View className="items-center gap-2">
                  <Text className="text-foreground font-semibold">Tap to pick an image</Text>
                  <Text variant="muted" className="text-xs">Your text will be placed inside the story image</Text>
                </View>
              )}
            </Pressable>

            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-lg"
                onPress={() => setShowStoryComposer(false)}
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                className="flex-1 rounded-lg"
                onPress={submitStory}
                disabled={addingStory}
              >
                <Text>{addingStory ? 'Posting...' : 'Share Story'}</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
