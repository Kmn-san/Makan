import { Router } from "express";
import { verifyOrRegisterDevice } from "../middleware/authMiddleware.js";
import { logoutDevice, updateDeviceName } from "../controller/deviceController.js";


const router = Router();
router.post('/register', verifyOrRegisterDevice)
router.post("/logout", logoutDevice)
router.post("/name", updateDeviceName)

export default router;