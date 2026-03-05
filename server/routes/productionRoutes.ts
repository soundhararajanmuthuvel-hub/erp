import express from 'express';
import { createProductionLot, completeProductionLot, getLots, deleteProductionLot } from '../controllers/productionController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', protect, getLots);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.PRODUCTION_MANAGER), createProductionLot);
router.put('/:id/complete', protect, authorize(UserRole.ADMIN, UserRole.PRODUCTION_MANAGER), completeProductionLot);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteProductionLot);

export default router;
