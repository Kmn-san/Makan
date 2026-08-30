import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // 🌟 Only protected screens redirect to sign-in
    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return <>{children}</>;
}