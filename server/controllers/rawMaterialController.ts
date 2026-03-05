import { Request, Response } from 'express';
import RawMaterial from '../models/RawMaterial';

export const getRawMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await RawMaterial.find();
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addRawMaterial = async (req: Request, res: Response) => {
  const { name, unit, lowStockThreshold } = req.body;
  try {
    const material = await RawMaterial.create({ name, unit, lowStockThreshold });
    res.status(201).json(material);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addBatch = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { batchNumber, supplier, quantity, purchasePrice, expiryDate } = req.body;
  try {
    const material = await RawMaterial.findById(id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    material.batches.push({ batchNumber, supplier, quantity, purchasePrice, expiryDate, receivedDate: new Date() });
    await material.save();
    res.json(material);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateRawMaterial = async (req: Request, res: Response) => {
  try {
    const material = await RawMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRawMaterial = async (req: Request, res: Response) => {
  try {
    const material = await RawMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
