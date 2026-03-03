import express from 'express';
import { getDashboardStats, getProfitLoss, getGstReport } from '../controllers/reportController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/profit-loss', protect, authorize(UserRole.ADMIN, UserRole.ACCOUNTANT), getProfitLoss);
router.get('/gst', protect, authorize(UserRole.ADMIN, UserRole.ACCOUNTANT), getGstReport);

export default router;
