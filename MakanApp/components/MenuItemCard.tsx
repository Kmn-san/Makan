import { MenuItem } from '@/types/menu';
import { formatRM } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface MenuItemCardProps {
    item: MenuItem;
    restaurantId: string;
}

export function MenuItemCard({ item, restaurantId }: MenuItemCardProps) {
    const router = useRouter(); // 🌟 No need to pass it from the parent anymore

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() =>
                router.push({
                    pathname: '/restaurant/[restaurantId]/menu-item/[itemId]' as any,
                    params: {
                        restaurantId,
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
                </View>

                <TouchableOpacity
                    className="w-10 h-10 bg-[#FF5A3C] rounded-full items-center justify-center"
                    onPress={() => {
                        console.log('Added to cart:', item.name);
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}