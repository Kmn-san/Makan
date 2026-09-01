import { formatRM } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentFailedScreen() {
    const router = useRouter();
    const { amount, orderCode, reason } = useLocalSearchParams<{
        amount: string;
        orderCode: string;
        reason: string;
    }>();

    return (
        <SafeAreaView className="flex-1 bg-[#F7F4EF]">
            <StatusBar barStyle="dark-content" backgroundColor="#F7F4EF" />

            <View className="flex-1 items-center justify-center px-6">
                {/* Failed Icon */}
                <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
                    <Ionicons name="warning-outline" size={40} color="#EF4444" />
                </View>

                <Text className="text-[26px] font-extrabold text-gray-900 mb-3">
                    Payment Failed
                </Text>

                <Text className="text-sm text-gray-500 text-center leading-5 mb-1">
                    We couldn't complete your payment of {formatRM(Number(amount || 0))}.
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-8">
                    No money has been deducted.
                </Text>

                {/* Order Info Card */}
                <View className="w-full bg-white rounded-xl px-4 shadow-sm">
                    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                        <Text className="text-sm text-gray-500">Order</Text>
                        <Text className="text-sm font-bold text-gray-900">#{orderCode}</Text>
                    </View>
                    <View className="flex-row justify-between items-center py-3">
                        <Text className="text-sm text-gray-500">Reason</Text>
                        <Text className="text-sm font-bold text-red-500">
                            {reason || 'Payment declined'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Buttons */}
            <View className="px-6 pb-6">
                <TouchableOpacity
                    className="bg-[#FF5A3C] rounded-xl py-4 items-center mb-3"
                    onPress={() => router.replace('/checkout')}
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-bold text-base">Retry Payment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white border border-gray-200 rounded-xl py-4 items-center"
                    onPress={() => router.replace('/(tabs)')}
                    activeOpacity={0.8}
                >
                    <Text className="text-red-500 font-bold text-base">Cancel Order</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}