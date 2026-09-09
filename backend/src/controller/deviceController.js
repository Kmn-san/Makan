import * as deviceService from "../service/deviceService.js";
import * as restaurantService from "../service/restaurantService.js";

export const registerDevice = async (req, res, next) => {
    try {
        const { restaurantCode } = req.body;
        if (!restaurantCode) {
            return res.status(404).json({ success: false, message: "Restaurant Id must be insert" })
        }

        const restaurant = await restaurantService.getRestaurantByCode(restaurantCode)
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "No such restaurant" });
        }

        const newDevice = await deviceService.createDeviceUsingRestaurantId(restaurant.id)
        return res.status(201).json({
            success: true,
            message: "Device registered. Waiting for admin to approved",
            status: newDevice.status,
            device_uuid: newDevice.device_uuid,
            token: newDevice.token,
            restaurant_name: restaurant.name
        })

    } catch (error) {
        console.error('Register Device Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
}

export const loginDevice = async (req, res) => {
    try {
        const { restaurantCode, token } = req.body;

        if (!restaurantCode) {
            return res.status(400).json({ success: false, message: "Restaurant Code must be provided" });
        }
        if (!token) {
            return res.status(400).json({ success: false, message: "No device token found, please register" });
        }
        const restaurant = await restaurantService.getRestaurantByCode(restaurantCode);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "No such restaurant" });
        }
        const device = await deviceService.getDeviceByToken(token);
        if (!device) {
            return res.status(401).json({ success: false, message: "Invalid token, please register again" });
        }
        if (device.restaurant_id !== restaurant.id) {
            return res.status(403).json({ success: false, message: "This device belongs to a different restaurant" });
        }
        if (device.status === 'pending') {
            return res.status(403).json({ success: false, message: "Waiting for owner approval" });
        }
        if (device.status === 'revoked') {
            return res.status(401).json({ success: false, message: "Device has been revoked, please register again" });
        }

        deviceService.updateLastSeen(device.device_uuid).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            status: device.status,
            device_uuid: device.device_uuid,
            token: device.token,
            restaurant_name: restaurant.name
        });

    } catch (error) {
        console.error('Login Device Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
};

export const logoutDevice = async (req, res) => {
    try {
        const { device_uuid, token } = req.device;
        const device = await deviceService.getDeviceByUuid(device_uuid)
        if (!device) {
            return res.status(404).json({ success: false, message: "No such device" })
        }
        const updatedDevice = await deviceService.logout(device_uuid, token)
        if (!updatedDevice) {
            return res.status(404).json({ success: false, message: "Device not found or already logged out" });
        }
        return res.status(200).json({ success: true, message: "Logout successfully" })

    } catch (error) {
        console.error('ERROR in logout device:', error);

        return res.status(500).json({
            success: false,
            message: "INTERNAL SERVER ERROR"
        });
    }
}

export const updateDeviceName = async (req, res) => {
    try {
        const { deviceName } = req.body;
        const { device_uuid } = req.device;

        if (!deviceName) {
            return res.status(400).json({ success: false, message: "Device name is empty" })
        }
        const device = await deviceService.getDeviceByUuid(device_uuid)
        if (!device) {
            return res.status(404).json({ success: false, message: "No such device" })
        }
        const updateDevice = await deviceService.updateName(device_uuid, deviceName)
        if (!updatedDevice) {
            return res.status(404).json({ success: false, message: "No such device" });
        }
        return res.status(200).json({
            success: true,
            message: "Update Successfully",
            device: { device_name: updatedDevice.device_name }
        })
    } catch (error) {
        console.error('ERROR in update device:', error);

        return res.status(500).json({
            success: false,
            message: "INTERNAL SERVER ERROR"
        });
    }
}