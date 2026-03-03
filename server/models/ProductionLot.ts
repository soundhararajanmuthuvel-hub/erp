import mongoose, { Schema, Document } from 'mongoose';

export interface IProductionLot extends Document {
  lotNumber: string;
  finishedProduct: mongoose.Types.ObjectId;
  targetQuantity: number;
  actualYield: number;
  wastage: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  materialsUsed: {
    material: mongoose.Types.ObjectId;
    quantity: number;
    cost: number;
  }[];
  totalProductionCost: number;
  costPerUnit: number;
  startDate: Date;
  endDate: Date;
}

const ProductionLotSchema: Schema = new Schema({
  lotNumber: { type: String, required: true, unique: true },
  finishedProduct: { type: Schema.Types.ObjectId, ref: 'FinishedProduct', required: true },
  targetQuantity: { type: Number, required: true },
  actualYield: { type: Number, default: 0 },
  wastage: { type: Number, default: 0 },
  status: { type: String, enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'], default: 'Planned' },
  materialsUsed: [{
    material: { type: Schema.Types.ObjectId, ref: 'RawMaterial' },
    quantity: { type: Number },
    cost: { type: Number }
  }],
  totalProductionCost: { type: Number, default: 0 },
  costPerUnit: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IProductionLot>('ProductionLot', ProductionLotSchema);
