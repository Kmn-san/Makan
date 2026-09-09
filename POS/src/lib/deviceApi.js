import { axiosInstance } from "./axios";

export const login = async (loginData) => {
    const response = await axiosInstance.post("/devices/login", loginData);

    return response.data;
};

export const logout = async () => {
    const response = await axiosInstance.post("/devices/logout");

    return response.data;
};

export const register = async (registerData) => {
    const response = await axiosInstance.post("/devices/register", registerData);

    return response.data;
};