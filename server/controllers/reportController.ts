import { Request, Response } from 'express';
import Sale from '../models/Sale';
import ProductionLot from '../models/ProductionLot';
import Expense from '../models/Expense';
import RawMaterial from '../models/RawMaterial';
import FinishedProduct from '../models/FinishedProduct';
import Customer from '../models/Customer';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    const todayProduction = await ProductionLot.countDocuments({ 
      startDate: { $gte: today },
      status: 'Completed'
    });

    const lowStockMaterials = await RawMaterial.find({
      $expr: { $lte: ["$totalStock", "$lowStockThreshold"] }
    });

    const expiringProducts = await FinishedProduct.find({
      "batches.expiryDate": { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // Next 30 days
    });

    const totalOutstanding = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: "$outstandingBalance" } } }
    ]);

    res.json({
      todaySales: todaySales[0]?.total || 0,
      todayProduction,
      lowStockCount: lowStockMaterials.length,
      expiringCount: expiringProducts.length,
      outstandingAmount: totalOutstanding[0]?.total || 0
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfitLoss = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" }, totalGst: { $sum: "$totalGst" } } }
    ]);

    const productionCosts = await ProductionLot.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalCost: { $sum: "$totalProductionCost" } } }
    ]);

    const expenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const revenue = sales[0]?.totalRevenue || 0;
    const gst = sales[0]?.totalGst || 0;
    const netRevenue = revenue - gst;
    const prodCost = productionCosts[0]?.totalCost || 0;
    const grossProfit = netRevenue - prodCost;
    const totalExpenses = expenses[0]?.total || 0;
    const netProfit = grossProfit - totalExpenses;

    res.json({
      revenue,
      gst,
      netRevenue,
      productionCost: prodCost,
      grossProfit,
      expenses: totalExpenses,
      netProfit
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGstReport = async (req: Request, res: Response) => {
  try {
    const report = await Sale.aggregate([
      {
        $unwind: "$items"
      },
      {
        $lookup: {
          from: "finishedproducts",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      },
      {
        $group: {
          _id: "$productInfo.hsnCode",
          hsnCode: { $first: "$productInfo.hsnCode" },
          totalTaxableValue: { $sum: { $subtract: ["$items.totalAmount", "$items.gstAmount"] } },
          totalGst: { $sum: "$items.gstAmount" },
          totalValue: { $sum: "$items.totalAmount" }
        }
      }
    ]);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
