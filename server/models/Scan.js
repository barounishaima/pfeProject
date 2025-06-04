import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true }, // GVM task ID
  name: { type: String, required: true },
  status: { type: String, required: true },
  targetId: { type: String, required: true },
  scheduleId: { type: String },
  engagementId: { type: Number, required: true }, // DefectDojo engagement ID
  createdAt: { type: Date, required: true },
  finishedAt: { type: Date }
});

export default mongoose.model('Scan', scanSchema);