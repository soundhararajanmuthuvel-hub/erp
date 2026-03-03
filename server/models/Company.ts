import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  gstin?: string;
  pan?: string;
  logo?: string; // Base64 or URL
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, default: 'NaturalFlow Manufacturing' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  logo: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<ICompany>('Company', CompanySchema);
