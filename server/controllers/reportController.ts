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

    // Weekly Sales Data for Chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
          sales: { $sum: "$grandTotal" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      todaySales: todaySales[0]?.total || 0,
      todayProduction,
      lowStockCount: lowStockMaterials.length,
      expiringCount: expiringProducts.length,
      outstandingAmount: totalOutstanding[0]?.total || 0,
      weeklySales: weeklySales.map(s => ({ name: s._id, sales: s.sales }))
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProfitLoss = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.$gte = new Date(startDate as string);
      dateFilter.$lte = new Date(endDate as string);
    }

    const sales = await Sale.aggregate([
      { $match: startDate ? { saleDate: dateFilter } : {} },
      { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" }, totalGst: { $sum: "$totalGst" } } }
    ]);

    const productionCosts = await ProductionLot.aggregate([
      { $match: { 
        status: 'Completed',
        ...(startDate ? { endDate: dateFilter } : {})
      } },
      { $group: { _id: null, totalCost: { $sum: "$totalProductionCost" } } }
    ]);

    const expenses = await Expense.aggregate([
      { $match: startDate ? { date: dateFilter } : {} },
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
    console.error('Profit & Loss Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getGstReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.$gte = new Date(startDate as string);
      dateFilter.$lte = new Date(endDate as string);
    }

    const report = await Sale.aggregate([
      { $match: startDate ? { saleDate: dateFilter } : {} },
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
    console.error('GST Report Error:', error);
    res.status(500).json({ message: error.message });
  }
};
