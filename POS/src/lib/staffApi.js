import { axiosInstance } from "./axios"

export const staffLogin = async (loginData) => {
    const response = await axiosInstance.post("/staff/login", loginData)
    return response.data;
}

export const staffLogout = async () => {
    const response = await axiosInstance.post("/staff/logout")
    return response.data;
}