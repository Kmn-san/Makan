import axios from 'axios';
import { Platform } from 'react-native';
import { getClerkInstance } from '@clerk/expo';


const getBaseURL = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api';
    }

    return 'http://localhost:3000/api';
};

console.log('🌐 API Base URL:', getBaseURL());

export const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
            }
        } catch (error) {
            console.warn(
                '⚠️ Failed to get Clerk auth token',
                error
            );
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        console.log(
            `✅ Response: ${response.status} from ${response.config.url}`
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
                    '🚪 Token expired or invalid.'
                );
            }
        } else if (error.code === 'ERR_NETWORK') {
            console.error(
                '🌐 Network error - check if backend is running and IP is correct'
            );

            console.error(
                'Attempted URL:',
                error.config?.baseURL + error.config?.url
            );
        } else {
            console.error('❌ Error:', error.message);
        }

        return Promise.reject(error);
    }
);