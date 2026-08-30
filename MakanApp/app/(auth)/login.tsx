import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSSO } from '@clerk/expo';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  const [isLoading, setIsLoading] = useState(false);

  const handleOAuth = async (
    strategy: 'oauth_google' | 'oauth_apple'
  ) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const redirectUrl = Linking.createURL('/sso-callback');

      console.log('OAuth redirect URL:', redirectUrl);

      const {
        createdSessionId,
        setActive,
      } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive!({
          session: createdSessionId,
        });

        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('OAuth error:', error);

      Alert.alert(
        'Sign In Failed',
        error?.message || 'Could not sign in.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    handleOAuth('oauth_google');
  };

  const handleAppleLogin = () => {
    handleOAuth('oauth_apple');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar
        barStyle={
          Platform.OS === 'ios'
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor="#ffffff"
      />

      <View className="flex-1 px-6 justify-between py-8">

        {/* Header Section */}
        <View className="items-center mt-8">
          <View className="w-32 h-32 rounded-full items-center justify-center mb-4 overflow-hidden">
            <Image
              source={require('@/assets/images/icon.png')}
              className="w-full h-full rounded-full"
              resizeMode="contain"
            />
          </View>

          <Text className="text-3xl font-bold text-gray-800 tracking-tight">
            Makan
          </Text>

          <Text className="text-gray-500 text-base mt-3 text-center leading-6">
            Order noodles, rice, snacks and drinks.{'\n'}
            Pickup or dine-in, in seconds.
          </Text>
        </View>

        {/* Login Buttons Section */}
        <View className="mb-8">

          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
            className="w-full flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-4 px-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <View className="w-6 h-6 mr-3 items-center justify-center">
                  <Image
                    source={require('@/assets/images/google.png')}
                    className="w-8 h-8"
                  />
                </View>

                <Text className="text-gray-700 font-semibold text-base">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            onPress={handleAppleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
            className="w-full flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-4 px-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <View className="w-6 h-6 mr-3 items-center justify-center">
                  <Image
                    source={require('@/assets/images/apple.png')}
                    className="w-7 h-7"
                  />
                </View>

                <Text className="text-gray-700 font-semibold text-base">
                  Continue with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <View className="mt-8 items-center px-4">
            <Text className="text-gray-400 text-sm text-center leading-5">
              By continuing you agree to our{' '}
              <Text className="text-amber-600 underline font-medium">
                Terms
              </Text>
              {' & '}
              <Text className="text-amber-600 underline font-medium">
                Privacy Policy
              </Text>
            </Text>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
