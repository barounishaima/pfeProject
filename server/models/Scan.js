import mongoose from "mongoose";

const scanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  comment: { type: String },
  status: { type: String, required: true },
  target_Id: { type: String, required: true },
  schedule_Id: { type: String },
  engagementId: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  finishedAt: { type: Date },
});

export default mongoose.model("Scan", scanSchema);
