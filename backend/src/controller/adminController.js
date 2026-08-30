import * as adminService from "../service/adminService.js";

// 1. 获取后台菜单列表
export const getMenuItems = async (req, res) => {
    try {
        const staff = req.staff;
        const items = await adminService.getAdminMenuItems(staff.restaurantId);

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Get Admin Menu Error:', error);
        return res.status(500).json({ success: false,  message: 'Failed to fetch menu items' });
    }
};

// 2. 一键上架/下架
export const toggleAvailability = async (req, res) => {
    try {
        const staff = req.staff;
        const { itemId } = req.params;
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isAvailable must be a boolean value (true or false).'
            });
        }

        const result = await adminService.toggleMenuItemAvailability(itemId, staff.restaurantId, isAvailable);

        return res.status(200).json({
            success: true,
            message: result.is_available ? 'Item activated successfully (Visible to customers).' : 'Item deactivated successfully (Hidden from customers).',
            data: result
        });
    } catch (error) {
        const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
        const errorMessage = error.message || 'An unexpected error occurred';
        const httpStatus = errorCode === 'INTERNAL_SERVER_ERROR' ? 500 : 400;

        return res.status(httpStatus).json({ success: false, message: errorMessage });
    }
};

// 3. 更新菜品信息
export const updateMenuItem = async (req, res) => {
    try {
        const staff = req.staff;
        const { itemId } = req.params;
        const { name, description, priceCents, categoryId, sortOrder } = req.body;

        // 基础验证
        if (!name || priceCents === undefined || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'name, priceCents, and categoryId are required.'
            });
        }
        if (!Number.isInteger(priceCents) || priceCents < 0) {
            return res.status(400).json({
                success: false,
                message: 'priceCents must be a non-negative integer.'
            });
        }

        const result = await adminService.updateMenuItem(itemId, staff.restaurantId, {
            name,
            description: description || null,
            priceCents,
            categoryId,
            sortOrder: sortOrder || 0
        });

        return res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: result
        });
    } catch (error) {
        const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
        const errorMessage = error.message || 'An unexpected error occurred';
        const httpStatus = errorCode === 'INTERNAL_SERVER_ERROR' ? 500 : 400;

        return res.status(httpStatus).json({ success: false, message: errorMessage });
    }
};