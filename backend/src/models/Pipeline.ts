import mongoose, { Schema, Document } from 'mongoose';

export interface IPipeline extends Document {
  name: string;
  graph: any; // React Flow graph data
  ipfsCid?: string;
  agentWallet?: {
    address: string;
    mnemonic: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PipelineSchema: Schema = new Schema({
  name: { type: String, required: true },
  graph: { type: Schema.Types.Mixed, required: true },
  ipfsCid: { type: String },
  agentWallet: {
    address: { type: String },
    mnemonic: { type: String }
  }
}, { timestamps: true });

export default mongoose.model<IPipeline>('Pipeline', PipelineSchema);
