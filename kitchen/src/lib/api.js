import { axiosInstance } from "./axios";

export const login = async (loginData) => {
    const response = await axiosInstance.post("/staff/login", loginData);

    return response.data;
};