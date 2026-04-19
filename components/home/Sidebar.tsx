import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { HelpCircle, LogOut, Settings, Shield, User, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import type { DashboardState } from '@/src/features/home/types';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.8;

const SIDEBAR_LINKS = [
  { icon: User, label: 'View Profile' },
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help & Support' },
  { icon: Shield, label: 'Privacy' },
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  user: DashboardState;
  onLogout: () => void;
};

export function Sidebar({ visible, onClose, user, onLogout }: Props) {
  const [mounted, setMounted] = useState(false);
  const translateX = useSharedValue(SIDEBAR_WIDTH);
  const backdropAlpha = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value = withSpring(0, { damping: 20, stiffness: 230, mass: 1.1 });
      backdropAlpha.value = withTiming(1, { duration: 260 });
    } else if (mounted) {
      translateX.value = withSpring(SIDEBAR_WIDTH, { damping: 24, stiffness: 320, mass: 1.0 }, () => {
        runOnJS(setMounted)(false);
      });
      backdropAlpha.value = withTiming(0, { duration: 220 });
    }
  }, [visible, mounted]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropAlpha.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: SIDEBAR_WIDTH,
  }));

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <Animated.View style={[backdropStyle, { flex: 1 }]} className="bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View style={panelStyle} className="absolute top-0 bottom-0 right-0 bg-seegla-navy">
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-end px-5 pt-4 pb-2">
              <Pressable className="w-9 h-9 rounded-full bg-white/10 items-center justify-center" onPress={onClose}>
                <X size={18} color="#fff" />
              </Pressable>
            </View>

            <View className="px-6 pb-6 border-b border-white/10">
              <View className={`w-16 h-16 rounded-full ${user.avatarColor} items-center justify-center mb-3`}>
                <Text className="text-white text-xl font-bold">{user.initials}</Text>
              </View>
              <Text className="text-white text-lg font-bold">{user.name}</Text>
              <Text className="text-white/60 text-sm">{user.role}</Text>
              <Text className="text-white/40 text-xs mt-0.5">{user.company}</Text>
            </View>

            <View className="flex-1 py-4">
              {SIDEBAR_LINKS.map(({ icon: Icon, label }) => (
                <Pressable key={label} className="flex-row items-center gap-4 px-6 py-4" onPress={onClose}>
                  <Icon size={20} color="rgba(255,255,255,0.70)" />
                  <Text className="text-white text-base font-medium">{label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable className="flex-row items-center gap-4 px-6 py-5 border-t border-white/10" onPress={onLogout}>
              <LogOut size={20} color={COLORS.orange} />
              <Text className="text-seegla-orange text-base font-medium">Log Out</Text>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
