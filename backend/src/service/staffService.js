import { query } from "../utils/db.js"

export const staffExist = async (restaurantId, staffCode) => {
    const { rows } = await query(`
        SELECT * from staff 
        WHERE restaurant_id = $1 AND staff_code = $2
        `,
        [restaurantId, staffCode])
    return rows[0];
}

export const injectSession = async (staffId, token, device, expiresAt) => {
    const { rows } = await query(`
        INSERT INTO staff_sessions (staff_user_id,token_hash,device_uuid,expires_at)
        VALUES($1,$2,$3,$4)
        `,
        [staffId, token, device, expiresAt])
    return rows[0];
}

export const existShift = async (staffId) => {
    const { rows } = await query(`
        SELECT * FROM staff_shifts
        WHERE staff_user_id = $1 
        AND clock_out_at IS NULL
        `,
        [staffId])
    return rows;
}

export const newShift = async (staffId) => {
    const { rows } = await query(`
        INSERT INTO staff_shifts (staff_user_id,clock_in_at)
        VALUES($1,NOW())
        RETURNING id, staff_user_id, clock_in_at
        `,
        [staffId])
    return rows[0]
}

export const checkStaffWithToken = async (tokenHash) => {
    const { rows } = await query(`
        SELECT 
            ss.id AS session_id,
            ss.staff_user_id,
            ss.expires_at,
            st.role,
            st.restaurant_id,
            st.name
        FROM staff_sessions ss
        JOIN staff st ON ss.staff_user_id = st.id
        WHERE ss.token_hash = $1
            AND ss.expires_at > NOW()
            AND ss.revoked_at IS NULL
        `,
        [tokenHash])
    return rows;
}

export const staffCheck = async (staffId) => {
    const { rows } = await query(`
        SELECT is_active FROM staff WHERE id = $1
        `,
        [staffId])
    return rows[0];
}

export const revokeSession = async (sessionId) => {
    const { rows } = await query(`
        UPDATE staff_sessions
        SET revoked_at = NOW()
        WHERE id =$1
        RETURNING id
        `, [sessionId]);
    return rows[0]
}

export const clockOutShift = async (staffId) => {
    const { rows } = await query(`
        UPDATE staff_shifts
        SET clock_out_at = NOW()
        WHERE staff_user_id = $1 AND clock_out_at IS NULL
        RETURNING id, clock_in_at,clock_out_at
        `,
        [staffId])
    return rows[0]
}