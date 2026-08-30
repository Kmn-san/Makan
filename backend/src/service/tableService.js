import { query } from "../utils/db.js";

export const resolveTable = async (restaurantId, tableCode) => {
    const { rows } = await query(`
        SELECT id, table_code
        FROM dining_tables
        WHERE restaurant_id = $1 
          AND table_code = $2 
          AND is_active = TRUE
    `, [restaurantId, tableCode]);
    return rows[0];
};