import { MenuItem } from '@/types/menu';
import { formatRM } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface MenuItemCardProps {
    item: MenuItem;
    restaurantId: string;
}

export function MenuItemCard({ item, restaurantId }: MenuItemCardProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() =>
                router.push({
                    pathname: '/restaurant/menu-item/[itemId]',
                    params: {
                        restaurantId,
                        itemId: item.id,
                    },
                })
            }
            activeOpacity={0.8}
        >
            <View className="flex-row items-center">
                {/* Image - Left */}
                <View className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 mr-4">
                    {item.image_url ? (
                        <Image
                            source={{ uri: item.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Ionicons
                                name="fast-food-outline"
                                size={32}
                                color="#9CA3AF"
                            />
                        </View>
                    )}
                </View>

                {/* Information - Right */}
                <View className="flex-1">
                    {/* Name */}
                    <Text
                        className="text-base font-bold text-gray-900"
                        numberOfLines={2}
                    >
                        {item.name}
                    </Text>

                    {/* Rating */}
                    <View className="flex-row items-center mt-1">
                        <Ionicons
                            name="star"
                            size={14}
                            color="#FBBF24"
                        />
                        <Text className="text-gray-600 text-sm ml-1">
                            {item.rating ?? '4.5'}
                        </Text>
                    </View>

                    {/* Price + Add Button */}
                    <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-[#FF5A3C] font-extrabold">
                            {formatRM(item.price_cents)}
                        </Text>

                        <TouchableOpacity
                            className="w-10 h-10 bg-[#FF5A3C] rounded-full items-center justify-center"
                            onPress={() => {
                                console.log('Added to cart:', item.name);
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="add"
                                size={24}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}