import * as staffService from "../service/staffService.js"
import bcrypt from "bcryptjs";
import crypto from 'crypto';

export const staffLogin = async (req, res) => {
    const { restaurantId, staffCode, pin, deviceName } = req.body;
    if (!restaurantId || !staffCode || !pin) {
        return res.status(400).json({
            success: false, message: "All fields are required!"
        })
    }
    try {
        const staffResult = await staffService.staffExist(restaurantId, staffCode)

        if (!staffResult) {
            return res.status(401).json({ success: false, message: "Invalid staff code or PIN" })
        }

        if (!staffResult.is_active) {
            return res.status(403).json({
                success: false, message: "Staff account is deactivated"
            })
        }

        const isPinValid = await bcrypt.compare(pin, staffResult.staff_hash_pin)

        if (!isPinValid) {
            return res.status(401).json({
                success: false, message: "Invalid staff code or PIN"
            })
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // invalid after 24 hours

        await staffService.injectSession(staffResult.id, tokenHash, deviceName || "Unknown Device", expiresAt)

        const existingShift = await staffService.existShift(staffResult.id)

        let shift;
        if (existingShift.length > 0) {
            shift = existingShift[0]
        } else {
            shift = await staffService.newShift(staffResult.id)
        }

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            token: token,
            staff: {
                id: staffResult.id,
                name: staffResult.name,
                role: staffResult.role,
                restaurantId: staffResult.restaurant_id,
                staffCode: staffResult.staff_code
            },
            shift: {
                id: shift.id,
                clockInAt: shift.clock_in_at
            }
        })

    } catch (error) {
        console.error('Staff login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const getStaff = async (req, res) => {
    const staff = req.staff;
    res.status(200).json({ success: true, staff });
}

export const staffLogout = async (req, res) => {
    try {
        const { name, staffId, sessionId } = req.staff;
        await staffService.revokeSession(sessionId);
        const closedShift = await staffService.clockOutShift(staffId)
        return res.status(200).json({
            success: true,
            message: `${name} logged out successfully. Have a good rest!`,
            shiftClosed: closedShift ? true : false
        })
    } catch (error) {
        console.error('Staff logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}