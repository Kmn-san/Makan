
import { getMenu, getMyOrders } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import { formatRM } from '@/utils/format';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderOption {
    option_id: string;
    option_value_id: string;
    option_value_name: string;
}

interface OrderItem {
    order_item_id: string;
    menu_item_id: string;
    item_name: string;
    quantity: number;
    note: string | null;
    options: OrderOption[];
}

interface Order {
    id: string;
    order_number: string;
    order_type: 'pickup' | 'dine_in';
    pickup_number: string | null;
    table_code: string | null;
    status: string;
    payment_status: string;
    total_cents: number;
    created_at: string;
    restaurant_id: string;
    restaurant_name: string;
    items: OrderItem[];
}

// "17 Aug 2026 · 12:40 PM"
const formatOrderDate = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
    const time = d.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
    return `${date} · ${time}`;
};

const getStatusPill = (status: string) => {
    switch (status) {
        case 'completed':
            return { label: 'Completed', bg: 'bg-green-100', text: 'text-green-600' };
        case 'ready':
            return { label: 'Ready', bg: 'bg-blue-100', text: 'text-blue-600' };
        case 'paid':
        case 'preparing':
            return { label: 'Preparing', bg: 'bg-amber-100', text: 'text-amber-600' };
        case 'cancelled':
            return { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-500' };
        default:
            return { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-500' };
    }
};

// "Curry Laksa, Brown Sugar Pearl +1"
const summarizeItems = (items: OrderItem[]) => {
    const names = items.map((i) => i.item_name);
    if (names.length <= 2) return names.join(', ');
    return `${names[0]}, ${names[1]} +${names.length - 2}`;
};

const orderTitle = (order: Order) =>
    order.order_type === 'dine_in'
        ? `Dine-In · Table ${order.table_code ?? '-'}`
        : `Pickup · No. ${order.pickup_number ?? '-'}`;

export default function OrdersScreen() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reorderingId, setReorderingId] = useState<string | null>(null);

    const addItem = useCartStore((s) => s.addItem);
    const selectRestaurant = useRestaurantStore((s) => s.selectRestaurant);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await getMyOrders();
            setOrders(res.data ?? []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchOrders();
        } else if (isLoaded) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, fetchOrders]);

    // 🌟 Reorder: re-adds all items (with options + notes) into the cart
    const handleReorder = async (order: Order) => {
        if (reorderingId) return;
        setReorderingId(order.id);

        try {
            selectRestaurant({
                id: order.restaurant_id,
                name: order.restaurant_name,
                address: null,
            });

            // Fresh menu = current prices & availability
            const res = await getMenu(order.restaurant_id);
            const allItems = res.data.flatMap((cat: any) => cat.items);

            let added = 0;
            for (const item of order.items) {
                const menuItem = allItems.find((m: any) => m.id === item.menu_item_id);
                if (!menuItem) continue; // sold out / removed

                const selectedOptions: Record<string, string[]> = {};
                item.options.forEach((opt) => {
                    (selectedOptions[opt.option_id] ??= []).push(opt.option_value_id);
                });

                addItem(menuItem, item.quantity, selectedOptions, item.note ?? '');
                added++;
            }

            if (added === 0) {
                Alert.alert('Reorder Unavailable', 'Sorry, these items are no longer available.');
                return;
            }

            router.push('/cart');
        } catch (error) {
            console.error('Reorder failed:', error);
            Alert.alert('Reorder Failed', 'Something went wrong. Please try again.');
        } finally {
            setReorderingId(null);
        }
    };

    // Not signed in
    if (isLoaded && !isSignedIn) {
        return (
            <View className="flex-1 justify-center items-center p-6 bg-[#F9FAFB]">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Your Orders </Text>
                <Text className="text-center text-gray-500 mb-6">
                    Sign in to view your order history and live order status.
                </Text>
                <TouchableOpacity
                    className="bg-[#FF5A3C] px-6 py-3 rounded-xl"
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text className="text-white font-bold">Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderOrder = ({ item }: { item: Order }) => {
        const pill = getStatusPill(item.status);

        return (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
                {/* Date + Status pill */}
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-400 text-xs">
                        {formatOrderDate(item.created_at)}
                    </Text>
                    <View className={`px-2.5 py-1 rounded-full ${pill.bg}`}>
                        <Text className={`text-[11px] font-bold ${pill.text}`}>
                            {pill.label}
                        </Text>
                    </View>
                </View>

                {/* Pickup / Dine-In title */}
                <Text className="text-base font-extrabold text-gray-900 mb-1">
                    {orderTitle(item)}
                </Text>

                {/* Items summary */}
                <Text className="text-gray-500 text-sm mb-3" numberOfLines={1}>
                    {summarizeItems(item.items)}
                </Text>

                {/* Total + Reorder */}
                <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                    <Text className="text-[#FF5A3C] font-extrabold">
                        {formatRM(item.total_cents)}
                    </Text>

                    <TouchableOpacity
                        className="bg-[#F3F4F6] rounded-lg px-4 py-2"
                        onPress={() => handleReorder(item)}
                        disabled={reorderingId !== null}
                        activeOpacity={0.7}
                    >
                        {reorderingId === item.id ? (
                            <ActivityIndicator size="small" color="#FF5A3C" />
                        ) : (
                            <Text className="text-gray-700 text-sm font-semibold">
                                Reorder
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            {/* Header */}
            <View className="bg-white px-5 pt-[60px] pb-4 border-b border-gray-100">
                <Text className="text-[26px] font-extrabold text-gray-900">
                    Your Orders
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                    Track your meals and reorder in one tap
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FF5A3C" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(o) => o.id}
                    renderItem={renderOrder}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
                            tintColor="#FF5A3C"
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-16 px-6">
                            <View className="w-20 h-20 bg-[#FFF1EE] rounded-full items-center justify-center mb-4">
                                <Ionicons name="receipt-outline" size={36} color="#FF5A3C" />
                            </View>
                            <Text className="text-lg font-bold text-gray-900">No orders yet</Text>
                            <Text className="text-gray-500 text-sm text-center mt-2">
                                Your order history will appear here after your first order.
                            </Text>
                            <TouchableOpacity
                                className="bg-[#FF5A3C] px-6 py-3 rounded-xl mt-5"
                                onPress={() => router.push('/')}
                            >
                                <Text className="text-white font-bold">Browse Restaurants</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}