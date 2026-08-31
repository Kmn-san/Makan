import RequireAuth from '@/components/RequireAuth';
import { useCartStore, CartItem } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { formatRM } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function CheckoutScreen() {
    const router = useRouter();

    // 🌟 Real cart data from Zustand
    const items = useCartStore((s) => s.items);
    const totalItems = useCartStore((s) => s.getTotalItems());
    const totalPrice = useCartStore((s) => s.getTotalPrice());
    const clearCart = useCartStore((s) => s.clearCart);

    // 🌟 Restaurant info from Zustand
    const restaurant = useRestaurantStore((s) => s.selectedRestaurant);
    const orderType = useRestaurantStore((s) => s.orderType);
    const selectedTable = useRestaurantStore((s) => s.selectedTable);

    const [selectedPayment, setSelectedPayment] = useState("Touch'n Go eWallet");
    const [isProcessing, setIsProcessing] = useState(false);

    const paymentMethods = [
        "Touch'n Go eWallet",
        'GrabPay',
        'Bank Transfer',
        'Credit/Debit Card',
    ];

    // Calculate taxes on real subtotal
    const subtotal = totalPrice;
    const sst = Math.round(subtotal * 0.06); // 6% SST
    const serviceTax = Math.round(subtotal * 0.10); // 10% Service Tax
    const total = subtotal + sst + serviceTax;

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // 🌟 TODO: Replace this with your real backend API call
            // const orderData = {
            //     restaurantId: restaurant.id,
            //     orderType,
            //     diningTableId: orderType === 'dine_in' ? selectedTable?.id : undefined,
            //     paymentMethod: selectedPayment,
            //     items: items.map(item => ({
            //         menuItemId: item.menuItemId,
            //         quantity: item.quantity,
            //         options: item.options,
            //     })),
            // };
            // const response = await createOrder(orderData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 🌟 Clear cart after successful payment
            clearCart();

            Alert.alert(
                'Order Placed! 🎉',
                `Your order has been placed successfully.\n\nTotal: ${formatRM(total)}\nPayment: ${selectedPayment}`,
                [
                    {
                        text: 'View Orders',
                        onPress: () => router.replace('/(tabs)/orders'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // 🌟 Helper to display item options
    const getItemOptionsText = (item: CartItem) => {
        if (item.options.length === 0) return null;
        return item.options.map((opt) => opt.valueName).join(' · ');
    };

    // 🌟 Helper to calculate individual item price
    const calculateItemPrice = (item: CartItem) => {
        const optionsPrice = item.options.reduce((sum, opt) => sum + opt.price_delta_cents, 0);
        return (item.basePriceCents + optionsPrice) * item.quantity;
    };

    return (
        <RequireAuth>
            <SafeAreaView className="flex-1 bg-[#F9FAFB]">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

                {/* Header */}
                <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-3 p-1"
                    >
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-[20px] font-extrabold text-gray-900 flex-1">
                        Checkout
                    </Text>
                    <Text className="text-gray-500 text-sm">
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </Text>
                </View>

                <ScrollView
                    className="flex-1 px-5 pt-4"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Restaurant & Order Type */}
                    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-sm font-bold text-gray-800">
                                {restaurant?.name || 'Restaurant'}
                            </Text>
                            <View className={`px-2.5 py-1 rounded-full ${orderType === 'dine_in' ? 'bg-[#FFF1EE]' : 'bg-[#F3F4F6]'
                                }`}>
                                <Text className={`text-xs font-semibold ${orderType === 'dine_in' ? 'text-[#FF5A3C]' : 'text-gray-600'
                                    }`}>
                                    {orderType === 'dine_in' ? 'Dine-In' : 'Pickup'}
                                </Text>
                            </View>
                        </View>

                        {orderType === 'dine_in' && selectedTable && (
                            <View className="flex-row items-center mt-2">
                                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                                <Text className="text-gray-600 text-sm ml-1">
                                    Table {selectedTable.table_code}
                                </Text>
                            </View>
                        )}

                        {orderType === 'pickup' && restaurant?.address && (
                            <View className="flex-row items-center mt-2">
                                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                                <Text className="text-gray-600 text-sm ml-1 flex-1" numberOfLines={1}>
                                    {restaurant.address}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Order Items */}
                    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <Text className="text-sm font-bold text-gray-800 mb-3">
                            Order Items
                        </Text>
                        {items.map((item, index) => (
                            <View
                                key={item.id}
                                className={`py-3 ${index < items.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 mr-3">
                                        <View className="flex-row items-start">
                                            <Text className="font-semibold text-gray-700 mr-1">
                                                {item.quantity}×
                                            </Text>
                                            <Text className="text-gray-800 font-medium flex-1">
                                                {item.menuItemName}
                                            </Text>
                                        </View>

                                        {getItemOptionsText(item) && (
                                            <Text className="text-gray-500 text-xs mt-1 ml-5">
                                                {getItemOptionsText(item)}
                                            </Text>
                                        )}
                                    </View>

                                    <Text className="text-gray-800 font-semibold">
                                        {formatRM(calculateItemPrice(item))}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Price Breakdown */}
                    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <Text className="text-sm font-bold text-gray-800 mb-2">
                            Price Breakdown
                        </Text>

                        <View className="flex-row justify-between items-center py-1.5">
                            <Text className="text-gray-600">Subtotal</Text>
                            <Text className="text-gray-800 font-semibold">
                                {formatRM(subtotal)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between items-center py-1.5">
                            <Text className="text-gray-600">SST (6%)</Text>
                            <Text className="text-gray-800 font-semibold">
                                {formatRM(sst)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between items-center py-1.5">
                            <Text className="text-gray-600">Service Tax (10%)</Text>
                            <Text className="text-gray-800 font-semibold">
                                {formatRM(serviceTax)}
                            </Text>
                        </View>

                        <View className="flex-row justify-between items-center pt-3 mt-2 border-t border-gray-200">
                            <Text className="text-base font-bold text-gray-900">
                                Total Amount
                            </Text>
                            <Text className="text-lg font-extrabold text-[#FF5A3C]">
                                {formatRM(total)}
                            </Text>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
                        <Text className="text-sm font-bold text-gray-800 mb-3">
                            Payment Method
                        </Text>

                        {paymentMethods.map((method, index) => (
                            <TouchableOpacity
                                key={method}
                                className={`flex-row items-center justify-between py-3 ${index < paymentMethods.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                onPress={() => setSelectedPayment(method)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Ionicons
                                        name={
                                            method.includes('Touch') ? 'wallet-outline' :
                                                method.includes('Grab') ? 'car-outline' :
                                                    method.includes('Bank') ? 'business-outline' :
                                                        'card-outline'
                                        }
                                        size={20}
                                        color="#6B7280"
                                    />
                                    <Text className="text-gray-700 ml-3">
                                        {method}
                                    </Text>
                                </View>
                                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedPayment === method
                                    ? 'border-[#FF5A3C] bg-[#FF5A3C]'
                                    : 'border-gray-300'
                                    }`}>
                                    {selectedPayment === method && (
                                        <View className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View className="h-4" />
                </ScrollView>

                {/* Bottom Pay Button */}
                <View className="bg-white border-t border-gray-200 px-5 py-4">
                    <TouchableOpacity
                        className="bg-[#FF5A3C] rounded-xl py-4 items-center flex-row justify-center"
                        onPress={handlePayment}
                        activeOpacity={0.8}
                        disabled={isProcessing || items.length === 0}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text className="text-white font-bold text-base">
                                Pay Now · {formatRM(total)}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </RequireAuth>
    );
}