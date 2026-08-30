import axios from 'axios';
import { Platform } from 'react-native';
import { getClerkInstance } from '@clerk/expo';

const TESTING_ON: 'device' | 'emulator' = 'device';

const BACKEND_PORT = 3000;

const getBaseURL = () => {
    // Android Emulator
    if (TESTING_ON === 'emulator') {
        if (Platform.OS === 'android') {
            return `http://10.0.2.2:${BACKEND_PORT}/api`;
        }

        // iOS Simulator
        return `http://localhost:${BACKEND_PORT}/api`;
    }

    // Physical Device
    const pcIp = process.env.EXPO_PUBLIC_PC_IP;

    if (!pcIp) {
        console.warn(
            '⚠️ EXPO_PUBLIC_PC_IP is not configured.'
        );

        return `http://localhost:${BACKEND_PORT}/api`;
    }

    return `http://${pcIp}:${BACKEND_PORT}/api`;
};

const BASE_URL = getBaseURL();

console.log('🌐 API Base URL:', BASE_URL);

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==============================
// Request Interceptor
// ==============================

api.interceptors.request.use(
    async (config) => {
        console.log(
            `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
        );

        try {
            const clerk = getClerkInstance();
            const token = await clerk.session?.getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;

                console.log('🔐 Authenticated request');
            } else {
                console.log('👤 Guest request');
            }
        } catch (error) {
            console.warn(
                '⚠️ Failed to get Clerk auth token:',
                error
            );
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==============================
// Response Interceptor
// ==============================

api.interceptors.response.use(
    (response) => {
        console.log(
            `✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
        );

        return response;
    },

    (error) => {
        if (error.response) {
            console.error(
                `❌ API Error [${error.response.status}]:`,
                error.response.data
            );

            if (error.response.status === 401) {
                console.log(
                    '🚪 Authentication required or token expired.'
                );
            }

            if (error.response.status === 403) {
                console.log(
                    '⛔ You do not have permission to access this resource.'
                );
            }

            if (error.response.status >= 500) {
                console.log(
                    '💥 Backend server error.'
                );
            }
        } else if (error.code === 'ERR_NETWORK') {
            console.error(
                '🌐 Network error.'
            );

            console.error(
                'Make sure:',
                '\n1. Backend is running',
                '\n2. PC IP is correct',
                '\n3. Phone and PC are on the same Wi-Fi',
                '\n4. Windows Firewall allows port 3000'
            );

            console.error(
                'Attempted URL:',
                `${error.config?.baseURL}${error.config?.url}`
            );
        } else {
            console.error(
                '❌ Request error:',
                error.message
            );
        }

        return Promise.reject(error);
    }
);