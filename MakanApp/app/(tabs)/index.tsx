import { getRestaurants } from '@/lib/api';
import { Restaurant, useRestaurantStore } from '@/store/restaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RestaurantCardProps {
    item: Restaurant;
    onSelect: (restaurant: Restaurant) => void;
}

const RestaurantCard = ({ item, onSelect }: RestaurantCardProps) => (
    <TouchableOpacity
        className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
        onPress={() => onSelect(item)}
        activeOpacity={0.8}
    >
        <View className="w-[52px] h-[52px] rounded-2xl bg-[#FFF1EE] justify-center items-center mr-3">
            <Ionicons name="storefront-outline" size={26} color="#FF5A3C" />
        </View>
        <View className="flex-1">
            <Text className="text-[17px] font-bold text-gray-900">{item.name}</Text>
            <Text className="text-gray-500 mt-0.5 text-[13px]" numberOfLines={1}>
                {item.address ?? 'No address'}
            </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
);

export default function HomeScreen() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const selectRestaurant = useRestaurantStore((s) => s.selectRestaurant);
    const router = useRouter();

    const fetchRestaurants = useCallback(async () => {
        try {
            const res = await getRestaurants();
            setRestaurants(res.data);
        } catch (error) {
            console.error('Failed to load restaurants', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    const handleSelect = (restaurant: Restaurant) => {
        selectRestaurant(restaurant);
        router.push({
            pathname: '/restaurant/[id]' as any,
            params: { id: restaurant.id },
        });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRestaurants();
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            <View className="bg-[#FF5A3C] pt-[60px] pb-6 px-5">
                <Text className="text-[32px] font-extrabold text-white">Makan! 🍽️</Text>
                <Text className="text-[#FFE4DE] mt-1 text-[15px]">Where would you like to eat today?</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF5A3C" />
                </View>
            ) : (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RestaurantCard
                            item={item}
                            onSelect={handleSelect}
                        />
                    )}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 mt-10">No restaurants available yet.</Text>
                    }
                />
            )}
        </View>
    );
}