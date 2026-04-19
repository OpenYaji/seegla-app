import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ARC_CX = 100;
const ARC_CY = 110;
const ARC_R = 82;
const ARC_CIRC = 2 * Math.PI * ARC_R;
const ARC_DEG = 240;
const ARC_LEN = (ARC_CIRC * ARC_DEG) / 360;
const ARC_ROT = 150;

type Props = { score: number; maxScore: number; label: string };

export function WellnessArc({ score, maxScore, label }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      350,
      withTiming(score / Math.max(1, maxScore), { duration: 1300, easing: Easing.out(Easing.cubic) }),
    );
  }, [score, maxScore]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: ARC_LEN * (1 - progress.value),
  }));

  return (
    <View className="w-[200px] h-[155px] self-center">
      <Svg width={200} height={155} viewBox="0 0 200 175">
        <Circle
          cx={ARC_CX} cy={ARC_CY} r={ARC_R}
          stroke="#E2E8F0" strokeWidth={11} fill="none"
          strokeDasharray={`${ARC_LEN} ${ARC_CIRC - ARC_LEN}`}
          transform={`rotate(${ARC_ROT}, ${ARC_CX}, ${ARC_CY})`}
          strokeLinecap="round"
        />
        <AnimatedCircle
          cx={ARC_CX} cy={ARC_CY} r={ARC_R}
          stroke={COLORS.teal} strokeWidth={11} fill="none"
          strokeDasharray={`${ARC_LEN} ${ARC_CIRC}`}
          animatedProps={arcProps}
          transform={`rotate(${ARC_ROT}, ${ARC_CX}, ${ARC_CY})`}
          strokeLinecap="round"
        />
      </Svg>
      <View className="absolute inset-0 items-center pt-14">
        <Text className="text-foreground text-4xl font-bold">{score.toFixed(1)}</Text>
        <Text variant="muted" className="text-xs -mt-1">/ {maxScore}</Text>
        <Text className="text-seegla-green text-xs font-semibold mt-1">{label}</Text>
      </View>
    </View>
  );
}
