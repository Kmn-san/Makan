import { query } from "../utils/db.js"

export const findByClerkId = async (clerkId) => {
    const { rows } = await query(
        `SELECT * FROM customer WHERE clerkid = $1`,
        [clerkId]
    )
    return rows[0]
}

export const createCustomerFromClerk = async ({ clerkId, username, avatar_url }) => {
    const { rows } = await query(
        `INSERT INTO customer(
        clerkid,
        username,
        avatar_url
        ) 
        VALUES(
        $1, $2, $3
        )
        RETURNING * 
        `, [clerkId, username, avatar_url]
    )
    return rows[0]
}

export const getCustomerOrders = async (dbUserId, restaurantId) => {
    const { rows } = await query(`
        SELECT 
            o.id,
            o.order_number,
            o.order_type,
            o.status,
            o.payment_status,
            o.pickup_number,
            dt.table_code,
            o.subtotal_cents,
            o.sst_cents,
            o.service_tax_cents,
            o.total_cents,
            o.created_at,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', oi.id,
                            'item_name', oi.item_name,
                            'quantity', oi.quantity,
                            'unit_price_cents', oi.unit_price_cents,
                            'subtotal_cents', oi.subtotal_cents,
                            'note', oi.note,
                            'options', COALESCE(
                                (
                                    SELECT json_agg(
                                        json_build_object(
                                            'option_name', oio.option_name,
                                            'option_value_name', oio.option_value_name,
                                            'price_delta_cents', oio.price_delta_cents
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
        WHERE o.customer_id = $1  
          AND o.restaurant_id = $2
        ORDER BY o.created_at DESC 
    `, [dbUserId, restaurantId]);

    return rows;
};