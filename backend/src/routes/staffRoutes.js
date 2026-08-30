import { Router } from "express";
import { getStaff, staffLogin, staffLogout } from "../controller/staffController.js";
import { verifyStaffToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", staffLogin)
router.get("/me", verifyStaffToken, getStaff)
router.post("/logout", verifyStaffToken, staffLogout)
export default router;