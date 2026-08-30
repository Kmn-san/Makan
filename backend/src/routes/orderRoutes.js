import { Router } from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { createOrder } from "../controller/orderController.js";

const router = Router();

router.post("/", protectRoute, createOrder)
export default router;