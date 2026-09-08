import * as kitchenService from "../service/kitchenService.js";
import * as restaurantService from "../service/restaurantService.js";
import * as orderService from "../service/orderService.js";

export const getOrders = async (req, res) => {
    try {
        const { restaurant_id: restaurantId } = req.device;
        const orders = await kitchenService.getKitchenOrders(restaurantId);

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Get Kitchen Orders Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch kitchen orders'
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // 前端传来的新状态 (例如 'preparing' 或 'ready')
        
        const restaurantId = await orderService.getRestaurantIdByOrderId(orderId)
        if (!restaurantId) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'New status is required in request body.'
            });
        }

        const result = await kitchenService.updateKitchenOrderStatus(
            orderId,
            restaurantId,
            status
        );

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Update Kitchen Order Status Error:', error);

        const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
        const errorMessage = error.message || 'An unexpected error occurred';
        const httpStatus = errorCode === 'INTERNAL_SERVER_ERROR' ? 500 : 400;

        return res.status(httpStatus).json({
            success: false,
            message: errorMessage
        });
    }
};

