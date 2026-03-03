import express from 'express';
import { getCompany, updateCompany } from '../controllers/companyController';

const router = express.Router();

router.get('/', getCompany);
router.put('/', updateCompany);

export default router;
