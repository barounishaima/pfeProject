import mongoose from 'mongoose';

const ticketStatusEnum = ['not resolved', 'resolvedByUser', 'resolvedBySystem', 'closed'];

const ticketSchema = new mongoose.Schema({
  TicketId: {
    type: String,
    required: true,
    unique: true, // maps to theHive caseId
  },
  Title: {
    type: String,
    required: true,
  },
  TicketStatus: {
    type: String,
    enum: ticketStatusEnum,
    required: true,
    default: 'not resolved',
  },
  CreatedDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  AffectedDate: {
    type: Date,
  },
  ResolvedDate: {
    type: Date,
  },
  AffectedTo: {
    type: String, // ID of the analyst
  },
  Vulnerabilities: [{
    type: String, // list of Vulnerability IDs
  }]
});

export default mongoose.model('Ticket', ticketSchema);
