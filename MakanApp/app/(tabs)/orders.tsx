import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function OrdersScreen() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    if (isLoaded && !isSignedIn) {
        return (
            <View className="flex-1 justify-center items-center p-6 bg-[#F9FAFB]">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Your Orders 🧾</Text>
                <Text className="text-center text-gray-500 mb-6">
                    Sign in to view your order history and live order status.
                </Text>
                <TouchableOpacity
                    className="bg-[#FF5A3C] px-6 py-3 rounded-xl"
                    onPress={() => router.push("/(auth)/login")}
                >
                    <Text className="text-white font-bold">Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center p-6 bg-[#F9FAFB]">
            <Text className="text-gray-500">Order list goes here (signed-in users only)</Text>
        </View>
    );
}