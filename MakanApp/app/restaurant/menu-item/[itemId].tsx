import { getMenu } from '@/lib/api';
import { useRestaurantStore } from '@/store/restaurantStore';
import { MenuItem, OptionGroup, OptionValue } from '@/types/menu';
import { formatRM } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuItemDetailScreen() {
    const { restaurantId, itemId } = useLocalSearchParams<{
        restaurantId: string;
        itemId: string;
    }>();

    const router = useRouter();
    const restaurant = useRestaurantStore((s) => s.selectedRestaurant);

    const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [imageFailed, setImageFailed] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState<
        Record<string, string[]>
    >({});

    // Scroll animation
    const scrollY = useRef(new Animated.Value(0)).current;

    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        if (!restaurantId || !itemId) return;

        const fetchItem = async () => {
            try {
                setLoading(true);

                const response = await getMenu(restaurantId);

                const allItems = response.data.flatMap(
                    (cat: any) => cat.items
                );

                const found = allItems.find(
                    (item: MenuItem) => item.id === itemId
                );

                setMenuItem(found || null);
                setImageFailed(false);
            } catch (error) {
                console.error('Failed to load item:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [restaurantId, itemId]);

    const toggleOption = (
        optionId: string,
        valueId: string,
        isMultiple: boolean
    ) => {
        setSelectedOptions((prev) => {
            const current = prev[optionId] || [];

            if (isMultiple) {
                return {
                    ...prev,
                    [optionId]: current.includes(valueId)
                        ? current.filter((id) => id !== valueId)
                        : [...current, valueId],
                };
            }

            return {
                ...prev,
                [optionId]: current.includes(valueId)
                    ? []
                    : [valueId],
            };
        });
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9FAFB] items-center justify-center">
                <ActivityIndicator size="large" color="#FF5A3C" />
            </SafeAreaView>
        );
    }

    if (!menuItem) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9FAFB] items-center justify-center">
                <Text className="text-gray-500">
                    Item not found
                </Text>
            </SafeAreaView>
        );
    }

    // Calculate selected options price
    const basePrice = menuItem.price_cents;

    const optionsPrice = Object.values(selectedOptions)
        .flat()
        .reduce((sum, valueId) => {
            const group = menuItem.options.find((g) =>
                g.values.some((v) => v.id === valueId)
            );

            const value = group?.values.find(
                (v) => v.id === valueId
            );

            return sum + (value?.price_delta_cents || 0);
        }, 0);

    const unitPrice = basePrice + optionsPrice;
    const totalPrice = unitPrice * quantity;

    // Header animation
    const headerBackground = scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: ['transparent', '#FFFFFF'],
        extrapolate: 'clamp',
    });

    const headerButtonBackground = scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: ['rgba(0,0,0,0.40)', 'rgba(243,244,246,1)'],
        extrapolate: 'clamp',
    });

    const iconColor = scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: ['#FFFFFF', '#111827'],
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#ffffff"
            />

            {/* ===================================================== */}
            {/* STICKY TOP HEADER */}
            {/* ===================================================== */}

            <Animated.View
                className="absolute top-0 left-0 right-0 z-50"
                style={{
                    backgroundColor: headerBackground,
                }}
            >
                <View className="px-4 pt-3 pb-3 flex-row items-center justify-between">

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: headerButtonBackground,
                            }}
                        >
                            <Animated.Text>
                                <Ionicons
                                    name="arrow-back"
                                    size={22}
                                    color="#111827"
                                />
                            </Animated.Text>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Search Button */}
                    <TouchableOpacity
                        onPress={() =>
                            setIsSearchOpen(!isSearchOpen)
                        }
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: headerButtonBackground,
                            }}
                        >
                            <Ionicons
                                name={
                                    isSearchOpen
                                        ? 'close'
                                        : 'search'
                                }
                                size={22}
                                color="#111827"
                            />
                        </Animated.View>
                    </TouchableOpacity>

                </View>

                {/* Search Bar */}
                {isSearchOpen && (
                    <View className="px-4 pb-3">
                        <View className="flex-row items-center bg-[#F3F4F6] rounded-xl px-4 py-3">
                            <Ionicons
                                name="search"
                                size={20}
                                color="#9CA3AF"
                            />

                            <Text
                                className="flex-1 ml-2 text-base text-gray-500"
                            >
                                Search menu...
                            </Text>
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* ===================================================== */}
            {/* SCROLLABLE CONTENT */}
            {/* ===================================================== */}

            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [
                        {
                            nativeEvent: {
                                contentOffset: {
                                    y: scrollY,
                                },
                            },
                        },
                    ],
                    {
                        useNativeDriver: false,
                    }
                )}
            >
                {/* Hero Image */}

                <View className="relative bg-gray-100">

                    {menuItem.image_url && !imageFailed ? (
                        <Image
                            source={{
                                uri: menuItem.image_url,
                            }}
                            className="h-72 w-full"
                            resizeMode="cover"
                            onError={() =>
                                setImageFailed(true)
                            }
                        />
                    ) : (
                        <View className="h-72 items-center justify-center bg-gray-100">
                            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-2">
                                <Ionicons
                                    name="fast-food-outline"
                                    size={40}
                                    color="#9CA3AF"
                                />
                            </View>

                            <Text className="text-gray-400 text-sm">
                                No photo available
                            </Text>
                        </View>
                    )}

                </View>

                {/* Item Information */}

                <View className="bg-white px-5 py-5 mb-3">

                    {/* Price */}

                    <Text className="text-2xl font-extrabold text-[#FF5A3C] mb-2">
                        {formatRM(basePrice)}
                    </Text>

                    {/* Name */}

                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                        {menuItem.name}
                    </Text>

                    {/* Description */}

                    {menuItem.descriptions && (
                        <Text className="text-gray-600 text-base leading-5">
                            {menuItem.descriptions}
                        </Text>
                    )}

                </View>

                {/* ================================================= */}
                {/* OPTIONS */}
                {/* ================================================= */}

                {menuItem.options.length > 0 && (
                    <View className="bg-white px-5 py-5 mb-3">

                        <Text className="text-lg font-bold text-gray-900 mb-4">
                            Customize
                        </Text>

                        {menuItem.options.map(
                            (group: OptionGroup) => {

                                const isMultiple =
                                    group.max_select > 1;

                                return (
                                    <View
                                        key={group.id}
                                        className="mb-5"
                                    >

                                        <View className="flex-row items-center mb-3">

                                            <Text className="text-base font-bold text-gray-900">
                                                {group.name}
                                            </Text>

                                            <Text className="text-gray-500 text-sm ml-2">
                                                (
                                                {isMultiple
                                                    ? 'Multiple'
                                                    : 'Single'}{' '}
                                                choice
                                                {group.min_select > 0
                                                    ? ', Required'
                                                    : ''}
                                                )
                                            </Text>

                                        </View>

                                        {group.values.map(
                                            (
                                                value: OptionValue
                                            ) => {

                                                const isSelected =
                                                    selectedOptions[
                                                        group.id
                                                    ]?.includes(
                                                        value.id
                                                    );

                                                return (
                                                    <TouchableOpacity
                                                        key={
                                                            value.id
                                                        }
                                                        className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${isSelected
                                                                ? 'bg-[#FFF1EE]'
                                                                : ''
                                                            }`}
                                                        onPress={() =>
                                                            toggleOption(
                                                                group.id,
                                                                value.id,
                                                                isMultiple
                                                            )
                                                        }
                                                        activeOpacity={
                                                            0.7
                                                        }
                                                    >

                                                        <View className="flex-row items-center flex-1">

                                                            <View
                                                                className={`w-5 h-5 border-2 rounded-full mr-3 items-center justify-center ${isSelected
                                                                        ? 'border-[#FF5A3C] bg-[#FF5A3C]'
                                                                        : 'border-gray-300'
                                                                    }`}
                                                            >
                                                                {isSelected && (
                                                                    <View className="w-2 h-2 bg-white rounded-full" />
                                                                )}
                                                            </View>

                                                            <Text className="text-base text-gray-900">
                                                                {
                                                                    value.name
                                                                }
                                                            </Text>

                                                        </View>

                                                        {value.price_delta_cents >
                                                            0 && (
                                                                <Text className="text-[#FF5A3C] font-semibold">
                                                                    +
                                                                    {formatRM(
                                                                        value.price_delta_cents
                                                                    )}
                                                                </Text>
                                                            )}

                                                    </TouchableOpacity>
                                                );
                                            }
                                        )}

                                    </View>
                                );
                            }
                        )}

                    </View>
                )}

                {/* Extra bottom space so content isn't hidden */}
                <View className="h-6" />

            </Animated.ScrollView>

            {/* ===================================================== */}
            {/* BOTTOM ADD TO CART */}
            {/* ===================================================== */}

            <View className="bg-white border-t border-gray-200 px-5 py-4">

                <View className="flex-row items-center justify-between mb-3">

                    {/* Quantity */}

                    <View className="flex-row items-center">

                        <TouchableOpacity
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            onPress={() =>
                                setQuantity(
                                    Math.max(
                                        1,
                                        quantity - 1
                                    )
                                )
                            }
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="remove"
                                size={20}
                                color="#111827"
                            />
                        </TouchableOpacity>

                        <Text className="mx-4 text-lg font-bold text-gray-900">
                            {quantity}
                        </Text>

                        <TouchableOpacity
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            onPress={() =>
                                setQuantity(quantity + 1)
                            }
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="add"
                                size={20}
                                color="#111827"
                            />
                        </TouchableOpacity>

                    </View>

                    {/* Total */}

                    <Text className="text-xl font-extrabold text-[#FF5A3C]">
                        {formatRM(totalPrice)}
                    </Text>

                </View>

                {/* Add To Cart */}

                <TouchableOpacity
                    className="bg-[#FF5A3C] rounded-xl py-4 items-center"
                    onPress={() => {
                        console.log('Add to Cart:', {
                            menuItemId: menuItem.id,
                            quantity,
                            options: selectedOptions,
                        });

                        router.back();
                    }}
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-bold text-base">
                        Add to Cart
                    </Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>
    );
}