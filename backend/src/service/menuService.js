import { query } from "../utils/db.js"

export const getCategories = async (restaurantId) => {
    const { rows } = await query(`
        SELECT id, name, sort_order
        FROM menu_categories
        WHERE restaurant_id = $1 AND is_active = TRUE
        ORDER BY sort_order ASC
        `,
        [restaurantId])
    return rows;
}

export const getItems = async (restaurantId) => {
    const { rows } = await query(`
        SELECT id, category_id, name, descriptions, image_url, price_cents, sort_order
        FROM menu_items
        WHERE restaurant_id = $1 and is_available = TRUE
        ORDER BY sort_order ASC
        `,
        [restaurantId])
    return rows;
}

export const getOptions = async (itemIds) => {
    if (itemIds.length === 0) return [];
    const { rows } = await query(`
        SELECT id, menu_item_id, name, min_select, max_select, sort_order
        FROM menu_item_options
        WHERE menu_item_id = ANY($1)
        ORDER BY sort_order ASC
        `,
        [itemIds])
    return rows;
}

export const getValues = async (optionIds) => {
    if (optionIds.length === 0) return [];
    const { rows } = await query(`
         SELECT id, option_id, name, price_delta_cents, sort_order 
        FROM menu_item_option_values 
        WHERE option_id = ANY($1) AND is_available = TRUE
        ORDER BY sort_order ASC
        `,
        [optionIds])
    return rows;
}