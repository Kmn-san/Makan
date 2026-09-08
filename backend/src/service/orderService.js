import { pool, query } from "../utils/db.js";
import crypto from 'crypto';

export const processOrderCreation = async ({
    customerId,
    restaurantId,
    orderType,
    diningTableId,
    items,
    note
}) => {
    if (!['pickup', 'dine_in'].includes(orderType)) {
        throw {
            code: 'INVALID_ORDER_TYPE',
            message: "Order type must be 'pickup' or 'dine_in'."
        };
    }

    if (orderType === 'pickup' && diningTableId) {
        throw {
            code: 'PICKUP_HAS_TABLE',
            message: "Pickup orders cannot have a dining table ID."
        };
    }

    const menuItemIds = items.map(i => i.menuItemId);
    const uniqueMenuItemIds = [...new Set(menuItemIds)];

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // ==========================================
        // 1. 批量获取并验证菜品
        // ==========================================
        const { rows: dbMenuItems } = await client.query(`
    SELECT id, name, price_cents
    FROM menu_items
    WHERE id = ANY($1) AND restaurant_id = $2 AND is_available = TRUE
`, [uniqueMenuItemIds, restaurantId]);

        if (dbMenuItems.length !== uniqueMenuItemIds.length) {
            throw {
                code: 'INVALID_MENU_ITEM',
                message: "One or more menu items are invalid, unavailable, or belong to another restaurant."
            };
        }

        const menuItemsMap = dbMenuItems.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});

        // ==========================================
        // 2. 批量获取所有相关选项组
        // ==========================================
        const { rows: allOptionGroups } = await client.query(`
    SELECT id, menu_item_id, name, min_select, max_select
    FROM menu_item_options
    WHERE menu_item_id = ANY($1)
`, [uniqueMenuItemIds]);

        const optionGroupsByItem = {};
        allOptionGroups.forEach(g => {
            if (!optionGroupsByItem[g.menu_item_id]) {
                optionGroupsByItem[g.menu_item_id] = [];
            }
            optionGroupsByItem[g.menu_item_id].push(g);
        });

        // ==========================================
        // 3. 批量获取并验证选项值
        // ==========================================
        const allRequestedOptionValueIds = items.flatMap(i => i.optionValueIds || []);
        let optionValues = [];

        if (allRequestedOptionValueIds.length > 0) {
            const { rows: values } = await client.query(`
                SELECT
                    v.id AS value_id,
                    v.name AS value_name,
                    v.price_delta_cents,
                    o.id AS option_id,
                    o.name AS option_name,
                    o.menu_item_id
                FROM menu_item_option_values v
                JOIN menu_item_options o ON v.option_id = o.id
                WHERE v.id = ANY($1) AND v.is_available = TRUE
            `, [allRequestedOptionValueIds]);
            optionValues = values;
        }

        const valuesMap = optionValues.reduce((acc, v) => {
            acc[v.value_id] = v;
            return acc;
        }, {});

        // ==========================================
        // 4. 核心算钱与校验逻辑
        // ==========================================
        let subtotalCents = 0;
        const processedItems = [];

        for (const cartItem of items) {
            // 🌟 验证数量必须是正整数
            if (!Number.isInteger(cartItem.quantity) || cartItem.quantity <= 0) {
                throw {
                    code: 'INVALID_QUANTITY',
                    message: "Item quantity must be a positive integer."
                };
            }

            const menuItem = menuItemsMap[cartItem.menuItemId];
            // 🌟 修复：加 || [] 防止 undefined 崩溃
            const groupsForItem = optionGroupsByItem[cartItem.menuItemId] || [];
            const selectedValueIds = cartItem.optionValueIds || [];

            // 🌟 防止重复传入同一个选项值
            if (new Set(selectedValueIds).size !== selectedValueIds.length) {
                throw {
                    code: 'DUPLICATE_OPTIONS',
                    message: `Duplicate options selected for ${menuItem.name}.`
                };
            }

            const selectedByOption = {};
            let optionPriceDelta = 0;
            const snapshotOptions = [];

            for (const valId of selectedValueIds) {
                // 🌟 修复：ValuesMap → valuesMap
                const val = valuesMap[valId];
                if (!val) {
                    throw {
                        code: 'INVALID_OPTION_VALUE',
                        message: "Invalid or unavailable option selected."
                    };
                }

                if (val.menu_item_id !== cartItem.menuItemId) {
                    throw {
                        code: 'OPTION_NOT_BELONG',
                        message: `Option ${val.option_name} does not belong to ${menuItem.name}.`
                    };
                }

                if (!selectedByOption[val.option_id]) selectedByOption[val.option_id] = 0;
                selectedByOption[val.option_id]++;

                optionPriceDelta += val.price_delta_cents;

                snapshotOptions.push({
                    optionId: val.option_id,
                    optionValueId: val.value_id,
                    optionName: val.option_name,
                    optionValueName: val.value_name,
                    priceDeltaCents: val.price_delta_cents
                });
            }

            // 校验 min_select 和 max_select
            for (const group of groupsForItem) {
                const count = selectedByOption[group.id] || 0;
                if (count < group.min_select) {
                    throw {
                        code: 'MIN_SELECT_NOT_MET',
                        message: `Please select at least ${group.min_select} ${group.name} for ${menuItem.name}.`
                    };
                }
                if (count > group.max_select) {
                    throw {
                        code: 'MAX_SELECT_EXCEEDED',
                        message: `You can select at most ${group.max_select} ${group.name} for ${menuItem.name}.`
                    };
                }
            }

            const unitPriceCents = menuItem.price_cents + optionPriceDelta;
            const itemSubtotal = unitPriceCents * cartItem.quantity;
            subtotalCents += itemSubtotal;

            processedItems.push({
                menuItemId: menuItem.id,
                itemName: menuItem.name,
                unitPriceCents,
                quantity: cartItem.quantity,
                subtotalCents: itemSubtotal,
                note: cartItem.note || null,
                options: snapshotOptions
            });
        }

        // ==========================================
        // 5. 精准计算税费
        // ==========================================
        const { rows: taxes } = await client.query(`
            SELECT tax_code, rate_percent
            FROM tax_settings
            WHERE restaurant_id = $1
              AND is_active = TRUE
              AND (applies_to = $2 OR applies_to = 'both')
        `, [restaurantId, orderType]);

        let sstRate = 0, sstCents = 0;
        let serviceTaxRate = 0, serviceTaxCents = 0;

        taxes.forEach(tax => {
            const rate = parseFloat(tax.rate_percent);
            const amount = Math.round(subtotalCents * (rate / 100));
            if (tax.tax_code === 'SST' && sstRate === 0) {
                sstRate = rate;
                sstCents = amount;
            } else if (tax.tax_code === 'SERVICE_TAX' && serviceTaxRate === 0) {
                serviceTaxRate = rate;
                serviceTaxCents = amount;
            }
        });

        const discountCents = 0;
        const totalCents = subtotalCents + sstCents + serviceTaxCents - discountCents;

        // ==========================================
        // 6. 验证桌号 (如果是堂食)
        // ==========================================
        let validatedTableId = null;
        if (orderType === 'dine_in') {
            if (!diningTableId) {
                throw {
                    code: 'DINE_IN_NO_TABLE',
                    message: "Dining table ID is required for dine-in orders."
                };
            }
            const { rows: tables } = await client.query(
                `SELECT id FROM dining_tables WHERE id = $1 AND restaurant_id = $2 AND is_active = TRUE`,
                [diningTableId, restaurantId]
            );
            if (tables.length === 0) {
                throw {
                    code: 'INVALID_TABLE',
                    message: "Invalid or inactive dining table."
                };
            }
            validatedTableId = tables[0].id;
        }

        // 自取订单在创建时不生成取餐号，留给支付成功后生成
        let pickupNumber = null;

        // ==========================================
        // 7. 写入数据库
        // ==========================================
        const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

        const { rows: insertedOrder } = await client.query(`
            INSERT INTO orders (
                restaurant_id, customer_id, order_number, order_type, dining_table_id, pickup_number,
                status, payment_status, subtotal_cents, sst_rate_percent, sst_cents,
                service_tax_rate_percent, service_tax_cents, discount_cents, total_cents, note
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING id, order_number, total_cents, pickup_number
        `, [
            // 🌟 修复：dbUserId → customerId
            restaurantId, customerId, orderNumber, orderType, validatedTableId, pickupNumber,
            'pending_payment', 'pending_payment', subtotalCents, sstRate, sstCents,
            serviceTaxRate, serviceTaxCents, discountCents, totalCents, note
        ]);
        const newOrder = insertedOrder[0];

        for (const item of processedItems) {
            const { rows: insertedItem } = await client.query(`
                INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price_cents, quantity, subtotal_cents, note)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [newOrder.id, item.menuItemId, item.itemName, item.unitPriceCents, item.quantity, item.subtotalCents, item.note]);

            const orderItemId = insertedItem[0].id;

            if (item.options.length > 0) {
                for (const opt of item.options) {
                    await client.query(`
                        INSERT INTO order_item_options (order_item_id, option_id, option_value_id, option_name, option_value_name, price_delta_cents)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [orderItemId, opt.optionId, opt.optionValueId, opt.optionName, opt.optionValueName, opt.priceDeltaCents]);
                }
            }
        }

        await client.query('COMMIT');

        return {
            orderId: newOrder.id,
            orderNumber: newOrder.order_number,
            totalCents: newOrder.total_cents,
            pickupNumber: newOrder.pickup_number
        };

    } catch (error) {
        // 🌟 安全回滚
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

export const getRestaurantIdByOrderId = async (orderId) => {
    const { rows } = await query(`
        SELECT restaurant_id FROM orders
        WHERE id = $1
        `, [orderId])
    return rows[0]?.restaurant_id ?? null;
}