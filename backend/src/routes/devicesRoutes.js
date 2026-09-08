import { Router } from "express";
import { loginDevice, logoutDevice, registerDevice, updateDeviceName } from "../controller/deviceController.js";
import { requireAuthDevice } from "../middleware/authMiddleware.js";


const router = Router();
router.post('/register', registerDevice)
router.post('/login', loginDevice)
router.use(requireAuthDevice)

router.post("/logout", logoutDevice)
router.post("/name", updateDeviceName)

export default router;