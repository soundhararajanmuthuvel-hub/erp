import mongoose, { Schema, Document } from 'mongoose';

export interface IFinishedProduct extends Document {
  name: string;
  hsnCode: string;
  gstPercentage: number;
  retailPrice: number;
  wholesalePrice: number;
  privateLabelPrice: number;
  expiryDurationMonths: number;
  barcode: string;
  batches: {
    batchNumber: string;
    quantity: number;
    productionDate: Date;
    expiryDate: Date;
    productionCost: number;
  }[];
  totalStock: number;
}

const FinishedProductSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  hsnCode: { type: String, required: true },
  gstPercentage: { type: Number, required: true },
  retailPrice: { type: Number, required: true },
  wholesalePrice: { type: Number, required: true },
  privateLabelPrice: { type: Number, required: true },
  expiryDurationMonths: { type: Number, required: true },
  barcode: { type: String },
  batches: [{
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    productionDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    productionCost: { type: Number, required: true }
  }],
  totalStock: { type: Number, default: 0 }
}, { timestamps: true });

FinishedProductSchema.pre('save', function() {
  this.totalStock = (this.batches as any[]).reduce((acc, batch) => acc + batch.quantity, 0);
});

export default mongoose.model<IFinishedProduct>('FinishedProduct', FinishedProductSchema);
