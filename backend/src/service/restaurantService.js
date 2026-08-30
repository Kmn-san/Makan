import { query } from "../utils/db.js";

export const getActiveRestaurants = async () => {
    const { rows } = await query(`
        SELECT id, name, address
        FROM restaurant
        WHERE is_active = TRUE
        ORDER BY name ASC
    `);
    return rows;
};