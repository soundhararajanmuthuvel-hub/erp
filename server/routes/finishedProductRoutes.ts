import express from 'express';
import { getFinishedProducts, addFinishedProduct, updateFinishedProduct, deleteFinishedProduct } from '../controllers/finishedProductController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', protect, getFinishedProducts);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.PRODUCTION_MANAGER), addFinishedProduct);
router.put('/:id', protect, authorize(UserRole.ADMIN, UserRole.PRODUCTION_MANAGER), updateFinishedProduct);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteFinishedProduct);

export default router;
