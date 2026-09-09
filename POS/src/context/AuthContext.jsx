import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import {
    login as deviceLoginApi,
    register as deviceRegisterApi,
    logout as deviceLogoutApi,
} from "../lib/deviceApi";

import {
    staffLogin as staffLoginApi,
    staffLogout as staffLogoutApi,
} from "../lib/staffApi";

const AuthContext = createContext(null);

// deviceStatus: 'checking' | 'unauthenticated' | 'pending' | 'authenticated'
// staffStatus:  'unauthenticated' | 'authenticated'

export function AuthProvider({ children }) {
    const [deviceStatus, setDeviceStatus] = useState("checking");
    const [device, setDevice] = useState(null);

    const [staffStatus, setStaffStatus] = useState("unauthenticated");
    const [staff, setStaff] = useState(null);

    // ---------- Device layer ----------

    const authenticate = async (restaurantCode) => {
        const token = localStorage.getItem("device_token_POS");

        try {
            const data = token
                ? await deviceLoginApi({ restaurantCode, token })
                : await deviceRegisterApi({ restaurantCode, deviceType: "POS" });

            localStorage.setItem("device_token_POS", data.token);
            localStorage.setItem("device_uuid", data.device_uuid);
            localStorage.setItem("restaurant_code", restaurantCode);
            setDevice(data);
            setDeviceStatus(data.status === "pending" ? "pending" : "authenticated");

            return data;

        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("device_token_POS");
                localStorage.removeItem("device_uuid");
                localStorage.removeItem("restaurant_code");
                setDevice(null);
                setDeviceStatus("unauthenticated");
            }
            throw err;
        }
    };

    const checkStatus = async () => {
        const token = localStorage.getItem("device_token_POS");
        const restaurantCode = localStorage.getItem("restaurant_code");

        if (!token || !restaurantCode) {
            setDeviceStatus("unauthenticated");
            throw new Error("Missing stored credentials");
        }

        try {
            const data = await deviceLoginApi({ restaurantCode, token });
            localStorage.setItem("device_token_POS", data.token);
            setDevice(data);
            setDeviceStatus(data.status === "pending" ? "pending" : "authenticated");
            return data;

        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("device_token_POS");
                localStorage.removeItem("device_uuid");
                localStorage.removeItem("restaurant_code");
                setDevice(null);
                setDeviceStatus("unauthenticated");
            }
            throw err;
        }
    };

    // On boot: if a device token already exists, verify it instead of
    // blindly assuming the device is unauthenticated (fixes refresh bouncing
    // an already-registered device back to the registration screen).
    useEffect(() => {
        const token = localStorage.getItem("device_token_POS");
        const restaurantCode = localStorage.getItem("restaurant_code");

        if (!token || !restaurantCode) {
            setDeviceStatus("unauthenticated");
            return;
        }

        checkStatus().catch(() => {
            // checkStatus already clears storage + sets "unauthenticated" on failure
        });
    }, []);

    const deviceLogout = async () => {
        try {
            await deviceLogoutApi();
        } catch (err) {
            console.error("Device logout API failed:", err);
        }
        localStorage.removeItem("device_token_POS");
        localStorage.removeItem("device_uuid");
        localStorage.removeItem("restaurant_code");
        setDevice(null);
        setDeviceStatus("unauthenticated");

        // a device logout implicitly ends any staff session too —
        // there's no point staying "logged in" as staff on a device that no longer is
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_id");
        setStaff(null);
        setStaffStatus("unauthenticated");
    };

    const clearInvalidDevice = () => {
        localStorage.removeItem("device_token_POS");
        localStorage.removeItem("device_uuid");
        localStorage.removeItem("restaurant_code");
        setDevice(null);
        setDeviceStatus("unauthenticated");
    };

    // ---------- Staff layer ----------

    const staffLogin = async ({ staffCode, pin }) => {
        try {
            const restaurantCode = localStorage.getItem("restaurant_code");
            const deviceUuid = localStorage.getItem("device_uuid");

            const data = await staffLoginApi({ restaurantCode, staffCode, pin, deviceUuid });

            localStorage.setItem("staff_token", data.token);
            localStorage.setItem("staff_id", data.staff_id);
            setStaff(data);
            setStaffStatus("authenticated");

            return data;

        } catch (err) {
            localStorage.removeItem("staff_token");
            localStorage.removeItem("staff_id");
            setStaff(null);
            setStaffStatus("unauthenticated");
            throw err;
        }
    };

    const staffLogout = async () => {
        try {
            await staffLogoutApi();
        } catch (err) {
            console.error("Staff logout API failed:", err);
        }
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_id");
        setStaff(null);
        setStaffStatus("unauthenticated");
    };

    return (
        <AuthContext.Provider
            value={{
                // device
                deviceStatus,
                device,
                authenticate,
                checkStatus,
                deviceLogout,
                clearInvalidDevice,

                // staff
                staffStatus,
                staff,
                staffLogin,
                staffLogout,
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
