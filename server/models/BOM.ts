import mongoose, { Schema, Document } from 'mongoose';

export interface IBOM extends Document {
  finishedProduct: mongoose.Types.ObjectId;
  materials: {
    material: mongoose.Types.ObjectId;
    quantity: number; // Quantity required for 1 unit of finished product
  }[];
}

const BOMSchema: Schema = new Schema({
  finishedProduct: { type: Schema.Types.ObjectId, ref: 'FinishedProduct', required: true, unique: true },
  materials: [{
    material: { type: Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    quantity: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<IBOM>('BOM', BOMSchema);
