import { pool } from "../utils/db.js"

export const processMockPayment = async (orderId, customerId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { rows: orders } = await client.query(`
    
    SELECT id, restaurant_id, order_type, status, payment_status, total_cents, pickup_number
    FROM orders
    WHERE id = $1 AND customer_id = $2
    FOR UPDATE`,
            [orderId, customerId])

        if (orders.length === 0) {
            throw {
                code: 'ORDER_NOT_FOUND_OR_UNAUTHORIZED',
                message: 'Order not found or you don\'t have permission.'
            }
        }

        const order = orders[0];
        if (order.payment_status !== 'pending_payment') {
            throw {
                code: "ORDER_CANNOT_BE_PAID",
                message: `Order cannot be paid. Current payment status: ${order.payment_status}`
            };
        }

        // for pickup generate pickup number
        let pickupNumber = order.pickup_number;
        if (order.order_type === 'pickup') {
            const { rows } = await client.query(`
                INSERT INTO pickup_counter(restaurant_id, counter_date, last_number)
                VALUES ($1, CURRENT_DATE, 1)
                ON CONFLICT (restaurant_id, counter_date)
                DO UPDATE SET last_number = pickup_counter.last_number + 1, updated_at = NOW()
                RETURNING last_number
            `, [order.restaurant_id]);

            pickupNumber = `P${String(rows[0].last_number).padStart(3, '0')}`;

            // 把生成的取餐号更新回订单表
            await client.query(
                `UPDATE orders SET pickup_number = $1 WHERE id = $2`,
                [pickupNumber, orderId]
            );
        }

        // 4. 更新订单状态为已支付 (厨房现在就能看到它了！)
        await client.query(`
            UPDATE orders 
            SET status = 'paid', payment_status = 'paid', updated_at = NOW()
            WHERE id = $1
        `, [orderId]);

        // 5. 记录支付流水 (模拟支付)
        await client.query(`
            INSERT INTO payments(order_id, provider, amount_cents, status, paid_at)
            VALUES ($1, 'mock', $2, 'success', NOW())
        `, [orderId, order.total_cents]);

        // 🌟 提交事务
        await client.query('COMMIT');

        return {
            orderId: order.id,
            paymentStatus: 'paid',
            pickupNumber,
            totalCents: order.total_cents,
            orderType: order.order_type
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
}