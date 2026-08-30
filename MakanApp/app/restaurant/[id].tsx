import { getMenu } from '@/lib/api';
import { MenuItemCard } from '@/components/MenuItemCard';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Category } from '@/types/menu';
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
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const restaurant = useRestaurantStore((state) => state.selectedRestaurant);

    // Store Hooks
    const orderType = useRestaurantStore((s) => s.orderType);
    const setOrderType = useRestaurantStore((s) => s.setOrderType);
    const selectedTable = useRestaurantStore((s) => s.selectedTable);

    // Local State
    const [menu, setMenu] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false); // 🌟 New: toggle search bar
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 🌟 New: category filter

    // Mock cart data
    const cartItems = 3;
    const cartTotal = 2580;

    // Tab Logic
    const handleTabPress = (tab: 'pickup' | 'dine_in') => {
        if (tab === 'pickup') {
            setOrderType('pickup');
            return;
        }
        if (!selectedTable) {
            router.push('/scan-table');
            return;
        }
        setOrderType('dine_in');
    };

    // Fetch Menu
    useEffect(() => {
        if (!id) return;

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

    // Search Logic
    const allItems = menu.flatMap((category) => category.items);

    // 🌟 Enhanced filtering: by search query AND by selected category
    const filteredMenu: Category[] = menu
        .map((category) => {
            // If a category is selected, only show items from that category
            if (selectedCategory && category.name !== selectedCategory) {
                return null;
            }

            // Filter items by search query
            const filteredItems = category.items.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return {
                ...category,
                items: filteredItems,
            };
        })
        .filter((cat): cat is Category => cat !== null && cat.items.length > 0);

    // Render Category
    const renderCategory = ({ item }: { item: Category }) => {
        return (
            <View className="mb-6">
                <Text className="text-lg font-extrabold text-gray-900 mb-3">
                    {item.name}
                </Text>

                {item.items.map((menuItem) => (
                    <MenuItemCard
                        key={menuItem.id}
                        item={menuItem}
                        restaurantId={id as string}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 🌟 HEADER: Back Button + Restaurant Name + Search Icon */}
            <View className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    {/* Left: Back button + Restaurant name */}
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-3 p-1"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
                            {restaurant?.name || 'Restaurant'}
                        </Text>
                    </View>

                    {/* Right: Search icon */}
                    <TouchableOpacity
                        onPress={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isSearchOpen ? 'close' : 'search'}
                            size={24}
                            color="#111827"
                        />
                    </TouchableOpacity>
                </View>

                {/* 🌟 Expandable Search Bar (only shows when icon is tapped) */}
                {isSearchOpen && (
                    <View className="mt-3">
                        <View className="flex-row items-center bg-[#F3F4F6] rounded-xl px-4 py-3">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-2 text-base text-gray-900"
                                placeholder="Search menu..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* 🌟 TABS: Pickup / Dine-In */}
            <View className="flex-row px-4 py-3 bg-white border-b border-gray-100 items-center">
                <TouchableOpacity
                    className={`mr-6 py-2 ${orderType === 'pickup' ? 'border-b-2 border-[#FF5A3C]' : ''}`}
                    onPress={() => handleTabPress('pickup')}
                >
                    <Text className={`font-semibold ${orderType === 'pickup' ? 'text-[#FF5A3C]' : 'text-gray-500'}`}>
                        Pickup
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`py-2 ${orderType === 'dine_in' ? 'border-b-2 border-[#FF5A3C]' : ''}`}
                    onPress={() => handleTabPress('dine_in')}
                >
                    <Text className={`font-semibold ${orderType === 'dine_in' ? 'text-[#FF5A3C]' : 'text-gray-500'}`}>
                        Dine-In
                    </Text>
                </TouchableOpacity>

                {/* Table Badge */}
                {selectedTable && (
                    <TouchableOpacity
                        className="ml-auto flex-row items-center bg-[#FFF1EE] rounded-full px-3 py-1"
                        onPress={() => router.push('/scan-table')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="qr-code-outline" size={14} color="#FF5A3C" />
                        <Text className="text-[#FF5A3C] text-xs font-bold ml-1">
                            Table {selectedTable.table_code}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 🌟 CATEGORY FILTERS: Horizontal scrollable chips */}
            {/* 🌟 CATEGORY FILTERS: Improved horizontal chips */}
            <View className="bg-white border-b border-gray-100">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        gap: 8, // 🌟 Consistent spacing between all chips
                    }}
                >
                    {/* "All" chip */}
                    <TouchableOpacity
                        className={`px-5 py-2.5 rounded-full ${!selectedCategory ? 'bg-[#FF5A3C]' : 'bg-gray-100'
                            }`}
                        onPress={() => setSelectedCategory(null)}
                        activeOpacity={0.7}
                        style={{
                            // 🌟 Add shadow for selected state
                            shadowColor: !selectedCategory ? '#FF5A3C' : 'transparent',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: !selectedCategory ? 4 : 0,
                        }}
                    >
                        <Text
                            className={`font-semibold text-sm ${!selectedCategory ? 'text-white' : 'text-gray-600'
                                }`}
                        >
                            All
                        </Text>
                    </TouchableOpacity>

                    {/* Category chips */}
                    {menu.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            className={`px-5 py-2.5 rounded-full ${selectedCategory === category.name
                                    ? 'bg-[#FF5A3C]'
                                    : 'bg-gray-100'
                                }`}
                            onPress={() => setSelectedCategory(category.name)}
                            activeOpacity={0.7}
                            style={{
                                shadowColor:
                                    selectedCategory === category.name
                                        ? '#FF5A3C'
                                        : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation:
                                    selectedCategory === category.name ? 4 : 0,
                            }}
                        >
                            <Text
                                className={`font-semibold text-sm ${selectedCategory === category.name
                                        ? 'text-white'
                                        : 'text-gray-600'
                                    }`}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Menu List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF5A3C" />
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
                            <Text className="text-white font-bold">{cartItems} items</Text>
                        </View>
                        <Text className="text-white font-semibold">
                            RM {(cartTotal / 100).toFixed(2)}
                        </Text>
                    </View>
                    <Text className="text-white font-bold">Checkout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}