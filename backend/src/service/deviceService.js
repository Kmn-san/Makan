import { query } from "../utils/db.js"

export const createDeviceUsingRestaurandId = async (restaurantId) => {
    const device_uuid = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    const { rows } = await query(
        `INSERT INTO devices(
        device_uuid,
        restaurant_id,
        token,
        status
        ) 
        VALUES(
        $1, $2, $3,'active'
        )
        RETURNING * 
        `, [device_uuid, restaurantId, token]
    )
    return rows[0]
}

export const getDeviceByToken = async (token) => {
    const { rows } = await query(
        `SELECT * FROM devices WHERE token = $1`,
        [token]
    );
    return rows[0] || null;
}

export const getDeviceByUuid = async (device_uuid) => {
    const { rows } = await query(
        `SELECT * FROM devices WHERE device_uuid = $1`,
        [device_uuid]
    );
    return rows[0] || null;
};

export const updateLastSeen = async (device_uuid) => {
    await query(
        `UPDATE devices SET last_seen_at = now() WHERE device_uuid = $1`,
        [device_uuid]
    );
};

export const logout = async (device_uuid, token) => {
    const { rows } = await query(
        `UPDATE devices SET status = 'revoked'
        WHERE device_uuid = $1 and token = $2`,
        [device_uuid, token]
    )
    return [0]
}

export const updateName = async (device_uuid, deviceName) => {
    await query(
        `UPDATE devices SET device_name = $1
        WHERE device_uuid = $2`,
        [deviceName, device_uuid]
    )
    return [0]
}