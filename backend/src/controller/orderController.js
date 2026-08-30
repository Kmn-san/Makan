import * as orderService from "../service/orderService.js"

export const createOrder = async (req, res) => {
    try {
        const customer = req.customer;
        if (!customer || !customer.id) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: "Please login to place an order."
            });
        }

        const { restaurantId, orderType, diningTableId, items, note } = req.body;

        if (!restaurantId || !orderType || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_REQUIRED_FIELDS',
                message: "restaurantId, orderType, and items are required."
            });
        }

        const result = await orderService.processOrderCreation({
            customerId: customer.id,
            restaurantId,
            orderType,
            diningTableId,
            items,
            note
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: result
        });

    } catch (error) {
        console.error('Create Order Error:', error);

        // 🌟 提取 code，返回给前端
        const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
        const errorMessage = error.message || 'An unexpected error occurred';
        const httpStatus = errorCode === 'INTERNAL_SERVER_ERROR' ? 500 : 400;

        return res.status(httpStatus).json({
            success: false,
            code: errorCode,
            message: errorMessage
        });
    }
};