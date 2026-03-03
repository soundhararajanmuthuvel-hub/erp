import express from 'express';
import { getCustomers, createCustomer } from '../controllers/customerController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getCustomers);
router.post('/', protect, createCustomer);

export default router;
