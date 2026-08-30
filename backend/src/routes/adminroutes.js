import { Router } from 'express';
import { requireAdminOrOwner, verifyStaffToken } from '../middleware/authMiddleware.js';
import { getMenuItems, toggleAvailability, updateMenuItem } from '../controller/adminController.js';


const router = Router();

router.use(verifyStaffToken);
router.use(requireAdminOrOwner);

// 获取后台菜单列表
router.get('/menu/items', getMenuItems);

// 一键上架/下架菜品
router.patch('/menu/items/:itemId/availability', toggleAvailability);

// 修改菜品信息
router.patch('/menu/items/:itemId', updateMenuItem);

export default router;