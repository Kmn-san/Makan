import { pool, query } from "../utils/db.js";

export const getKitchenOrders = async (restaurantId) => {
    // 🌟 厨房只关心需要制作的订单 (paid 和 preparing)
    // 已经 ready (待取餐) 或 completed (已完成) 的单子不需要显示在看板上
    const allowedStatuses = ['paid', 'preparing', 'ready'];

    const { rows } = await query(`
        SELECT 
            o.id,
            o.order_number,
            o.order_type,
            o.status,
            o.pickup_number,
            o.note AS order_note,
            o.created_at,
            dt.table_code,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', oi.id,
                            'item_name', oi.item_name,
                            'quantity', oi.quantity,
                            'note', oi.note,
                            'options', COALESCE(
                                (
                                    SELECT json_agg(
                                        json_build_object(
                                            'option_name', oio.option_name,
                                            'option_value_name', oio.option_value_name
                                        )
                                    )
                                    FROM order_item_options oio
                                    WHERE oio.order_item_id = oi.id
                                ), 
                                '[]'::json
                            )
                        )
                    )
                    FROM order_items oi
                    WHERE oi.order_id = o.id
                ), 
                '[]'::json
            ) AS items
        FROM orders o
        LEFT JOIN dining_tables dt ON o.dining_table_id = dt.id
        WHERE o.restaurant_id = $1 
          AND o.status = ANY($2)
        ORDER BY o.created_at ASC
    `, [restaurantId, allowedStatuses]);

    return rows;
};

export const updateKitchenOrderStatus = async (orderId, restaurantId, status) => {
    // 🌟 定义厨房允许的状态流转规则 (状态机)
    const VALID_TRANSITIONS = {
        'paid': ['preparing'],       // 厨房接单
        'preparing': ['ready'],
        'ready':['completed']       // 厨房完成制作
    };

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. 锁定订单 (FOR UPDATE 防止并发点击) 并验证是否属于本餐厅
        const { rows } = await client.query(`
            SELECT id, status FROM orders 
            WHERE id = $1 AND restaurant_id = $2
            FOR UPDATE
        `, [orderId, restaurantId]);

        if (rows.length === 0) {
            throw {
                code: 'ORDER_NOT_FOUND_OR_UNAUTHORIZED',
                message: 'Order not found in your restaurant.'
            };
        }

        const currentStatus = rows[0].status;

        // 2. 校验状态流转是否合法
        const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowedNextStatuses.includes(status)) {
            throw {
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot change status from ${currentStatus} to ${status}.`
            };
        }

        // 3. 更新订单状态
        await client.query(`
            UPDATE orders 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2
        `, [status, orderId]);

        // 4. 记录操作日志 (Audit Log)
        // 根据新状态决定 action 的名称
        const action = status === 'preparing' ? 'accepted' : 'completed';

        await client.query('COMMIT');

        return {
            orderId,
            previousStatus: currentStatus,
            status
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