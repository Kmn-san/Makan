import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getCustomer, getMyOrders } from "../controller/customerController.js";

const router = Router();
router.use(protectRoute)
router.get("/", getCustomer)
router.get('/orders', getMyOrders);
export default router;