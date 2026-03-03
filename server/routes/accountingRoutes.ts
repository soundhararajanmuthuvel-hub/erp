import express from 'express';
import { addTransaction, addExpense, getTransactions } from '../controllers/accountingController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', protect, authorize(UserRole.ADMIN, UserRole.ACCOUNTANT), getTransactions);
router.post('/transaction', protect, authorize(UserRole.ADMIN, UserRole.ACCOUNTANT), addTransaction);
router.post('/expense', protect, authorize(UserRole.ADMIN, UserRole.ACCOUNTANT), addExpense);

export default router;
