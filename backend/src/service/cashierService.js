import { pool } from "../utils/db.js";

export const cancelOrder = async (orderId, restaurantId, staffId, cancelReason) => {
    // 🌟 定义允许取消的订单状态
    const CANCELLABLE_STATUSES = ['pending_payment', 'paid', 'preparing'];

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. 锁定订单 (FOR UPDATE) 并验证是否属于本餐厅
        const { rows } = await client.query(`
            SELECT id, status, payment_status, total_cents 
            FROM orders 
            WHERE id = $1 AND restaurant_id = $2
            FOR UPDATE
        `, [orderId, restaurantId]);

        if (rows.length === 0) {
            throw {
                code: 'ORDER_NOT_FOUND_OR_UNAUTHORIZED',
                message: 'Order not found in your restaurant.'
            };
        }

        const order = rows[0];

        // 2. 校验当前状态是否允许取消
        if (!CANCELLABLE_STATUSES.includes(order.status)) {
            throw {
                code: 'ORDER_NOT_CANCELLABLE',
                message: `Cannot cancel order in '${order.status}' status.`
            };
        }

        // 3. 确定新的支付状态
        let newPaymentStatus = order.payment_status;

        // 4. 如果顾客已经付款，生成退款流水
        if (order.payment_status === 'paid') {
            await client.query(`
                INSERT INTO payments (order_id, provider, amount_cents, status, paid_at)
                VALUES ($1, 'mock_refund', $2, 'refunded', NOW())
            `, [orderId, order.total_cents]);

            newPaymentStatus = 'refunded'; // 更新为已退款
        }

        // 5. 更新订单状态
        await client.query(`
            UPDATE orders 
            SET status = 'cancelled', payment_status = $1, updated_at = NOW()
            WHERE id = $2
        `, [newPaymentStatus, orderId]);

        // 6. 记录操作日志 (Audit Log)
        await client.query(`
            INSERT INTO order_activity_logs (order_id, staff_user_id, action, note)
            VALUES ($1, $2, 'cancelled', $3)
        `, [orderId, staffId, cancelReason || 'Order cancelled by cashier']);

        await client.query('COMMIT');

        return {
            orderId,
            newStatus: 'cancelled',
            paymentStatus: newPaymentStatus,
            isRefunded: order.payment_status === 'paid'
        };

    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("❌ Rollback failed:", rollbackError);
        }
        throw error;
    } finally {
        client.release();
    }
};