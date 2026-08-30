import { useSignIn } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function SSOCallbackScreen() {
    const { signIn } = useSignIn();
    const router = useRouter();
    const hasRun = useRef(false);

    useEffect(() => {
        const handleCallback = async () => {
            // Prevent running twice
            if (hasRun.current || !signIn) return;

            // 🌟 Core 3: Wait for the OAuth provider to finish, then finalize the session
            if (signIn.status === 'complete') {
                hasRun.current = true;

                await signIn.finalize({
                    navigate: async ({ decorateUrl }) => {
                        // decorateUrl ensures the URL works correctly in all environments
                        const url = decorateUrl('/');
                        router.replace(url as any);
                    },
                });
            }
        };

        handleCallback();
    }, [signIn, router]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={{ marginTop: 16, color: '#6B7280' }}>Completing sign in...</Text>
        </View>
    );
}