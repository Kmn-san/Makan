import { Router } from "express";
import { getOrders, updateOrderStatus } from "../controller/kitchenController.js";
import { requireAuthDevice } from "../middleware/authMiddleware.js";


const router = Router();
router.use(requireAuthDevice)
router.get("/orders", getOrders);

router.patch('/orders/:orderId/status', updateOrderStatus);



export default router;