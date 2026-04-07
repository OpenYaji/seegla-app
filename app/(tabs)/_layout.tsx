import { useColorScheme } from '@/hooks/use-color-scheme';
import { COLORS } from '@/lib/constants';
import * as Haptics from 'expo-haptics';
import { Redirect, Tabs } from 'expo-router';
import {
  BarChart2,
  Home,
  ShoppingBag,
  Trophy,
  Users,
} from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useAuthGate } from '@/src/features/auth/hooks/use-auth-gate';

// ─── Spring-animated tab button ───────────────────────────────────────────────

function AnimatedHapticTab({ children, onPress, style, ...rest }: any) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress(e: any) {
    // Spring: compress → overshoot → settle
    scale.value = withSequence(
      withSpring(0.82, { damping: 22, stiffness: 600, mass: 0.8 }),
      withSpring(1.08, { damping: 10, stiffness: 250, mass: 0.8 }),
      withSpring(1.00, { damping: 14, stiffness: 300, mass: 0.8 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  }

  return (
    <Pressable style={style} onPress={handlePress} {...rest}>
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  );
}

// ─── Tab layout ───────────────────────────────────────────────────────────────

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { loading, isAuthenticated } = useAuthGate();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.navy, fontWeight: '600' }}>Checking session...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown:           false,
        tabBarButton:          AnimatedHapticTab,
        tabBarActiveTintColor: COLORS.teal,
        tabBarInactiveTintColor: colorScheme === 'dark' ? COLORS.background : '#9CA3AF',
        tabBarStyle: {
          position:        'absolute',
          bottom:          6,
          left:            16,
          right:           16,
          borderRadius:    24,
          height:          64,
          paddingBottom:   8,
          paddingTop:      8,
          borderTopWidth:  0,
          backgroundColor: colorScheme === 'dark' ? COLORS.navy : COLORS.white,
          // iOS shadow
          shadowColor:     '#000',
          shadowOffset:    { width: 0, height: 6 },
          shadowOpacity:   0.14,
          shadowRadius:    18,
          // Android
          elevation: 14,
        },
        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
