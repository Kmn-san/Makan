import { query } from "../utils/db.js";

export const getActiveRestaurants = async () => {
    const { rows } = await query(`
        SELECT id, name, address, image_url
        FROM restaurant
        WHERE is_active = TRUE
        ORDER BY name ASC
    `);
    return rows;
};

export const getRestaurantByCode = async (code) => {
    const { rows } = await query(`
        SELECT id, name, address,image_url
        FROM restaurant
        WHERE is_active = TRUE AND code = $1
    `, [code]);
    return rows[0];
};