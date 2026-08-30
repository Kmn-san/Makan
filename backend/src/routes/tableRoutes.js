import { Router } from 'express';
import { resolveTable } from '../controller/tableController.js';

const router = Router();

router.get('/resolve', resolveTable);

export default router;