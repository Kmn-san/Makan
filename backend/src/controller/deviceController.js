import * as deviceService from "../service/deviceService.js";

export const logoutDevice = async (req, res) => {
    try {
        const { device_uuid, token } = req.device;
        if (!device_uuid || !token) {
            return res.status(400).json({ success: false, message: "Device id or token is missing" })
        }
        const device = await deviceService.getDeviceByUuid(device_uuid)
        if (!device) {
            return res.status(404).json({ success: false, message: "No such device" })
        }
        const result = await deviceService.logout(device_uuid, token)
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
        const { device_uuid, token } = req.device;

        if (!deviceName) {
            return res.status(400).json({ success: false, message: "Device name is empty" })
        }
        const device = await deviceService.getDeviceByUuid(device_uuid)
        if (!device) {
            return res.status(404).json({ success: false, message: "No such device" })
        }
        const result = await deviceService.updateName(device_uuid, deviceName)
        return res.status(200).json({ success: true, message: "Update Successfully" })
    } catch (error) {
        console.error('ERROR in update device:', error);

        return res.status(500).json({
            success: false,
            message: "INTERNAL SERVER ERROR"
        });
    }
}