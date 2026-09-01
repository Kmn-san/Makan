import * as customerService from "../service/customerService.js";

export const getCustomer = async (req, res) => {
    const customer = req.customer;
    return res.status(200).json({ success: true, customer })
}


export const getMyOrders = async (req, res) => {
    try {

        const customer = req.customer;
        if (!customer || !customer.id) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: "Please login to view your orders."
            });
        }

        // 调用 Service 获取订单
        const orders = await customerService.getCustomerOrders(customer.id);

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Get Customer Orders Error:', error);
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch orders'
        });
    }
};