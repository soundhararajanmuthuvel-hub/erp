import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'Capital Investment' | 'Owner Withdrawal' | 'Sale Payment' | 'Expense' | 'Purchase';
  description: string;
  amount: number;
  mode: 'Cash' | 'Bank';
  date: Date;
  referenceId: string;
}

const TransactionSchema: Schema = new Schema({
  type: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  mode: { type: String, enum: ['Cash', 'Bank'], required: true },
  date: { type: Date, default: Date.now },
  referenceId: { type: String }
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
