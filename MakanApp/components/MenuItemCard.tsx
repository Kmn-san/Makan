import { MenuItem } from '@/types/menu';
import { formatRM } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface MenuItemCardProps {
    item: MenuItem;
    restaurantId: string;
}

export function MenuItemCard({ item, restaurantId }: MenuItemCardProps) {
    const router = useRouter();
    const addItem = useCartStore((s) => s.addItem);

    // 🌟 Check if item has options that need selection
    const hasOptions = item.options && item.options.length > 0;

    const handleAddButton = (e: any) => {
        e.stopPropagation();

        if (hasOptions) {
            // 🌟 Item has options → navigate to detail page
            router.push({
                pathname: '/restaurant/menu-item/[itemId]' as any,
                params: {
                    itemId: item.id,
                },
            });
        } else {
            // 🌟 No options → quick add to cart
            addItem(item, 1, {}, '');
        }
    };

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() =>
                router.push({
                    pathname: '/restaurant/menu-item/[itemId]' as any,
                    params: {
                        itemId: item.id,
                    },
                })
            }
            activeOpacity={0.8}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-3">
                    <Text className="text-base font-bold text-gray-900">
                        {item.name}
                    </Text>

                    <View className="flex-row items-center mt-1">
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text className="text-gray-600 text-sm ml-1">
                            {item.rating ?? '4.5'}
                        </Text>
                    </View>

                    <Text className="text-[#FF5A3C] font-extrabold mt-1">
                        {formatRM(item.price_cents)}
                    </Text>

                    {/* 🌟 Show "Customize" hint if item has options */}
                    {hasOptions && (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="options-outline" size={12} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs ml-1">
                                Customize
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    className="w-10 h-10 bg-[#FF5A3C] rounded-full items-center justify-center"
                    onPress={handleAddButton}
                    activeOpacity={0.8}
                >
                    {/* 🌟 Show different icon based on whether options exist */}
                    <Ionicons
                        name={hasOptions ? "chevron-forward" : "add"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}