/**
 * RingProgress — SVG circular progress ring.
 * Uses react-native-svg (already installed as transitive dep).
 * All colours are passed as props from COLORS constants — no hardcoded hex.
 */
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui/text';

const RING_SIZE    = 88;
const STROKE_WIDTH = 8;
const RADIUS       = (RING_SIZE - STROKE_WIDTH) / 2;   // 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;            // ~251.3
const CENTER       = RING_SIZE / 2;                    // 44

type RingProgressProps = {
  /** 0–100 */
  value: number;
  /** Stroke colour for the progress arc */
  color: string;
  /** Stroke colour for the empty track */
  trackColor?: string;
  /** Main metric displayed in the centre */
  label: string;
  /** Secondary line below the ring */
  sublabel: string;
  /** Optional icon element rendered above the label inside the ring */
  icon?: React.ReactNode;
};

export function RingProgress({
  value,
  color,
  trackColor = 'rgba(10,46,92,0.08)',
  label,
  sublabel,
  icon,
}: RingProgressProps) {
  const clamped    = Math.min(Math.max(value, 0), 100);
  const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <View className="items-center gap-2">
      {/* Ring container */}
      <View className="w-[88px] h-[88px] items-center justify-center">

        {/* SVG ring — wrapped in absolute View so text can overlay */}
        <View className="absolute inset-0">
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Empty track */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={trackColor}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Progress arc — starts at top (rotate -90°) */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={color}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          </Svg>
        </View>

        {/* Centre content */}
        <View className="items-center justify-center">
          {icon}
          <Text className="text-foreground text-xs font-bold leading-tight">{label}</Text>
        </View>
      </View>

      {/* Below-ring label */}
      <Text variant="muted" className="text-xs text-center">{sublabel}</Text>
    </View>
  );
}
