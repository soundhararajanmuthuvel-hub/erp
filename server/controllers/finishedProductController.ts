import { Request, Response } from 'express';
import FinishedProduct from '../models/FinishedProduct';

export const getFinishedProducts = async (req: Request, res: Response) => {
  try {
    const products = await FinishedProduct.find();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addFinishedProduct = async (req: Request, res: Response) => {
  try {
    const product = await FinishedProduct.create(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
