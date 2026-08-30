import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { mockPayment } from "../controller/paymentController.js";

const router = Router();

router.post('/:orderId/pay', mockPayment)
export default router;