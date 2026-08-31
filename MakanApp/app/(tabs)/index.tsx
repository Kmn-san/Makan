// app/(tabs)/index.tsx
import { getRestaurants } from '@/lib/api';
import { HomeHeader } from '@/components/HomeHeader';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Restaurant } from '@/types/restaurant';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    View,
} from 'react-native';

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
            {/* 🌟 The Header is now just one line! */}
            <HomeHeader />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF5A3C" />
                </View>
            ) : (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RestaurantCard item={item} onSelect={handleSelect} />
                    )}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 20,
                        paddingBottom: 32,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#FF5A3C"
                        />
                    }
                    ListHeaderComponent={
                        restaurants.length > 0 ? (
                            <View className="mb-4">
                                <Text className="text-[20px] font-extrabold text-gray-900">
                                    Restaurants
                                </Text>
                                <Text className="text-gray-500 text-sm mt-1">
                                    Choose a restaurant to start ordering
                                </Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-16 px-6">
                            <View className="w-20 h-20 bg-[#FFF1EE] rounded-full items-center justify-center mb-4">
                                <Ionicons name="restaurant-outline" size={38} color="#FF5A3C" />
                            </View>
                            <Text className="text-lg font-bold text-gray-900">
                                No restaurants yet
                            </Text>
                            <Text className="text-gray-500 text-sm text-center mt-2">
                                There are currently no restaurants available. Please check again later.
                            </Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}