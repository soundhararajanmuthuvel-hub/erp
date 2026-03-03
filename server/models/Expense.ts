import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  category: 'Utilities' | 'Rent' | 'Salaries' | 'Maintenance' | 'Other';
  amount: number;
  date: Date;
  paymentMode: 'Cash' | 'Bank';
}

const ExpenseSchema: Schema = new Schema({
  description: { type: String, required: true },
  category: { type: String, enum: ['Utilities', 'Rent', 'Salaries', 'Maintenance', 'Other'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  paymentMode: { type: String, enum: ['Cash', 'Bank'], required: true }
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
