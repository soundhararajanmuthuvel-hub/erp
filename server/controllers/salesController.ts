import { Request, Response } from 'express';
import Sale from '../models/Sale';
import FinishedProduct from '../models/FinishedProduct';
import Customer from '../models/Customer';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

export const createSale = async (req: Request, res: Response) => {
  let session: mongoose.ClientSession | null = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { 
      customerId, 
      saleType, 
      items, 
      paymentMode, 
      amountPaid 
    } = req.body;

    let subTotal = 0;
    let totalGst = 0;

    const processedItems = [];

    for (const item of items) {
      const product = await FinishedProduct.findById(item.productId).session(session);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const batch = product.batches.find(b => b.batchNumber === item.batchNumber);
      if (!batch || batch.quantity < item.quantity) {
        throw new Error(`Insufficient stock in batch ${item.batchNumber} for ${product.name}`);
      }

      batch.quantity -= item.quantity;
      product.batches = product.batches.filter(b => b.quantity > 0);
      await product.save({ session });

      const itemSubTotal = item.quantity * item.pricePerUnit;
      const itemGst = (itemSubTotal * product.gstPercentage) / 100;
      
      processedItems.push({
        product: product._id,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        gstAmount: itemGst,
        totalAmount: itemSubTotal + itemGst
      });

      subTotal += itemSubTotal;
      totalGst += itemGst;
    }

    const grandTotal = subTotal + totalGst;
    const balanceAmount = grandTotal - amountPaid;
    const paymentStatus = balanceAmount <= 0 ? 'Paid' : (amountPaid > 0 ? 'Partial' : 'Unpaid');

    const invoiceNumber = `INV-${Date.now()}`;

    const sale = await Sale.create([{
      invoiceNumber,
      customer: customerId,
      saleType,
      items: processedItems,
      subTotal,
      totalGst,
      grandTotal,
      paymentMode,
      paymentStatus,
      amountPaid,
      balanceAmount
    }], { session });

    // Update Customer Ledger if Credit or Partial
    const customer = await Customer.findById(customerId).session(session);
    if (customer) {
      if (paymentMode === 'Credit' || balanceAmount > 0) {
        customer.outstandingBalance += balanceAmount;
        customer.ledger.push({
          date: new Date(),
          description: `Sale Invoice ${invoiceNumber}`,
          type: 'Debit',
          amount: grandTotal,
          balance: customer.outstandingBalance,
          referenceId: sale[0]._id.toString()
        });
        if (amountPaid > 0) {
          customer.ledger.push({
            date: new Date(),
            description: `Payment for ${invoiceNumber}`,
            type: 'Credit',
            amount: amountPaid,
            balance: customer.outstandingBalance,
            referenceId: sale[0]._id.toString()
          });
        }
        await customer.save({ session });
      }
    }

    // Record Transaction
    if (amountPaid > 0) {
      await Transaction.create([{
        type: 'Sale Payment',
        description: `Payment for Invoice ${invoiceNumber}`,
        amount: amountPaid,
        mode: paymentMode === 'Credit' ? 'Cash' : paymentMode, // Default to cash if credit but partial paid
        referenceId: sale[0]._id.toString()
      }], { session });
    }

    await session.commitTransaction();
    res.status(201).json(sale[0]);
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('Sale Error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    if (session) session.endSession();
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.find().populate('customer').populate('items.product');
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
