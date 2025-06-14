// models/Alert.js

import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  wazuhAlertId: { type: String, required: true, unique: true },
  ruleId: { type: String, required: true },
  severity: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  vulnerabilityId: { type: String, default: null },
});

const Alert = mongoose.model('Alert', AlertSchema);

export default Alert;
