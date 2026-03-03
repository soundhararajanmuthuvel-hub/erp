import { Request, Response } from 'express';
import BOM from '../models/BOM';

export const getBOMs = async (req: Request, res: Response) => {
  try {
    const boms = await BOM.find().populate('finishedProduct').populate('materials.material');
    res.json(boms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBOM = async (req: Request, res: Response) => {
  try {
    const bom = await BOM.create(req.body);
    res.status(201).json(bom);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getBOMByProduct = async (req: Request, res: Response) => {
  try {
    const bom = await BOM.findOne({ finishedProduct: req.params.productId }).populate('materials.material');
    if (!bom) return res.status(404).json({ message: 'BOM not found' });
    res.json(bom);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
