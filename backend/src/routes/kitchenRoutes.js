import { Router } from "express";
import { verifyStaffToken } from "../middleware/authMiddleware.js";
import { getOrders, updateOrderStatus } from "../controller/kitchenController.js";


const router = Router();
router.use(verifyStaffToken)

router.get("/orders", getOrders);

router.patch('/orders/:orderId/status', updateOrderStatus);



export default router;