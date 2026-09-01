import { api } from "./axios";

//  Restaurant APIs
export const getRestaurants = async () => {
    const response = await api.get('/restaurants');
    return response.data;
};

//  Menu APIs
export const getMenu = async (restaurantId: string) => {
    const response = await api.get('/menu', {
        params: { restaurantId }
    });
    return response.data;
};

//  Order APIs (For later)
export const createOrder = async (orderData: any) => {
    const response = await api.post('/order', orderData);
    return response.data;
};

export const payOrder = async (orderId: string) => {
    const response = await api.post(`/payments/${orderId}/pay`);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/customer/orders');
    return response.data;
};

export const resolveTable = async (restaurantId: string, tableCode: string) => {
    const response = await api.get('/tables/resolve', {
        params: { restaurantId, tableCode },
    });
    return response.data;
};