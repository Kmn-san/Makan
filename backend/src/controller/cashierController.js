import * as cashierService from "../service/cashierService.js";

export const cancelOrder = async (req, res) => {
    try {
        const staff = req.staff; // 从 verifyStaffToken 中间件获取
        const { orderId } = req.params;
        const { reason } = req.body; // 可选的取消原因

        // 🌟 1. 严格校验角色权限 (只有收银员和管理员能取消)
        if (!['staff', 'admin'].includes(staff.role)) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN_ROLE',
                message: 'Only staff or admin can cancel orders.'
            });
        }

        // 2. 调用 Service 处理取消逻辑
        const result = await cashierService.cancelOrder(
            orderId,
            staff.restaurantId,
            staff.staffId,
            reason
        );

        return res.status(200).json({
            success: true,
            message: result.isRefunded ? 'Order cancelled and refunded successfully.' : 'Order cancelled successfully.',
            data: result
        });

    } catch (error) {
        console.error('Cancel Order Error:', error);

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