/**
 * Animated progress primitives.
 * All animations use react-native-reanimated — no StyleSheet.create.
 * Inline style is used only for dynamic computed values (backgroundColor, width).
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';

// ─── Smooth animated fill bar ─────────────────────────────────────────────────

export function AnimatedBar({
  value,
  color,
  delay = 0,
  height = 'h-2',
}: {
  value: number;   // 0–100
  color: string;
  delay?: number;
  height?: string;
}) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(value, { duration: 950, easing: Easing.out(Easing.cubic) }),
    );
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className={`w-full ${height} bg-muted rounded-full overflow-hidden`}>
      <Animated.View
        style={[{ backgroundColor: color }, animStyle]}
        className="h-full rounded-full"
      />
    </View>
  );
}

// ─── Single segment block ─────────────────────────────────────────────────────

function Segment({ filled, color, delay }: { filled: boolean; color: string; delay: number }) {
  const opacity    = useSharedValue(0);
  const translateX = useSharedValue(10);

  useEffect(() => {
    if (filled) {
      opacity.value    = withDelay(delay, withTiming(1, { duration: 180 }));
      translateX.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 220 }));
    } else {
      opacity.value    = 0;
      translateX.value = 10;
    }
  }, [filled]);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="flex-1 h-3 rounded-sm bg-muted overflow-hidden">
      <Animated.View
        style={[{ backgroundColor: color, height: '100%', width: '100%' }, animStyle]}
      />
    </View>
  );
}

// ─── Segmented bar (water/unit style) ─────────────────────────────────────────

export function SegmentedBar({
  filled,
  total,
  color,
}: {
  filled: number;
  total:  number;
  color:  string;
}) {
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <Segment key={i} filled={i < filled} color={color} delay={i * 65} />
      ))}
    </View>
  );
}
