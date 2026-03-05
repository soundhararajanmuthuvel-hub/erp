import { Request, Response } from 'express';
import FinishedProduct from '../models/FinishedProduct';

export const getFinishedProducts = async (req: Request, res: Response) => {
  try {
    const products = await FinishedProduct.find();
    console.log(`[Backend] Found ${products.length} finished products`);
    res.json(products);
  } catch (error: any) {
    console.error('[Backend] Error fetching finished products:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const addFinishedProduct = async (req: Request, res: Response) => {
  try {
    console.log('Creating new finished product:', req.body.name);
    const product = await FinishedProduct.create(req.body);
    console.log('Product created successfully in DB:', JSON.stringify(product, null, 2));
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating finished product:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A product with this name already exists. Please use a unique name.' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateFinishedProduct = async (req: Request, res: Response) => {
  try {
    const product = await FinishedProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFinishedProduct = async (req: Request, res: Response) => {
  try {
    const product = await FinishedProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
