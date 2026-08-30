import * as kitchenService from "../service/kitchenService.js";

export const getOrders = async (req, res) => {
    try {
        // 🌟 req.staff 是由 verifyStaffToken 中间件挂载的
        const staff = req.staff;
        if (!staff) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // 使用员工所属的餐厅 ID 进行多租户隔离查询
        const orders = await kitchenService.getKitchenOrders(staff.restaurantId);

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
        const staff = req.staff; // 从 verifyStaffToken 中间件获取
        const { orderId } = req.params;
        const { status } = req.body; // 前端传来的新状态 (例如 'preparing' 或 'ready')

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'New status is required in request body.'
            });
        }

        const result = await kitchenService.updateKitchenOrderStatus(
            orderId,
            staff.restaurantId,
            staff.staffId,
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

