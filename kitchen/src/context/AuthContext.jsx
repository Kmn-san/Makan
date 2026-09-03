import {
    createContext,
    useContext,
    useState,
} from "react";

import { login as loginApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [staff, setStaff] = useState(null);

    const login = async (loginData) => {

        const data = await loginApi(loginData);

        localStorage.setItem("accessToken", data.accessToken);

        setStaff(data.staff);
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        setStaff(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLogin: !!staff,
                staff,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}