import mongoose, { Schema, Document } from 'mongoose';

export interface IRawMaterial extends Document {
  name: string;
  unit: string; // kg, gram, liter, ml, piece
  lowStockThreshold: number;
  batches: {
    batchNumber: string;
    supplier: string;
    quantity: number;
    purchasePrice: number;
    expiryDate: Date;
    receivedDate: Date;
  }[];
  totalStock: number;
}

const RawMaterialSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  lowStockThreshold: { type: Number, default: 10 },
  batches: [{
    batchNumber: { type: String, required: true },
    supplier: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    receivedDate: { type: Date, default: Date.now }
  }],
  totalStock: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save to calculate total stock
RawMaterialSchema.pre('save', function() {
  this.totalStock = (this.batches as any[]).reduce((acc, batch) => acc + batch.quantity, 0);
});

export default mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);
