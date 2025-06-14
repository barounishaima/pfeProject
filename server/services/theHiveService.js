import theHiveClient from "../config/theHiveConfig.js";
import Ticket from "../models/Ticket.js";
import Vulnerability from "../models/Vulnerability.js";
import { promisify } from "util";
import { v4 as uuidv4 } from 'uuid';
import dns from "dns";

const lookup = promisify(dns.lookup);

// Utility to map severity from string to TheHive numeric
const mapSeverity = (severity) => {
  switch (severity) {
    case "critical":
      return 3;
    case "high":
      return 2;
    case "medium":
      return 1;
    case "low":
    case "info":
      return 0;
    default:
      return 1;
  }
};

// Create a case in TheHive
export const createCase = async (caseData) => {
  const payload = {
    title: caseData.title,
    description: caseData.description || "No description provided",
    severity: caseData.severity || 2,
    startDate: caseData.startDate || Math.floor(Date.now() / 1000),
    owner: caseData.owner,
    tlp: caseData.tlp || 2,
    flag: false,
  };

  const response = await theHiveClient.post("/case", payload);
  const theHiveCase = response.data;

  return {
    ...theHiveCase,
    id: theHiveCase.caseId,
    apiId: theHiveCase.id,
  };
};

// Create a ticket in MongoDB
export const createTicketInMongo = async (ticketData) => {
  const ticket = new Ticket({
    TicketId: uuidv4(),
    Title: ticketData.Title,
    TicketStatus: ticketData.TicketStatus || "not resolved",
    CreatedDate: ticketData.CreatedDate || new Date(),
    AffectedDate: ticketData.AffectedDate || new Date(),
    ResolvedDate: ticketData.ResolvedDate,
    AffectedTo: ticketData.AffectedTo,
    Vulnerabilities: ticketData.Vulnerabilities || [],
  });

  return await ticket.save();
};

// Get single case from TheHive
export const getCaseFromTheHive = async (caseId) => {
  const response = await theHiveClient.get(`/case/${caseId}`);
  return response.data;
};

// Get all cases from TheHive
export const getAllCasesFromTheHive = async (
  rangeStart = 0,
  rangeEnd = 100
) => {
  const response = await theHiveClient.get("/case", {
    headers: {
      Range: `case=${rangeStart}-${rangeEnd}`,
      "Content-Type": undefined,
    },
  });

  return response.data.map((c) => ({
    caseId: c.id,
    id: c.caseId,
    title: c.title,
    owner: c.owner,
    status: c.status,
    severity: c.severity,
    createdAt: new Date(c.createdAt),
  }));
};

// Get all tickets from Mongo
export const getAllTickets = async () => {
  try {
    const tickets = await Ticket.find();
    return tickets;
  } catch (error) {
    throw new Error('Failed to retrieve tickets: ' + error.message);
  }
};

// Get one ticket from Mongo by _id
export const getTicketById = async (ticketId) => {
  return await Ticket.findById(ticketId);
};

// Update case in TheHive and Mongo
export const updateCase = async (caseId, updatedData) => {
  const response = await theHiveClient.patch(`/case/${caseId}`, updatedData);
  return response.data;
};

// Delete case from TheHive and matching ticket in Mongo
export const deleteCase = async (caseId) => {
  const theHiveCase = await getCaseFromTheHive(caseId);
  await theHiveClient.delete(`/case/${caseId}`);
  await Ticket.findOneAndDelete({ Title: theHiveCase.title });
};

// Mongo-only ticket status update
export const statusChangeCustom = async (ticketId, newStatus) => {
  const validStatuses = [
    "not resolved",
    "resolvedByUser",
    "resolvedBySystem",
    "closed",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(
      `Invalid status: ${newStatus}. Must be one of ${validStatuses.join(", ")}`
    );
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    ticketId,
    { TicketStatus: newStatus },
    { new: true }
  );

  if (!updatedTicket) {
    throw new Error(`Ticket with ID ${ticketId} not found`);
  }

  return updatedTicket;
};

// Close all TheHive cases linked to a ticket
export const closeTicketAndLinkedCases = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error(`Ticket with id ${ticketId} not found`);
  }

  const vulnerabilities = await Vulnerability.find({
    VulnerabilityId: { $in: ticket.Vulnerabilities },
  });

  const caseIds = vulnerabilities.map((vuln) => vuln.theHiveCaseId);
  await Promise.all(
    caseIds.map((caseId) =>
      theHiveClient.patch(`/case/${caseId}`, { status: "closed" })
    )
  );

  ticket.TicketStatus = "closed";
  ticket.ResolvedDate = new Date();
  await ticket.save();

  return ticket;
};

// Service to create missing cases for vulnerabilities
export const createCasesForUnlinkedVulnerabilities = async () => {
  const unlinkedVulns = await Vulnerability.find({ theHiveCaseId: "" });
  const createdCases = [];

  for (const vuln of unlinkedVulns) {
    try {
      const theHiveCase = await createCase({
        title: vuln.Title,
        description: vuln.Description,
        severity: mapSeverity(vuln.Severity),
        tags: vuln.CVE,
        source: vuln.source.type,
        sourceId:
          vuln.source.gvmResultId ||
          vuln.source.wazuhAlertId ||
          vuln.VulnerabilityId,
      });

      vuln.theHiveCaseId = theHiveCase.id;
      await vuln.save();

      createdCases.push({
        caseId: theHiveCase.apiId,        
        caseDisplayId: theHiveCase.caseId,
        vulnerability: vuln,
      });

    } catch (err) {
      console.error(
        `Failed to create TheHive case for vuln ${vuln.VulnerabilityId}:`,
        err.message
      );
    }
    
  }
  return createdCases;
};
