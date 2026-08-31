import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export function HomeHeader() {
    return (
        <View className="bg-[#FF5A3C] pt-[60px] pb-7 px-5">
            <View className="flex-row items-center">
                {/* Makan Logo */}
                <View className="w-[62px] h-[62px] rounded-2xl bg-white items-center justify-center mr-4 overflow-hidden">
                    <Image
                        source={require('@/assets/images/icon.png')}
                        className="w-[56px] h-[56px]"
                        resizeMode="contain"
                    />
                </View>

                {/* Header Text */}
                <View className="flex-1">
                    <Text className="text-[30px] font-extrabold text-white leading-9">
                        Makan
                    </Text>
                    <Text className="text-[#FFE4DE] text-[13px] mt-1">
                        Where would you like to eat today?
                    </Text>
                </View>
            </View>

            {/* Search-style area */}
            <TouchableOpacity
                className="bg-white/95 rounded-xl flex-row items-center px-4 py-3.5 mt-6"
                activeOpacity={0.8}
            >
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm ml-3">
                    Search restaurants...
                </Text>
            </TouchableOpacity>
        </View>
    );
}