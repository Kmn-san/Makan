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

export const getOrders = async () => {
    const response = await axiosInstance.get("/kitchen/orders");
    return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await axiosInstance.patch(`/kitchen/orders/${orderId}/status`, { status });
    return response.data;
};