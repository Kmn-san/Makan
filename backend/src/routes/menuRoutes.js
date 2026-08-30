import { Router } from "express";
import { getMenu } from "../controller/menuController.js";

const router = Router();

router.get("/", getMenu)
export default router;