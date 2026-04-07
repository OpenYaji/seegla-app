import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ShoppingBag, Lock } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/constants';
import { CURRENT_USER, MARKETPLACE_ITEMS, type MarketplaceItem } from '@/lib/data/static';

const CATEGORY_LABELS: Record<string, string> = {
  food:      '🍔 Food & Drinks',
  transport: '🚗 Transport',
  retail:    '🛍️ Retail',
  wellness:  '💪 Wellness',
};

function VoucherCard({ item }: { item: MarketplaceItem }) {
  const canAfford  = CURRENT_USER.points >= item.pointsCost;
  const redeemable = item.available && canAfford;

  return (
    <View
      className={`bg-card rounded-lg p-4 border ${
        item.available ? 'border-border' : 'border-border/50 opacity-60'
      }`}
    >
      {/* Brand avatar */}
      <View className={`w-11 h-11 rounded-lg ${item.brandColor} items-center justify-center mb-3`}>
        {item.available
          ? <Text className="text-white text-sm font-bold">{item.initials}</Text>
          : <Lock size={16} color="rgba(255,255,255,0.7)" />
        }
      </View>

      <Text className="text-foreground text-sm font-semibold leading-tight" numberOfLines={2}>
        {item.title}
      </Text>
      <Text variant="muted" className="text-xs mt-0.5 mb-3">{item.brand}</Text>

      {/* Cost */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className={`text-base font-bold ${canAfford ? 'text-seegla-orange' : 'text-muted-foreground'}`}>
          {item.pointsCost.toLocaleString()} pts
        </Text>
        {!item.available && (
          <Text variant="muted" className="text-xs">Sold out</Text>
        )}
      </View>

      <Button
        size="sm"
        variant={redeemable ? 'default' : 'outline'}
        className="rounded-lg"
        disabled={!redeemable}
      >
        <Text className={redeemable ? '' : 'text-muted-foreground'}>
          {!item.available ? 'Sold Out' : !canAfford ? 'Need more pts' : 'Redeem'}
        </Text>
      </Button>
    </View>
  );
}

export default function MarketplaceScreen() {
  const categories = [...new Set(MARKETPLACE_ITEMS.map((i) => i.category))];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="px-5 pt-4 pb-4 border-b border-border">
          <Text className="text-foreground text-2xl font-bold">Marketplace</Text>
          <Text variant="muted" className="text-sm mt-0.5">Redeem your hard-earned points</Text>
        </View>

        {/* Points balance — full-bleed navy */}
        <View className="bg-seegla-navy px-5 py-5 flex-row items-center justify-between">
          <View>
            <Text className="text-white/60 text-xs uppercase tracking-widest">Available Points</Text>
            <Text className="text-white text-3xl font-bold mt-0.5">
              {CURRENT_USER.points.toLocaleString()}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-seegla-orange/20 items-center justify-center">
            <ShoppingBag size={24} color={COLORS.orange} />
          </View>
        </View>

        {/* Section gutter */}
        <View className="h-2 bg-muted" />

        {/* Items by category */}
        {categories.map((cat, ci) => (
          <View key={cat}>
            {ci > 0 && <View className="h-2 bg-muted" />}
            <View className="px-5 pt-4 pb-1">
              <Text className="text-foreground text-sm font-semibold">
                {CATEGORY_LABELS[cat]}
              </Text>
            </View>
            <View className="flex-row flex-wrap px-5 py-3 gap-3">
              {MARKETPLACE_ITEMS.filter((i) => i.category === cat).map((item) => (
                <View key={item.id} className="w-[47%]">
                  <VoucherCard item={item} />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
