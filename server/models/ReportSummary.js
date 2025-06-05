import mongoose from 'mongoose';

const reportSummarySchema = new mongoose.Schema({
  gvmResultId: { type: String, required: true },
  scanId: { type: String, required: true },
  totalVulns: { type: Number, required: true },
  bySeverity: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  },
  generatedAt: { type: Date, required: true }
});

export default mongoose.model('ReportSummary', reportSummarySchema);