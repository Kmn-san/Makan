import { axiosInstance } from "./axios"

export const staffLogin = async ({ employeeId, pin }) => {
    const response = await axiosInstance.post("/staff/login", { exployeeId, pin })
    return response.data;
}

export const staffLogout = async () => {
    const response = await axiosInstance.post("/staff/logout")
    return response.data;
}