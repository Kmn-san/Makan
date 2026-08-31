import { Restaurant } from '@/types/restaurant';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface RestaurantCardProps {
    item: Restaurant;
    onSelect: (restaurant: Restaurant) => void;
}

export function RestaurantCard({ item, onSelect }: RestaurantCardProps) {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = !!item.image_url && !imageFailed;

    return (
        <TouchableOpacity
            className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100"
            onPress={() => onSelect(item)}
            activeOpacity={0.85}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            {/* Restaurant Image */}
            <View className="w-full h-44 bg-gray-100">
                {showImage ? (
                    <Image
                        source={{ uri: item.image_url! }}
                        className="w-full h-full"
                        resizeMode="cover"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <View className="flex-1 bg-[#FFF1EE] items-center justify-center">
                        <View className="w-16 h-16 bg-white rounded-full items-center justify-center">
                            <Ionicons name="storefront-outline" size={32} color="#FF5A3C" />
                        </View>
                    </View>
                )}

                {/* Floating Arrow */}
                <View className="absolute top-3 right-3 w-9 h-9 bg-black/30 rounded-full items-center justify-center">
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
            </View>

            {/* Restaurant Information */}
            <View className="px-4 py-4">
                <View className="flex-row items-center justify-between">
                    <Text className="text-[18px] font-extrabold text-gray-900 flex-1 mr-3" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View className="flex-row items-center bg-[#FFF7ED] rounded-full px-2.5 py-1">
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text className="text-gray-700 text-xs font-bold ml-1">4.5</Text>
                    </View>
                </View>

                <View className="flex-row items-center mt-2">
                    <Ionicons name="location-outline" size={15} color="#9CA3AF" />
                    <Text className="text-gray-500 text-[13px] ml-1 flex-1" numberOfLines={1}>
                        {item.address ?? 'No address'}
                    </Text>
                </View>

                <View className="flex-row items-center mt-3">
                    <View className="flex-row items-center bg-[#F3F4F6] rounded-full px-3 py-1.5 mr-2">
                        <Ionicons name="bag-handle-outline" size={13} color="#6B7280" />
                        <Text className="text-gray-600 text-xs font-medium ml-1">Pickup</Text>
                    </View>
                    <View className="flex-row items-center bg-[#F3F4F6] rounded-full px-3 py-1.5">
                        <Ionicons name="restaurant-outline" size={13} color="#6B7280" />
                        <Text className="text-gray-600 text-xs font-medium ml-1">Dine-In</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}