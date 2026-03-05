import { Request, Response } from 'express';
import ProductionLot from '../models/ProductionLot';
import BOM from '../models/BOM';
import RawMaterial from '../models/RawMaterial';
import FinishedProduct from '../models/FinishedProduct';
import mongoose from 'mongoose';

export const createProductionLot = async (req: Request, res: Response) => {
  const { finishedProductId, targetQuantity, lotNumber } = req.body;
  let session: mongoose.ClientSession | null = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const bom = await BOM.findOne({ finishedProduct: finishedProductId }).populate('materials.material');
    if (!bom) throw new Error('BOM not defined for this product');

    const materialsUsed = [];
    let totalCost = 0;

    // FIFO Deduction Logic
    for (const item of bom.materials) {
      const requiredQty = item.quantity * targetQuantity;
      const material = await RawMaterial.findById(item.material._id).session(session);
      if (!material || material.totalStock < requiredQty) {
        throw new Error(`Insufficient stock for ${material?.name || 'unknown material'}`);
      }

      let remainingToDeduct = requiredQty;
      let materialCost = 0;

      // Sort batches by receivedDate (FIFO)
      material.batches.sort((a, b) => a.receivedDate.getTime() - b.receivedDate.getTime());

      for (const batch of material.batches) {
        if (remainingToDeduct <= 0) break;

        if (batch.quantity >= remainingToDeduct) {
          materialCost += remainingToDeduct * batch.purchasePrice;
          batch.quantity -= remainingToDeduct;
          remainingToDeduct = 0;
        } else {
          materialCost += batch.quantity * batch.purchasePrice;
          remainingToDeduct -= batch.quantity;
          batch.quantity = 0;
        }
      }

      // Remove empty batches
      material.batches = material.batches.filter(b => b.quantity > 0);
      await material.save({ session });

      materialsUsed.push({
        material: material._id,
        quantity: requiredQty,
        cost: materialCost
      });
      totalCost += materialCost;
    }

    const lot = await ProductionLot.create([{
      lotNumber,
      finishedProduct: finishedProductId,
      targetQuantity,
      materialsUsed,
      totalProductionCost: totalCost,
      status: 'In Progress'
    }], { session });

    await session.commitTransaction();
    res.status(201).json(lot[0]);
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('Production Lot Error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    if (session) session.endSession();
  }
};

export const completeProductionLot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { actualYield, wastage } = req.body;
  let session: mongoose.ClientSession | null = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const lot = await ProductionLot.findById(id).session(session);
    if (!lot) throw new Error('Lot not found');

    lot.actualYield = actualYield;
    lot.wastage = wastage;
    lot.status = 'Completed';
    lot.endDate = new Date();
    lot.costPerUnit = lot.totalProductionCost / actualYield;
    await lot.save({ session });

    const product = await FinishedProduct.findById(lot.finishedProduct).session(session);
    if (!product) throw new Error('Product not found');

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + product.expiryDurationMonths);

    product.batches.push({
      batchNumber: lot.lotNumber,
      quantity: actualYield,
      productionDate: new Date(),
      expiryDate,
      productionCost: lot.totalProductionCost
    });
    await product.save({ session });

    await session.commitTransaction();
    res.json(lot);
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('Complete Production Error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    if (session) session.endSession();
  }
};

export const getLots = async (req: Request, res: Response) => {
  try {
    const lots = await ProductionLot.find().populate('finishedProduct');
    res.json(lots);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProductionLot = async (req: Request, res: Response) => {
  try {
    const lot = await ProductionLot.findByIdAndDelete(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    res.json({ message: 'Lot deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
