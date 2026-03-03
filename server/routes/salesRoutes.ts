import express from 'express';
import { createSale, getSales } from '../controllers/salesController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', protect, getSales);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.SALES), createSale);

export default router;
