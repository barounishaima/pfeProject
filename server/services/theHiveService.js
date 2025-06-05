import theHiveClient from '../config/theHiveConfig.js';
import Ticket from '../models/Ticket.js';
import { promisify } from 'util';
import dns from 'dns';

const lookup = promisify(dns.lookup);

// Create case in TheHive + MongoDB
export const createCase = async (caseData) => {
  const payload = {
    title: caseData.title,
    description: caseData.description || "No description provided",
    severity: caseData.severity || 2,
    startDate: caseData.startDate || Math.floor(Date.now() / 1000),
    owner: caseData.owner,
    tlp: caseData.tlp || 2,
    flag: false
  };

  if (payload.tlp < 0 || payload.tlp > 2) {
    throw new Error("TLP must be between 0-2");
  }

  const response = await theHiveClient.post('/case', payload);
  const theHiveCase = response.data;

  const newTicket = new Ticket({
    TicketId: theHiveCase.caseId,
    Title: payload.title,
    AffectedTo: caseData.owner,
    Vulnerabilities: caseData.vulnerabilities || []
  });

  await newTicket.save();

  return {
    ...theHiveCase,
    id: theHiveCase.caseId,
    apiId: theHiveCase.id
  };
};

// Get single case from TheHive
export const getCaseFromTheHive = async (caseId) => {
  const response = await theHiveClient.get(`/case/${caseId}`);
  return response.data;
};

// Get all cases from TheHive
export const getAllCasesFromTheHive = async (rangeStart = 0, rangeEnd = 100) => {
  const response = await theHiveClient.get('/case', {
    headers: {
      'Range': `case=${rangeStart}-${rangeEnd}`,
      'Content-Type': undefined
    }
  });

  return response.data.map(c => ({
    caseId: c.id,
    id: c.caseId,
    title: c.title,
    owner: c.owner,
    status: c.status,
    severity: c.severity,
    createdAt: new Date(c.createdAt)
  }));
};

// Get all tickets from Mongo
export const getAllTickets = async () => {
  return await Ticket.find();
};

// Get one ticket from Mongo by TicketId
export const getTicketById = async (ticketId) => {
  return await Ticket.findOne({ TicketId: ticketId });
};

// Update case in TheHive and Mongo
export const updateCase = async (caseId, updatedData) => {
  const response = await theHiveClient.patch(`/case/${caseId}`, updatedData);

  // Update in MongoDB if successful
  await Ticket.findOneAndUpdate(
    { TicketId: response.data.caseId },
    {
      Title: response.data.title,
      AffectedTo: response.data.owner
      // Add more fields as needed
    },
    { new: true }
  );

  return response.data;
};

// Delete case from TheHive and Mongo
export const deleteCase = async (caseId) => {
  const theHiveCase = await getCaseFromTheHive(caseId);

  await theHiveClient.delete(`/case/${caseId}`);

  await Ticket.findOneAndDelete({ TicketId: theHiveCase.caseId });
};

// NEW: Update only the TicketStatus in MongoDB (no TheHive update)
export const statusChangeCustom = async (ticketId, newStatus) => {
  const validStatuses = ['not resolved', 'resolvedByUser', 'resolvedBySystem'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}. Must be one of ${validStatuses.join(', ')}`);
  }

  const updatedTicket = await Ticket.findOneAndUpdate(
    { TicketId: ticketId },
    { TicketStatus: newStatus },
    { new: true }
  );

  if (!updatedTicket) {
    throw new Error(`Ticket with TicketId ${ticketId} not found`);
  }

  return updatedTicket;
};
