import { ScrollView, View } from 'react-native';
import { Skeleton, SkeletonRow } from '@/components/ui/skeleton';

function Divider() {
  return <View className="h-2 bg-muted" />;
}

/** Mirrors the visual structure of the home screen while data loads */
export function HomeScreenSkeleton() {
  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
      {/* Header band */}
      <View className="bg-seegla-navy px-5 pt-3 pb-16">
        <View className="flex-row items-center justify-between">
          <View className="gap-2">
            <Skeleton className="h-2.5 w-24 rounded-full" />
            <Skeleton className="h-6 w-40 rounded-lg" />
          </View>
          <View className="flex-row items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" style={{ opacity: 0.25 }} />
            <Skeleton className="w-10 h-10 rounded-full" style={{ opacity: 0.25 }} />
          </View>
        </View>
      </View>

      {/* Points card */}
      <View
        className="mx-5 -mt-10 bg-white rounded-2xl px-5 py-5"
        style={{ shadowColor: '#0A2E5C', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 16 }}
      >
        <View className="flex-row items-start justify-between">
          <View className="gap-2">
            <Skeleton className="h-2.5 w-20 rounded-full" />
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="h-2.5 w-24 rounded-full" />
          </View>
          <View className="items-end gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </View>
        </View>
        <View className="flex-row items-center gap-3 mt-4 pt-3 border-t border-border">
          <Skeleton className="h-2.5 w-36 rounded-full" />
          <View className="flex-1" />
          <Skeleton className="h-2.5 w-20 rounded-full" />
        </View>
      </View>

      <Divider />

      {/* Check-in banner */}
      <View className="bg-seegla-navy px-5 py-5">
        <Skeleton className="h-2.5 w-24 rounded-full mb-2" style={{ opacity: 0.3 }} />
        <Skeleton className="h-5 w-48 rounded-lg mb-2" style={{ opacity: 0.3 }} />
        <Skeleton className="h-3 w-56 rounded-full mb-4" style={{ opacity: 0.25 }} />
        <Skeleton className="h-10 w-32 rounded-lg" style={{ opacity: 0.25 }} />
      </View>

      <View className="h-2 bg-muted mt-3" />

      {/* Wellness score section */}
      <View className="bg-background px-5 pb-5">
        <Skeleton className="h-4 w-32 rounded-lg mb-4" />
        <View className="flex-row items-center gap-4">
          {/* Arc placeholder */}
          <View className="flex-1 items-center">
            <Skeleton className="w-[155px] h-[155px] rounded-full" />
            <Skeleton className="h-3 w-28 rounded-full mt-3" />
          </View>
          {/* Progress bars */}
          <View className="flex-1 gap-5">
            <View className="gap-2">
              <SkeletonRow labelW="w-10" valueW="w-16" />
              <Skeleton className="h-3 w-full rounded-full" />
            </View>
            <View className="gap-2">
              <SkeletonRow labelW="w-10" valueW="w-8" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-2.5 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </View>
            <View className="gap-2">
              <SkeletonRow labelW="w-24" valueW="w-16" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </View>
          </View>
        </View>
      </View>

      <Divider />

      {/* Weekly activity */}
      <View className="bg-background px-5 py-5">
        <View className="flex-row items-center justify-between mb-4">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </View>
        <View className="flex-row justify-between mb-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} className="items-center gap-1.5">
              <Skeleton className="h-2.5 w-5 rounded-full" />
              <Skeleton className="w-9 h-9 rounded-full" />
              <Skeleton className="w-1.5 h-1.5 rounded-full" />
            </View>
          ))}
        </View>
        <View className="flex-row bg-muted rounded-xl overflow-hidden">
          {[0, 1, 2].map((i) => (
            <View key={i} className="flex-1 items-center py-3 gap-1">
              <Skeleton className="h-5 w-8 rounded-lg" />
              <Skeleton className="h-2.5 w-14 rounded-full" />
            </View>
          ))}
        </View>
      </View>

      <Divider />

      {/* Activity feed */}
      <View className="bg-background px-5 pt-5 pb-36">
        <Skeleton className="h-4 w-32 rounded-lg mb-4" />
        {[0, 1].map((i) => (
          <View key={i} className={`flex-row items-start gap-3 py-3 ${i === 0 ? 'border-b border-border' : ''}`}>
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="h-2.5 w-48 rounded-full" />
            </View>
            <Skeleton className="h-2.5 w-10 rounded-full shrink-0" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
