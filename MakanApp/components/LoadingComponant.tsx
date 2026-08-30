import React from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Animated,
    Easing,
    Modal,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface LoadingComponentProps {
    visible?: boolean;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ visible = true }) => {
    // Animation for pulsing icon
    const scaleValue = React.useRef(new Animated.Value(1)).current;
    // Animation for pop-up
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
        // Pulsing animation for icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(scaleValue, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();

        // Pop-up animation
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const popupContent = (
        <Animated.View
            className="flex-1 items-center justify-center bg-black/40 px-6"
            style={{
                opacity: fadeAnim,
            }}
        >
            <Animated.View
                className="bg-white rounded-3xl p-8 items-center shadow-2xl"
                style={{
                    transform: [{ scale: scaleAnim }],
                    width: width * 0.85,
                    maxWidth: 340,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 10,
                }}
            >
                {/* Animated Icon */}
                <View className="w-24 h-24 rounded-full bg-emerald-50 items-center justify-center mb-6 border border-emerald-100">
                    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                        <Ionicons name="wallet" size={44} color="#059669" />
                    </Animated.View>
                </View>

                {/* Loading Spinner */}
                <ActivityIndicator size="large" color="#059669" className="mb-4" />

                {/* Loading Text */}
                <Text className="text-emerald-600 font-bold text-base">
                    Loading...
                </Text>
            </Animated.View>
        </Animated.View>
    );

    // If you want to use it as a modal overlay
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            {popupContent}
        </Modal>
    );
};

export default LoadingComponent;