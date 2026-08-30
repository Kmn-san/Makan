import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MeScreen() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace("/(auth)/login");
                        } catch (error) {
                            console.error("Logout error:", error);
                            Alert.alert(
                                "Logout Failed",
                                "Something went wrong. Please try again."
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleNavigateToLogin = () => {
        router.push("/(auth)/login");
    };

    if (!isLoaded) {
        return (
            <View className="flex-1 bg-[#F9FAFB] items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!isSignedIn) {
        return (
            <View className="flex-1 bg-[#F9FAFB] px-5 pt-6">

                {/* User Profile - Not Logged In */}
                <TouchableOpacity
                    onPress={handleNavigateToLogin}
                    activeOpacity={0.7}
                    className="bg-white rounded-2xl p-5 flex-row items-center"
                >
                    {/* Avatar with default image */}
                    <Image
                        source={require('@/assets/images/user.png')}
                        className="w-20 h-20 rounded-full"
                    />

                    {/* User Information */}
                    <View className="ml-4 flex-1">
                        <Text className="text-xl font-bold text-gray-900">
                            Click to Login
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            Tap here to sign in
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Order history prompt */}
                <View className="mt-6 bg-white rounded-2xl p-6 items-center border border-gray-100">
                    <Text className="text-4xl mb-3">📋</Text>
                    <Text className="text-base font-semibold text-gray-800 mb-2">
                        No Orders Yet
                    </Text>
                    <Text className="text-center text-gray-500 text-sm leading-5">
                        Sign in to view your order history and live order status.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F9FAFB] px-5 pt-6">

            {/* User Profile */}
            <TouchableOpacity
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-5 flex-row items-center"
            >
                {/* Avatar */}
                <Image
                    source={{
                        uri: user?.imageUrl,
                    }}
                    className="w-20 h-20 rounded-full"
                />

                {/* User Information */}
                <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                        {user?.username || user?.firstName || "User"}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Logout Button */}
            <View className="mt-6">
                <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    className="w-full bg-white border border-red-200 rounded-xl py-4 items-center"
                >
                    <Text className="text-red-500 font-bold text-base">
                        Log Out
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}