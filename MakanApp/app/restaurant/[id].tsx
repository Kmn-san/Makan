import { getMenu } from '@/lib/api';
import { MenuItemCard } from '@/components/MenuItemCard';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Category } from '@/types/menu';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
    ScrollView,
    Animated,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '@/store/cartStore';
import { formatRM } from '@/utils/format';

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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [imageFailed, setImageFailed] = useState(false);
    const [isImageVisible, setIsImageVisible] = useState(true);

    // Mock cart data
    const totalItems = useCartStore((s) => s.getTotalItems());
    const totalPrice = useCartStore((s) => s.getTotalPrice());

    // Animated value for scroll
    const scrollY = useRef(new Animated.Value(0)).current;

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

    const filteredMenu: Category[] = menu
        .map((category) => {
            if (selectedCategory && category.name !== selectedCategory) {
                return null;
            }
            const filteredItems = category.items.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return { ...category, items: filteredItems };
        })
        .filter((cat): cat is Category => cat !== null && cat.items.length > 0);

    // Render Category
    const renderCategory = ({ item }: { item: Category }) => {
        return (
            <View className="mb-6 px-4">
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

    // Handle scroll to detect when image is scrolled past
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                setIsImageVisible(offsetY < 200);
            },
        }
    );

    // Combine all top UI into a Header Component for the FlatList
    const renderHeader = () => (
        <View>
            {/* Hero Image with Floating Buttons */}
            <View className="relative bg-gray-100">
                {restaurant?.image_url && !imageFailed ? (
                    <Image
                        source={{ uri: restaurant.image_url }}
                        className="h-64 w-full"
                        resizeMode="cover"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <View className="h-64 bg-gray-100 items-center justify-center">
                        <Ionicons name="storefront-outline" size={60} color="#9CA3AF" />
                        <Text className="text-gray-400 mt-2">No photo available</Text>
                    </View>
                )}

                {/* Floating Back Button - Left */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-4 left-4 w-10 h-10 bg-black/40 rounded-full items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>

                {/* Floating Search Button - Right */}
                <TouchableOpacity
                    onPress={() => setIsSearchOpen(!isSearchOpen)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 rounded-full items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isSearchOpen ? 'close' : 'search'}
                        size={22}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>

            {/* Restaurant Info (Name + Address) */}
            <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
                <Text className="text-2xl font-extrabold text-gray-900">
                    {restaurant?.name || 'Restaurant'}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                    {restaurant?.address || 'No address provided'}
                </Text>

                {/* Expandable Search Bar */}
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
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* TABS: Pickup / Dine-In */}
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

            {/* CATEGORY FILTERS */}
            <View className="bg-white border-b border-gray-100">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
                >
                    <TouchableOpacity
                        className={`px-5 py-2.5 rounded-full ${!selectedCategory ? 'bg-[#FF5A3C]' : 'bg-gray-100'}`}
                        onPress={() => setSelectedCategory(null)}
                        activeOpacity={0.7}
                        style={{
                            shadowColor: !selectedCategory ? '#FF5A3C' : 'transparent',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: !selectedCategory ? 4 : 0,
                        }}
                    >
                        <Text className={`font-semibold text-sm ${!selectedCategory ? 'text-white' : 'text-gray-600'}`}>
                            All
                        </Text>
                    </TouchableOpacity>

                    {menu.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            className={`px-5 py-2.5 rounded-full ${selectedCategory === category.name ? 'bg-[#FF5A3C]' : 'bg-gray-100'}`}
                            onPress={() => setSelectedCategory(category.name)}
                            activeOpacity={0.7}
                            style={{
                                shadowColor: selectedCategory === category.name ? '#FF5A3C' : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: selectedCategory === category.name ? 4 : 0,
                            }}
                        >
                            <Text className={`font-semibold text-sm ${selectedCategory === category.name ? 'text-white' : 'text-gray-600'}`}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Spacer before list starts */}
            <View className="h-4 bg-[#F9FAFB]" />
        </View>
    );

    // Sticky Header Buttons (shown when scrolled past image)
    const renderStickyHeader = () => {
        const opacity = scrollY.interpolate({
            inputRange: [150, 200],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                className="absolute top-0 left-0 right-0 z-50 bg-white px-4 py-3 border-b border-gray-100"
                style={{
                    opacity: opacity,
                    transform: [{
                        translateY: scrollY.interpolate({
                            inputRange: [150, 200],
                            outputRange: [-100, 0],
                            extrapolate: 'clamp',
                        })
                    }]
                }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-900 ml-2">
                            {restaurant?.name || 'Menu'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsSearchOpen(!isSearchOpen)}
                        className="w-10 h-10 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isSearchOpen ? 'close' : 'search'}
                            size={24}
                            color="#111827"
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF5A3C" />
                </View>
            ) : (
                <>
                    {/* Sticky Header */}
                    {renderStickyHeader()}

                    <FlatList
                        data={filteredMenu}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCategory}
                        ListHeaderComponent={renderHeader}
                        contentContainerStyle={{
                            paddingBottom: 120,
                        }}
                        ListEmptyComponent={
                            <Text className="text-gray-400 text-center mt-10 px-4">
                                No items found
                            </Text>
                        }
                        showsVerticalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    />

                    {/* Bottom Cart Bar */}
                    {totalItems > 0 && (
                        <View className="absolute bottom-10 left-0 right-0 px-5">
                            <TouchableOpacity
                                className="flex-row justify-between items-center bg-[#FF5A3C] rounded-xl px-6 py-4 shadow-lg"
                                onPress={() => router.push('/cart')}
                                activeOpacity={0.8}
                                style={{
                                    shadowColor: '#FF5A3C',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 8,
                                }}
                            >
                                <View className="flex-row items-center">
                                    <View className="bg-white/20 rounded-full px-3 py-1 mr-3">
                                        <Text className="text-white font-bold">
                                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                        </Text>
                                    </View>
                                    <Text className="text-white font-semibold">
                                        {formatRM(totalPrice)}
                                    </Text>
                                </View>
                                <Text className="text-white font-bold">Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}