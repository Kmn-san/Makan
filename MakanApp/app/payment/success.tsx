import { formatRM } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const { amount, orderType, pickupNumber, tableCode } = useLocalSearchParams<{
        amount: string;
        orderType: string;
        pickupNumber: string;
        tableCode: string;
    }>();

    const isDineIn = orderType === 'dine_in';

    return (
        <SafeAreaView className="flex-1 bg-[#F7F4EF]">
            <StatusBar barStyle="dark-content" backgroundColor="#F7F4EF" />

            <View className="flex-1 items-center justify-center px-6">
                {/* Success Icon */}
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                    <Ionicons name="checkmark-circle-outline" size={44} color="#22C55E" />
                </View>

                <Text className="text-[26px] font-extrabold text-gray-900 mb-2">
                    Payment Successful
                </Text>
                <Text className="text-sm text-gray-500 mb-8">
                    {formatRM(Number(amount || 0))} paid · {isDineIn ? 'Dine-In order' : 'Pickup order'}
                </Text>

                {/* Pickup / Table Number Card */}
                <View className="w-full bg-white rounded-2xl px-6 py-7 items-center shadow-sm mb-6">
                    <Text className="text-[11px] tracking-[2px] text-gray-400 font-bold mb-3">
                        {isDineIn ? 'TABLE NUMBER' : 'PICKUP NUMBER'}
                    </Text>
                    <Text className="text-5xl font-extrabold text-[#FF5A3C] mb-4">
                        {isDineIn ? tableCode : pickupNumber}
                    </Text>
                    <Text className="text-sm text-gray-400 text-center leading-5">
                        {isDineIn
                            ? 'Your order will be served at your table'
                            : 'Please show this number at the counter to collect your order'}
                    </Text>
                </View>

                {/* Status Pill */}
                <View className="flex-row items-center bg-[#FCEADD] rounded-full px-4 py-2">
                    <Ionicons name="time-outline" size={14} color="#C2410C" />
                    <Text className="text-xs font-semibold text-[#C2410C] ml-1.5">
                        Paid · Preparing your order
                    </Text>
                </View>
            </View>

            {/* Bottom Button */}
            <View className="px-6 pb-6">
                <TouchableOpacity
                    className="bg-[#EFECE7] rounded-xl py-4 items-center"
                    onPress={() => router.replace('/(tabs)/orders')}
                    activeOpacity={0.8}
                >
                    <Text className="text-gray-900 font-bold text-base">View Order Details</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}