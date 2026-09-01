import { useCartStore, CartItem } from '@/store/cartStore';
import { formatRM } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const clearCart = useCartStore((s) => s.clearCart);
    const totalItems = useCartStore((s) => s.getTotalItems());
    const totalPrice = useCartStore((s) => s.getTotalPrice());

    const calculateItemPrice = (item: CartItem) => {
        const optionsPrice = item.options.reduce((sum, opt) => sum + opt.price_delta_cents, 0);
        return (item.basePriceCents + optionsPrice) * item.quantity;
    };

    if (items.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9FAFB]">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-[20px] font-extrabold text-gray-900">My Cart</Text>
                </View>

                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
                    </View>
                    <Text className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</Text>
                    <Text className="text-gray-500 text-center mb-6">
                        Looks like you haven't added any items to your cart yet.
                    </Text>
                    <TouchableOpacity
                        className="bg-[#FF5A3C] px-8 py-3 rounded-xl"
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold">Browse Menu</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-[20px] font-extrabold text-gray-900">My Cart</Text>
                </View>
                <TouchableOpacity onPress={clearCart} activeOpacity={0.7}>
                    <Text className="text-[#FF5A3C] font-semibold">Clear</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {items.map((item) => (
                    <View key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1 mr-3">
                                <Text className="text-base font-bold text-gray-900">{item.menuItemName}</Text>

                                {item.options.length > 0 && (
                                    <Text className="text-gray-500 text-sm mt-1">
                                        {item.options.map((opt) => opt.valueName).join(' · ')}
                                    </Text>
                                )}

                                {/*Show the note */}
                                {item.note && (
                                    <View className="flex-row items-start mt-2 bg-[#FFF7ED] rounded-lg px-2 py-1.5">
                                        <Ionicons name="chatbubble-ellipses-outline" size={12} color="#FF5A3C" style={{ marginTop: 2 }} />
                                        <Text className="text-[#FF5A3C] text-xs ml-1 flex-1">
                                            {item.note}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text className="text-[#FF5A3C] font-extrabold">
                                {formatRM(calculateItemPrice(item))}
                            </Text>
                        </View>

                        <View className="flex-row items-center justify-end mt-3">
                            <TouchableOpacity
                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="remove" size={18} color="#6B7280" />
                            </TouchableOpacity>

                            <Text className="mx-4 text-base font-bold text-gray-900">{item.quantity}</Text>

                            <TouchableOpacity
                                className="w-8 h-8 bg-[#FF5A3C] rounded-full items-center justify-center"
                                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View className="bg-white rounded-xl p-4 mt-2 mb-6 shadow-sm border border-gray-100">
                    {items.map((item) => (
                        <View
                            key={`subtotal-${item.id}`}
                            className="flex-row justify-between items-center py-2 border-b border-gray-50"
                        >
                            <Text className="text-gray-600 text-sm flex-1 mr-3" numberOfLines={1}>
                                {item.menuItemName} × {item.quantity}
                            </Text>
                            <Text className="text-gray-800 font-semibold">
                                {formatRM(calculateItemPrice(item))}
                            </Text>
                        </View>
                    ))}

                    <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200">
                        <Text className="text-base font-bold text-gray-900">
                            Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                        </Text>
                        <Text className="text-lg font-extrabold text-[#FF5A3C]">{formatRM(totalPrice)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View className="bg-white border-t border-gray-200 px-5 py-4">
                <TouchableOpacity
                    className="bg-[#FF5A3C] rounded-xl py-4 items-center"
                    onPress={() => router.push('/checkout')}
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-bold text-base">Checkout {formatRM(totalPrice)}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}