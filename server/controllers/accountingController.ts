import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Expense from '../models/Expense';

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.create(req.body);
    // Also record in transactions
    await Transaction.create({
      type: 'Expense',
      description: expense.description,
      amount: expense.amount,
      mode: expense.paymentMode,
      date: expense.date,
      referenceId: expense._id.toString()
    });
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
