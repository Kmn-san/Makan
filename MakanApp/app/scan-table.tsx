import { resolveTable } from '@/lib/api';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanTableScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [validating, setValidating] = useState(false);
    const [scanPaused, setScanPaused] = useState(false); // 🌟 New: pause after fail
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // 🌟 New: show error inline
    const router = useRouter();

    const restaurant = useRestaurantStore((s) => s.selectedRestaurant);
    const setTable = useRestaurantStore((s) => s.setTable);
    const setOrderType = useRestaurantStore((s) => s.setOrderType);

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const parseTableQR = (raw: string) => {
        const data = raw.trim();
        if (data.toUpperCase().startsWith('MAKAN|')) {
            const parts = data.split('|');
            if (parts.length === 3) {
                return {
                    restaurantId: parts[1].trim(),
                    tableCode: parts[2].trim(),
                };
            }
        }
        return null;
    };

    // 🌟 Reset scanner to allow another scan
    const handleRetry = () => {
        setScanPaused(false);
        setErrorMessage(null);
        setValidating(false);
    };

    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        // 🌟 Don't scan if already validating or paused
        if (validating || scanPaused) return;

        console.log('📷 Raw scanned data:', JSON.stringify(data));
        setValidating(true);
        setErrorMessage(null);

        try {
            const parsed = parseTableQR(data);

            if (!parsed) {
                throw { message: 'This is not a valid table QR code.' };
            }

            if (!restaurant || parsed.restaurantId !== restaurant.id) {
                throw { message: 'This table belongs to a different restaurant.' };
            }

            const res = await resolveTable(restaurant.id, parsed.tableCode);


            setTable({ id: res.data.id, table_code: res.data.table_code });
            setOrderType('dine_in');
            router.back();
        } catch (error: any) {
            const message = error?.message || 'Could not validate this table.';
            setErrorMessage(message);
            setScanPaused(true);
            setValidating(false);
        }
    };

    // Permission not decided yet
    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator color="#fff" />
            </SafeAreaView>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
                <Text className="text-lg font-bold text-gray-800 mt-4 mb-2">
                    Camera access needed
                </Text>
                <Text className="text-gray-500 text-center mb-6">
                    We need your camera to scan the table QR code.
                </Text>
                <TouchableOpacity
                    className="bg-[#FF5A3C] px-6 py-3 rounded-xl"
                    onPress={requestPermission}
                >
                    <Text className="text-white font-bold">Grant Permission</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={
                    validating || scanPaused ? undefined : handleBarcodeScanned
                }
            >
                {/* Overlay UI */}
                <View className="flex-1 justify-between">
                    {/* Top bar */}
                    <View className="flex-row items-center px-5 pt-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                        >
                            <Ionicons name="close" size={22} color="#fff" />
                        </TouchableOpacity>
                        <Text className="flex-1 text-white text-center font-bold text-lg">
                            Scan Table QR
                        </Text>
                        <View className="w-10" />
                    </View>

                    {/* Center frame */}
                    <View className="items-center">
                        <View
                            className={`w-64 h-64 border-2 rounded-2xl items-center justify-center ${scanPaused ? 'border-red-400' : 'border-white/70'
                                }`}
                        >
                            {/* Validating spinner */}
                            {validating && (
                                <View className="items-center">
                                    <ActivityIndicator color="#FF5A3C" size="large" />
                                    <Text className="text-white mt-3 font-semibold">
                                        Validating table...
                                    </Text>
                                </View>
                            )}

                            {/* 🌟 Error state with retry button */}
                            {scanPaused && errorMessage && (
                                <View className="items-center px-6">
                                    <Ionicons
                                        name="close-circle"
                                        size={48}
                                        color="#EF4444"
                                    />
                                    <Text className="text-white text-center mt-3 font-semibold">
                                        {errorMessage}
                                    </Text>
                                    <TouchableOpacity
                                        className="mt-5 bg-white/20 px-6 py-3 rounded-full"
                                        onPress={handleRetry}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-white font-bold">
                                            Tap to Scan Again
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Bottom hint */}
                        {!scanPaused && !validating && (
                            <Text className="text-white/80 mt-4 text-sm text-center px-10">
                                Point your camera at the QR code on your table
                            </Text>
                        )}
                    </View>

                    <View className="h-10" />
                </View>
            </CameraView>
        </SafeAreaView>
    );
}