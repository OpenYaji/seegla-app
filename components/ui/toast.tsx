import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';

import { Text } from '@/components/ui/text';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastAPI {
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Config ────────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  { Icon: typeof CheckCircle2; iconColor: string }
> = {
  success: { Icon: CheckCircle2, iconColor: '#16A34A' },
  error:   { Icon: AlertCircle,  iconColor: '#DC2626' },
  info:    { Icon: Info,         iconColor: '#3B82F6' },
};

const AUTO_DISMISS_MS = 4000;
const ANIM_MS         = 200;

// ─── Single toast ──────────────────────────────────────────────────────────────

function Toast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { Icon, iconColor } = TOAST_CONFIG[item.type];

  const translateY = useSharedValue(-80);
  const opacity    = useSharedValue(0);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-80, { duration: ANIM_MS });
    opacity.value    = withTiming(0, { duration: ANIM_MS }, (finished) => {
      if (finished) runOnJS(onDismiss)(item.id);
    });
  }, [item.id, onDismiss, opacity, translateY]);

  // Animate in on mount, then auto-dismiss
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Trigger entrance after the component is first rendered
  const onLayout = useCallback(() => {
    translateY.value = withTiming(0, { duration: ANIM_MS });
    opacity.value    = withTiming(1, { duration: ANIM_MS });
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
  }, [dismiss, opacity, translateY]);

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        animStyle,
        {
          marginBottom: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.08)',
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        },
      ]}
    >
      <Icon size={20} strokeWidth={2.5} color={iconColor} />

      <View style={{ flex: 1, gap: 2 }}>
        <Text className="text-[#0A2E5C] text-sm font-bold" numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text className="text-[#6B7280] text-xs" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <Pressable onPress={dismiss} hitSlop={8}>
        <X size={16} strokeWidth={2.5} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  const add = useCallback((type: ToastType, title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api: ToastAPI = {
    success: (title, description) => add('success', title, description),
    error:   (title, description) => add('error',   title, description),
    info:    (title, description) => add('info',    title, description),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast container — floating at the top */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 16,
          right: 16,
          zIndex: 9999,
        }}
      >
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onDismiss={remove} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
