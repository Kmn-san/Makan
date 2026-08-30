import { getMenu } from '@/lib/api';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
interface OptionValue {
    id: string;
    name: string;
    price_delta_cents: number;
}

interface OptionGroup {
    id: string;
    name: string;
    min_select: number;
    max_select: number;
    values: OptionValue[];
}

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    rating?: number;
    options: OptionGroup[];
}

interface Category {
    id: string;
    name: string;
    items: MenuItem[];
}

const formatRM = (cents: number) => `RM ${(cents / 100).toFixed(2)}`;

interface MenuItemCardProps {
    item: MenuItem;
    restaurantId: string;
    router: ReturnType<typeof useRouter>;
}

const MenuItemCard = ({
    item,
    restaurantId,
    router,
}: MenuItemCardProps) => {
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
                        <Ionicons
                            name="star"
                            size={14}
                            color="#FBBF24"
                        />

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
                        // Add to cart logic here
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
        </TouchableOpacity>
    );
};

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const restaurant = useRestaurantStore(
        (state) => state.selectedRestaurant
    );

    const [menu, setMenu] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('Pickup');

    useEffect(() => {
        if (!id) {
            return;
        }

        const fetchMenu = async () => {
            try {
                setLoading(true);

                const response = await getMenu(id);

                setMenu(response.data);
            } catch (error) {
                console.error('Failed to load menu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [id]);

    /*
     * Mock cart data.
     * Replace this with your actual cart store later.
     */
    const cartItems = 3;
    const cartTotal = 2580;

    const renderCategory = ({
        item,
    }: {
        item: Category;
    }) => {
        return (
            <View className="mb-6">
                <Text className="text-lg font-extrabold text-gray-900 mb-3">
                    {item.name}
                </Text>

                {item.items.length === 0 ? (
                    <Text className="text-gray-400 text-center mt-2">
                        Sold out for today 😴
                    </Text>
                ) : (
                    item.items.map((menuItem) => (
                        <MenuItemCard
                            key={menuItem.id}
                            item={menuItem}
                            restaurantId={id as string}
                            router={router}
                        />
                    ))
                )}
            </View>
        );
    };

    /*
     * Flatten all menu items so search
     * can search across every category.
     */
    const allItems = menu.flatMap(
        (category) => category.items
    );

    const filteredMenu: Category[] =
        searchQuery.trim().length > 0
            ? [
                {
                    id: 'search',
                    name: 'Search Results',
                    items: allItems.filter((item) =>
                        item.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                    ),
                },
            ]
            : menu;

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#ffffff"
            />

            {/* Search Bar */}
            <View className="px-5 pt-4 pb-3 bg-white">
                <View className="flex-row items-center bg-[#F3F4F6] rounded-xl px-4 py-3">
                    <Ionicons
                        name="search"
                        size={20}
                        color="#9CA3AF"
                    />

                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-900"
                        placeholder="Search laksa, milk tea..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tabs - Pickup / Dine-In */}
            <View className="flex-row px-5 py-3 bg-white border-b border-gray-100">
                <TouchableOpacity
                    className={`mr-6 py-2 ${selectedTab === 'Pickup'
                        ? 'border-b-2 border-[#FF5A3C]'
                        : ''
                        }`}
                    onPress={() => setSelectedTab('Pickup')}
                >
                    <Text
                        className={`font-semibold ${selectedTab === 'Pickup'
                            ? 'text-[#FF5A3C]'
                            : 'text-gray-500'
                            }`}
                    >
                        Pickup
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`py-2 ${selectedTab === 'Dine-In'
                        ? 'border-b-2 border-[#FF5A3C]'
                        : ''
                        }`}
                    onPress={() => setSelectedTab('Dine-In')}
                >
                    <Text
                        className={`font-semibold ${selectedTab === 'Dine-In'
                            ? 'text-[#FF5A3C]'
                            : 'text-gray-500'
                            }`}
                    >
                        4g Dine-In
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Category Filters */}
            <View className="flex-row px-5 py-3 bg-white border-b border-gray-100">
                {['Noodles', 'Rice', 'Snacks', 'Milk*'].map(
                    (category) => (
                        <TouchableOpacity
                            key={category}
                            className="mr-6 py-1"
                        >
                            <Text className="text-gray-600 font-medium">
                                {category}
                            </Text>
                        </TouchableOpacity>
                    )
                )}
            </View>

            {/* Menu List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator
                        size="large"
                        color="#FF5A3C"
                    />
                </View>
            ) : (
                <FlatList
                    data={filteredMenu}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCategory}
                    contentContainerStyle={{
                        padding: 16,
                        paddingBottom: 100,
                    }}
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-center mt-10">
                            No items found
                        </Text>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Bottom Cart Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
                <TouchableOpacity
                    className="flex-row justify-between items-center bg-[#FF5A3C] rounded-xl px-6 py-4"
                    onPress={() => router.push('/cart')}
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center">
                        <View className="bg-white/20 rounded-full px-3 py-1 mr-3">
                            <Text className="text-white font-bold">
                                {cartItems} items
                            </Text>
                        </View>

                        <Text className="text-white font-semibold">
                            RM {(cartTotal / 100).toFixed(2)}
                        </Text>
                    </View>

                    <Text className="text-white font-bold">
                        Checkout
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
