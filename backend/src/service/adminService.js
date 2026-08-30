import { query } from "../utils/db.js";

// 1. 获取后台菜单列表 (包含已下架的菜品)
export const getAdminMenuItems = async (restaurantId) => {
    const { rows } = await query(`
        SELECT 
            mi.id,
            mi.name,
            mi.descriptions,
            mi.price_cents,
            mi.is_available,
            mi.sort_order,
            mi.category_id,
            mc.name AS category_name,
            mi.created_at,
            mi.updated_at
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mi.restaurant_id = $1
        ORDER BY mi.category_id, mi.sort_order ASC
    `, [restaurantId]);
    return rows;
};

// 2. 切换菜品上架/下架状态
export const toggleMenuItemAvailability = async (itemId, restaurantId, isAvailable) => {
    const { rows } = await query(`
        UPDATE menu_items
        SET is_available = $1, updated_at = NOW()
        WHERE id = $2 AND restaurant_id = $3
        RETURNING id, name, is_available
    `, [isAvailable, itemId, restaurantId]);
    
    if (rows.length === 0) {
        throw {
            message: 'Menu item not found in your restaurant.' 
        };
    }
    return rows[0];
};

// 3. 更新菜品信息 (价格、名称、描述等)
export const updateMenuItem = async (itemId, restaurantId, updateData) => {
    const { name, description, priceCents, categoryId, sortOrder } = updateData;
    
    const { rows } = await query(`
        UPDATE menu_items
        SET name = $1, descriptions = $2, price_cents = $3, category_id = $4, sort_order = $5, updated_at = NOW()
        WHERE id = $6 AND restaurant_id = $7
        RETURNING id, name, descriptions, price_cents, category_id, is_available, sort_order
    `, [name, description, priceCents, categoryId, sortOrder, itemId, restaurantId]);

    if (rows.length === 0) {
        throw { 
            message: 'Menu item not found in your restaurant.' 
        };
    }
    return rows[0];
};