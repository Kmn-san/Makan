import { query } from "../utils/db.js"
import crypto from "crypto";

export const createDeviceUsingRestaurantId = async (restaurant, deviceType) => {
    const device_uuid = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    const { rows } = await query(
        `INSERT INTO devices(
        device_uuid,
        restaurant_id,
        token,
        device_name,
        status
        ) 
        VALUES(
        $1, $2, $3, $4,'pending'
        )
        RETURNING * 
        `, [device_uuid, restaurant.id, token, `${deviceType} ${restaurant.name}`]
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
        WHERE device_uuid = $1 and token = $2
        RETURNING *`,
        [device_uuid, token]
    )
    return rows[0]
}

export const updateName = async (device_uuid, deviceName) => {
    const { rows } = await query(
        `UPDATE devices SET device_name = $1
        WHERE device_uuid = $2
        RETURNING *`,
        [deviceName, device_uuid]
    )
    return rows[0]
}