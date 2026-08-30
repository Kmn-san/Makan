import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CartItem {
    id: string;
    name: string;
    variants: string[];
    price: number; // cents
    quantity: number;
    image?: string;
}

const formatRM = (cents: number) => {
    return `RM ${(cents / 100).toFixed(2)}`;
};

export default function CartScreen() {
    const router = useRouter();

    // Mock cart data
    // Replace this with your actual cart store later
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: '1',
            name: 'Curry Laksa',
            variants: ['Extra spicy', 'No tofu'],
            price: 1290,
            quantity: 1,
        },
        {
            id: '2',
            name: 'Brown Sugar Pearl',
            variants: ['50% sugar', 'Normal ice'],
            price: 990,
            quantity: 1,
        },
        {
            id: '3',
            name: 'Spring Roll (5pcs)',
            variants: ['Chilli sauce'],
            price: 650,
            quantity: 1,
        },
    ]);

    // -----------------------------
    // Calculations
    // -----------------------------

    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    // -----------------------------
    // Cart Actions
    // -----------------------------

    const updateQuantity = (id: string, change: number) => {
        setCartItems((currentItems) =>
            currentItems
                .map((item) => {
                    if (item.id !== id) {
                        return item;
                    }

                    const newQuantity = item.quantity + change;

                    return {
                        ...item,
                        quantity: newQuantity,
                    };
                })
                // Remove item when quantity reaches 0
                .filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const handleCheckout = () => {
        router.push('/checkout');
    };

    const handleBrowseMenu = () => {
        router.back();
    };

    // -----------------------------
    // Empty Cart
    // -----------------------------

    if (cartItems.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9FAFB]">
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#ffffff"
                />

                {/* Header */}
                <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-3 p-1"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#111827"
                        />
                    </TouchableOpacity>

                    <Text className="text-[20px] font-extrabold text-gray-900">
                        My Cart
                    </Text>
                </View>

                {/* Empty Cart State */}
                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <Ionicons
                            name="cart-outline"
                            size={48}
                            color="#9CA3AF"
                        />
                    </View>

                    <Text className="text-xl font-bold text-gray-800 mb-2">
                        Your cart is empty
                    </Text>

                    <Text className="text-gray-500 text-center mb-6">
                        Looks like you haven't added any items to your cart yet.
                    </Text>

                    <TouchableOpacity
                        className="bg-[#FF5A3C] px-8 py-3 rounded-xl"
                        onPress={handleBrowseMenu}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold">
                            Browse Menu
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // -----------------------------
    // Cart
    // -----------------------------

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#ffffff"
            />

            {/* Header */}
            <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-3 p-1"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="#111827"
                        />
                    </TouchableOpacity>

                    <Text className="text-[20px] font-extrabold text-gray-900">
                        My Cart
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={clearCart}
                    activeOpacity={0.7}
                >
                    <Text className="text-[#FF5A3C] font-semibold">
                        Clear
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Cart Content */}
            <ScrollView
                className="flex-1 px-5 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            >
                {/* Cart Items */}
                {cartItems.map((item) => (
                    <View
                        key={item.id}
                        className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                    >
                        {/* Item Header */}
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1 mr-3">
                                <Text className="text-base font-bold text-gray-900">
                                    {item.name}
                                </Text>

                                {/* Variants */}
                                {item.variants.length > 0 && (
                                    <Text className="text-gray-500 text-sm mt-1">
                                        {item.variants.join(' · ')}
                                    </Text>
                                )}
                            </View>

                            {/* Item Price */}
                            <Text className="text-[#FF5A3C] font-extrabold">
                                {formatRM(item.price)}
                            </Text>
                        </View>

                        {/* Quantity Controls */}
                        <View className="flex-row items-center justify-end mt-3">
                            {/* Minus */}
                            <TouchableOpacity
                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                                onPress={() =>
                                    updateQuantity(item.id, -1)
                                }
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="remove"
                                    size={18}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>

                            {/* Quantity */}
                            <Text className="mx-4 text-base font-bold text-gray-900">
                                {item.quantity}
                            </Text>

                            {/* Plus */}
                            <TouchableOpacity
                                className="w-8 h-8 bg-[#FF5A3C] rounded-full items-center justify-center"
                                onPress={() =>
                                    updateQuantity(item.id, 1)
                                }
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="add"
                                    size={18}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Subtotal Section */}
                <View className="bg-white rounded-xl p-4 mt-2 mb-6 shadow-sm border border-gray-100">
                    {/* Individual Items */}
                    {cartItems.map((item) => (
                        <View
                            key={`subtotal-${item.id}`}
                            className="flex-row justify-between items-center py-2 border-b border-gray-50"
                        >
                            <Text
                                className="text-gray-600 text-sm flex-1 mr-3"
                                numberOfLines={1}
                            >
                                {item.name}
                            </Text>

                            <Text className="text-gray-800 font-semibold">
                                {formatRM(item.price * item.quantity)}
                            </Text>
                        </View>
                    ))}

                    {/* Total */}
                    <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200">
                        <Text className="text-base font-bold text-gray-900">
                            Total ({totalItems}{' '}
                            {totalItems === 1 ? 'item' : 'items'})
                        </Text>

                        <Text className="text-lg font-extrabold text-[#FF5A3C]">
                            {formatRM(cartTotal)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Checkout Button */}
            <View className="bg-white border-t border-gray-200 px-5 py-4">
                <TouchableOpacity
                    className="bg-[#FF5A3C] rounded-xl py-4 items-center"
                    onPress={handleCheckout}
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-bold text-base">
                        Checkout {formatRM(cartTotal)}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}