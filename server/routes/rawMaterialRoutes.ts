import express from 'express';
import { getRawMaterials, addRawMaterial, addBatch, updateRawMaterial, deleteRawMaterial } from '../controllers/rawMaterialController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', protect, getRawMaterials);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.WAREHOUSE), addRawMaterial);
router.put('/:id', protect, authorize(UserRole.ADMIN, UserRole.WAREHOUSE), updateRawMaterial);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteRawMaterial);
router.post('/:id/batch', protect, authorize(UserRole.ADMIN, UserRole.WAREHOUSE), addBatch);

export default router;
