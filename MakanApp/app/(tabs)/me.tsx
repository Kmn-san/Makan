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
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log Out",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace("/(tabs)");
                    } catch (error) {
                        console.error("Logout error:", error);
                        Alert.alert("Logout Failed", "Something went wrong.");
                    }
                },
            },
        ]);
    };

    if (!isLoaded) {
        return (
            <View className="flex-1 bg-[#F9FAFB] items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F9FAFB] px-5 pt-[60px]">
            {/* Page title */}
            <Text className="text-[26px] font-extrabold text-gray-900 mb-4">
                Profile
            </Text>

            {/* 🌟 ONE card handles both states */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={isSignedIn ? undefined : () => router.push("/(auth)/login")}
                className="bg-white rounded-2xl p-5 flex-row items-center"
            >
                <Image
                    source={
                        isSignedIn && user?.imageUrl
                            ? { uri: user.imageUrl }
                            : require("@/assets/images/user.png")
                    }
                    className="w-20 h-20 rounded-full"
                />

                <View className="ml-4 flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                        {isSignedIn
                            ? user?.username || user?.firstName || "User"
                            : "Click to Login"}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                        {!isSignedIn && "Tap here to sign in"}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* 🌟 Buttons only appear when signed in */}
            {isSignedIn && (
                <View className="mt-6">
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.7}
                        className="w-full bg-white border border-red-200 rounded-xl py-4 items-center"
                    >
                        <Text className="text-red-500 font-bold text-base">Log Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        className="w-full bg-white border border-red-200 rounded-xl py-4 items-center mt-4"
                    >
                        <Text className="text-red-500 font-bold text-base">
                            Delete Account
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}