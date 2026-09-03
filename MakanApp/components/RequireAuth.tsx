import { useAuth } from '@clerk/expo';
import { Redirect, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth();
    const pathname = usePathname();
    console.log(pathname);

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // 🌟 Only protected screens redirect to sign-in
    if (!isSignedIn) {
        return (
            <Redirect
                href={{
                    pathname: '/(auth)/login',
                    params: { redirect: pathname }
                }}
            />
        );
    }

    return <>{children}</>;
}