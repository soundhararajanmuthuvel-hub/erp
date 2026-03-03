import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  creditLimit: number;
  outstandingBalance: number;
  ledger: {
    date: Date;
    description: string;
    type: 'Debit' | 'Credit';
    amount: number;
    balance: number;
    referenceId: string; // Sale ID or Payment ID
  }[];
}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  creditLimit: { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
  ledger: [{
    date: { type: Date, default: Date.now },
    description: { type: String },
    type: { type: String, enum: ['Debit', 'Credit'] },
    amount: { type: Number },
    balance: { type: Number },
    referenceId: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
