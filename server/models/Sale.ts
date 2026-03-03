import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
  invoiceNumber: string;
  customer: mongoose.Types.ObjectId;
  saleType: 'Retail' | 'Wholesale' | 'Private Label';
  items: {
    product: mongoose.Types.ObjectId;
    batchNumber: string;
    quantity: number;
    pricePerUnit: number;
    gstAmount: number;
    totalAmount: number;
  }[];
  subTotal: number;
  totalGst: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'Bank' | 'Credit';
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  amountPaid: number;
  balanceAmount: number;
  saleDate: Date;
}

const SaleSchema: Schema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  saleType: { type: String, enum: ['Retail', 'Wholesale', 'Private Label'], required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'FinishedProduct', required: true },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  totalGst: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Cash', 'Bank', 'Credit'], required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Paid' },
  amountPaid: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  saleDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ISale>('Sale', SaleSchema);
