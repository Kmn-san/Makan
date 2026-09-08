import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import { login as loginApi, register as registerApi, logout as logoutApi } from "../lib/api";

const AuthContext = createContext(null);

// authStatus: 'checking' | 'unauthenticated' | 'pending' | 'authenticated'

export function AuthProvider({ children }) {
    const [authStatus, setAuthStatus] = useState("checking");
    const [device, setDevice] = useState(null);

    useEffect(() => {
        setAuthStatus("unauthenticated");
    }, []);

    const authenticate = async (restaurantCode) => {
        const token = localStorage.getItem("device_token");

        try {
            const data = token
                ? await loginApi({ restaurantCode, token })
                : await registerApi({ restaurantCode });

            localStorage.setItem("device_token", data.token);
            localStorage.setItem("device_uuid", data.device_uuid);
            localStorage.setItem("restaurant_code", restaurantCode);
            setDevice(data);
            setAuthStatus(data.status === "pending" ? "pending" : "authenticated");

            return data;

        } catch (err) {
            if (err.response?.status === 401) {
                // token invalid or revoked — clear everything, force fresh registration
                localStorage.removeItem("device_token");
                localStorage.removeItem("device_uuid");
                localStorage.removeItem("restaurant_code");
                setDevice(null);
                setAuthStatus("unauthenticated");
            }
            throw err; // still let the caller show its own error message
        }
    };

    const checkStatus = async () => {
        const token = localStorage.getItem("device_token");
        const restaurantCode = localStorage.getItem("restaurant_code");

        if (!token || !restaurantCode) {
            throw new Error("Missing stored credentials");
        }

        try {
            const data = await loginApi({ restaurantCode, token });
            localStorage.setItem("device_token", data.token);
            setDevice(data);
            setAuthStatus(data.status === "pending" ? "pending" : "authenticated");
            return data;

        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("device_token");
                localStorage.removeItem("device_uuid");
                localStorage.removeItem("restaurant_code");
                setDevice(null);
                setAuthStatus("unauthenticated");
            }
            throw err;
        }
    };

    const logout = async () => {
        // try {
        //     await logoutApi();
        // } catch (err) {
        //     console.error("Logout API failed:", err);
        //     // still proceed to clear local state even if the backend call fails
        // }
        // localStorage.removeItem("device_token");
        // localStorage.removeItem("device_uuid");
        // localStorage.removeItem("restaurant_code");

        // setDevice(null);
        setAuthStatus("unauthenticated");
    };

    const clearInvalidDevice = () => {
        // call this when login/register fails with "revoked" or "invalid token"
        localStorage.removeItem("device_token");
        localStorage.removeItem("device_uuid");
        localStorage.removeItem("restaurant_code");
        setDevice(null);
        setAuthStatus("unauthenticated");
    };

    return (
        <AuthContext.Provider
            value={{
                authStatus,
                device,
                authenticate,
                checkStatus,
                logout,
                clearInvalidDevice,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}