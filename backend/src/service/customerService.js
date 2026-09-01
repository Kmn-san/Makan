import { pool, query } from "../utils/db.js"

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

export const getCustomerOrders = async (customerId) => {
    const { rows: orders } = await pool.query(`
        SELECT o.id, o.order_number, o.order_type, o.pickup_number,
               o.status, o.payment_status, o.total_cents, o.created_at,
               o.restaurant_id, r.name AS restaurant_name,
               dt.table_code
        FROM orders o
        JOIN restaurant r ON r.id = o.restaurant_id
        LEFT JOIN dining_tables dt ON dt.id = o.dining_table_id
        WHERE o.customer_id = $1
        ORDER BY o.created_at DESC
        LIMIT 30
    `, [customerId]);

    if (orders.length === 0) return [];

    // 2️⃣ Fetch all items + their option snapshots in one query
    const { rows: itemRows } = await pool.query(`
        SELECT oi.id AS order_item_id, oi.order_id, oi.menu_item_id,
               oi.item_name, oi.quantity, oi.note,
               oio.option_id, oio.option_value_id, oio.option_value_name
        FROM order_items oi
        LEFT JOIN order_item_options oio ON oio.order_item_id = oi.id
        WHERE oi.order_id = ANY($1)
    `, [orders.map((o) => o.id)]);

    // 3️⃣ Nest items under their order
    const itemsByOrder = {};
    for (const row of itemRows) {
        const list = (itemsByOrder[row.order_id] ??= []);
        let item = list.find((i) => i.order_item_id === row.order_item_id);

        if (!item) {
            item = {
                order_item_id: row.order_item_id,
                menu_item_id: row.menu_item_id,
                item_name: row.item_name,
                quantity: row.quantity,
                note: row.note,
                options: [],
            };
            list.push(item);
        }

        if (row.option_value_id) {
            item.options.push({
                option_id: row.option_id,
                option_value_id: row.option_value_id,
                option_value_name: row.option_value_name,
            });
        }
    }

    return orders.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] }));
};