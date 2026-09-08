import axios from "axios"
const BASE_URI = import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api"

export const axiosInstance = axios.create({
    baseURL: BASE_URI,
})

//attach token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("device_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

//handle expired/invalid token
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        const isAuthRoute = err.config?.url?.includes("/login")

        // if (err.response?.status === 401 && !isAuthRoute) {
        //     localStorage.removeItem("accessToken");
        //     window.location.href = "/login";
        // }

        return Promise.reject(err);
    }
)