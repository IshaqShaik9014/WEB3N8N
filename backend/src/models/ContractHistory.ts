import mongoose, { Schema, Document } from 'mongoose';

export interface IContractHistory extends Document {
  contractNumber: number;
  creatorWallet?: string;
  idea: string;
  code: string;
  approvalTeal: string;
  clearTeal: string;
  abiJson: string;
  frontendCode: string;
  deployCost: number; // calculated cost in microAlgos
  appId?: number; // populated after x402 payment and deployment
  createdAt: Date;
  updatedAt: Date;
}

const ContractHistorySchema: Schema = new Schema({
  contractNumber: { type: Number, unique: true },
  creatorWallet: { type: String },
  idea: { type: String, required: true },
  code: { type: String, required: true },
  approvalTeal: { type: String, required: true },
  clearTeal: { type: String, required: true },
  abiJson: { type: String, required: true },
  frontendCode: { type: String, required: true },
  deployCost: { type: Number, required: true },
  appId: { type: Number }
}, { timestamps: true });

// Auto-increment plugin equivalent for contractNumber
ContractHistorySchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastDoc = await mongoose.model('ContractHistory').findOne({}, {}, { sort: { 'contractNumber': -1 } });
    if (lastDoc && lastDoc.contractNumber) {
      this.contractNumber = lastDoc.contractNumber + 1;
    } else {
      this.contractNumber = 1;
    }
  }
  next();
});

export default mongoose.model<IContractHistory>('ContractHistory', ContractHistorySchema);
