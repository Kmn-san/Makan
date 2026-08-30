import { Router } from 'express';
import { getRestaurants } from '../controller/restaurantController.js';

const router = Router();

router.get('/', getRestaurants);

export default router;