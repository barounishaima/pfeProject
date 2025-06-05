// models/Schedule.js
import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  schedualId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  finishDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Schedule', scheduleSchema);
