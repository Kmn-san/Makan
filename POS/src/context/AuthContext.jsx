import {
    createContext,
    useContext,
    useState,
} from "react";

import { staffLogin as staffLoginApi, staffLogout as staffLogoutApi } from "../lib/staffApi";

const StaffAuthContext = createContext(null);

// authStatus: 'unauthenticated' | 'authenticated'

export function StaffAuthProvider({ children }) {
    const [authStatus, setAuthStatus] = useState("unauthenticated");
    const [staff, setStaff] = useState(null);

    const login = async ({ employeeId, pin }) => {
        try {
            const data = await staffLoginApi({ employeeId, pin });

            localStorage.setItem("staff_token", data.token);
            localStorage.setItem("staff_id", data.staff_id);
            setStaff(data);
            setAuthStatus("authenticated");

            return data;

        } catch (err) {
            // login failed — make sure no stale staff session lingers
            localStorage.removeItem("staff_token");
            localStorage.removeItem("staff_id");
            setStaff(null);
            setAuthStatus("unauthenticated");
            throw err;
        }
    };

    const logout = async () => {
        try {
            await staffLogoutApi();
        } catch (err) {
            console.error("Staff logout API failed:", err);
            // still proceed to clear local state even if the backend call fails
        }
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_id");
        setStaff(null);
        setAuthStatus("unauthenticated");
    };

    return (
        <StaffAuthContext.Provider
            value={{
                authStatus,
                staff,
                login,
                logout,
            }}
        >
            {children}
        </StaffAuthContext.Provider>
    );
}

export function useStaffAuth() {
    const context = useContext(StaffAuthContext);
    if (!context) {
        throw new Error("useStaffAuth must be used inside StaffAuthProvider");
    }
    return context;
}
