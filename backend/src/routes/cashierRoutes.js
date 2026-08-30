import { Router } from 'express';
import { verifyStaffToken } from '../middleware/authMiddleware.js';
import { cancelOrder } from '../controller/cashierController.js';


const router = Router();

// 🌟 取消订单 (必须带员工 Token，且 Controller 内部会校验角色)
router.post('/orders/:orderId/cancel', verifyStaffToken, cancelOrder);

export default router;