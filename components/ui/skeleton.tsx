import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Base skeleton shimmer block.
 * Pass className for sizing (w-*, h-*, rounded-*).
 */
export function Skeleton({ className, style }: Pick<ViewProps, 'className' | 'style'>) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[animStyle, style]}
      className={`bg-muted rounded-lg ${className ?? ''}`}
    />
  );
}

/** A row of skeletons with a label-width and a value-width variant */
export function SkeletonRow({ labelW = 'w-20', valueW = 'w-12' }: { labelW?: string; valueW?: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Skeleton className={`h-3 ${labelW}`} />
      <Skeleton className={`h-3 ${valueW}`} />
    </View>
  );
}
