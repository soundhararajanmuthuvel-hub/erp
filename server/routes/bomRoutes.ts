import express from 'express';
import { getBOMs, createBOM, getBOMByProduct } from '../controllers/bomController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', protect, getBOMs);
router.get('/:productId', protect, getBOMByProduct);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.PRODUCTION_MANAGER), createBOM);

export default router;
