import crypto from 'crypto';
import { clerkClient, requireAuth, getAuth } from "@clerk/express";
import * as staffService from "../service/staffService.js"
import * as customerService from "../service/customerService.js"
import * as restaurantService from "../service/restaurantService.js";
import * as deviceService from "../service/deviceService.js";


export const verifyStaffToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Access denied. NO token provided"
            })
        }

        const token = authHeader.split(' ')[1]
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        const staffInfo = await staffService.checkStaffWithToken(tokenHash)

        if (staffInfo.length === 0) {
            return res.status(401).json({
                success: false, message: "Invalid or expired token."
            })
        }
        const session = staffInfo[0];
        const staffCheck = await staffService.staffCheck(session.staff_user_id);

        if (!staffCheck.is_active) {
            return res.status(403).json({
                success: false,
                message: "Staff account deactivated."
            })
        }

        req.staff = {
            sessionId: session.session_id,
            staffId: session.staff_user_id,
            role: session.role,
            restaurantId: session.restaurant_id,
            name: session.name
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
}

export const requireAdminOrOwner = (req, res, next) => {
    const staff = req.staff; // 这个对象是由 verifyStaffToken 中间件挂载的

    if (!staff || !['admin', 'owner'].includes(staff.role)) {
        return res.status(403).json({
            success: false,
            code: 'FORBIDDEN_ROLE',
            message: 'Access denied. Only Admin or Owner can perform this action.'
        });
    }

    next();
};

export const verifyOrRegisterDevice = async (req, res, next) => {
    try {
        const { restaurantId, device_uuid, token } = req.body;
        if (!restaurantId) {
            return res.status(404).json({ success: false, message: "Restaurant Id must be insert" })
        }

        const restaurant = await restaurantService.getRestaurantById(restaurantId)
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "No such restaurant" });
        }

        if (!device_uuid) {
            const newDevice = await deviceService.createDeviceUsingRestaurandId(restaurantId)
            return res.status(201).json({
                success: true,
                message: "Device registered",
                device_uuid: newDevice.device_uuid,
                token: newDevice.token
            })
        }

        req.device = device;
        req.restaurant = restaurant;

        deviceService.updateLastSeen(device.device_uuid).catch(err =>
            console.error('Failed to update last_seen_at:', err)
        );

        next();
    } catch (error) {
        console.error('Device Verify Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during verify device.'
        });
    }
}

export const requireAuthDevice = async (req, res, next) => {
    const authHeader = req.headers['authorization']; // "Bearer <token>"

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Missing or malformed token" });
    }

    const token = authHeader.split(' ')[1]; // grab the part after "Bearer "

    if (!token) {
        return res.status(401).json({ success: false, message: "Missing credentials" });
    }

    const device = await deviceService.getDeviceByToken(token);

    if (!device) {
        return res.status(404).json({ success: false, message: "Invalid token" })
    }
    if (device.status !== 'active') {
        return res.status(401).json({ success: false, message: "Device has been revoked" });
    }
    req.device = device;
    deviceService.updateLastSeen(device.device_uuid).catch(console.error);
    next();
}

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const { userId: clerkId } = getAuth(req);

            if (!clerkId) {
                return res.status(401).json({ code: "UNAUTHORIZED" });
            }

            let customer = await customerService.findByClerkId(clerkId);

            if (!customer) {
                const clerkUser = await clerkClient.users.getUser(clerkId);

                customer = await customerService.createCustomerFromClerk({
                    clerkId: clerkUser.id,
                    username: clerkUser.username || clerkUser.firstName || "New User",
                    avatar_url: clerkUser.imageUrl
                })
            }

            req.customer = customer;
            req.clerkId = clerkId;
            next()
        } catch (error) {
            console.error("Error in protectRoute middleware: ", error.message);
            return res.status(500).json({
                code: "INTERNAL_SERVER_ERROR",
                error: error.message
            });
        }
    }
]