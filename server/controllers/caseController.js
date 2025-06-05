import {
  createCase,
  getAllCasesFromTheHive,
  getCaseFromTheHive,
  getAllTickets,
  getTicketById,
  updateCase,
  deleteCase,
  statusChangeByAnalyst, // custom status update in Mongo only
} from '../services/theHiveService.js';

// Create new case in TheHive + Mongo
export const createNewCase = async (req, res) => {
  try {
    if (!req.body.title || !req.body.owner) {
      return res.status(400).json({ error: "Missing title or owner" });
    }
    if (req.body.severity && (req.body.severity < 1 || req.body.severity > 4)) {
      return res.status(400).json({ error: "Severity must be 1-4" });
    }

    const newCase = await createCase(req.body);
    res.status(201).json({
      id: newCase.caseId,
      apiId: newCase._id,
      title: newCase.title,
      owner: newCase.owner,
      status: newCase.status
    });
  } catch (error) {
    console.error('TheHive API Error (createNewCase):', {
      status: error.response?.status,
      data: error.response?.data,
      request: error.config?.data
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Case creation failed'
    });
  }
};

// Get all cases from TheHive
export const getCasesFromTheHive = async (req, res) => {
  try {
    const { rangeStart = 0, rangeEnd = 100 } = req.query;
    const cases = await getAllCasesFromTheHive(rangeStart, rangeEnd);

    if (!Array.isArray(cases)) {
      console.warn('getAllCasesFromTheHive did not return an array:', cases);
      return res.status(500).json({ error: 'Unexpected response format from TheHive' });
    }

    const formattedCases = cases.map(c => ({
      displayId: c.caseId,
      apiId: c.id,
      title: c.title,
      owner: c.owner,
      status: c.status,
      severity: c.severity,
      createdAt: c.createdAt
    }));

    res.status(200).json(formattedCases);
  } catch (error) {
    console.error('Error in getCasesFromTheHive:', error.message);
    res.status(500).json({ error: 'Failed to fetch cases from TheHive' });
  }
};

// Get single case from TheHive by caseId
export const getSingleCaseFromTheHive = async (req, res) => {
  try {
    const caseData = await getCaseFromTheHive(req.params.caseId);
    res.status(200).json(caseData);
  } catch (error) {
    console.error('Error (getSingleCaseFromTheHive):', error.message);
    res.status(500).json({ error: 'Failed to fetch case from TheHive' });
  }
};

// Get all stored tickets from Mongo
export const getAllStoredTickets = async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error (getAllStoredTickets):', error.message);
    res.status(500).json({ error: 'Failed to fetch tickets from DB' });
  }
};

// Get one ticket from Mongo by TicketId
export const getTicket = async (req, res) => {
  try {
    const ticket = await getTicketById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error (getTicket):', error.message);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

// Update case in TheHive and Mongo
export const modifyCase = async (req, res) => {
  try {
    if (!req.params.caseId) {
      return res.status(400).json({ error: "Missing caseId parameter" });
    }

    const updatedCase = await updateCase(req.params.caseId, req.body);
    res.status(200).json(updatedCase);
  } catch (error) {
    console.error('TheHive API Error (modifyCase):', {
      status: error.response?.status,
      data: error.response?.data,
      request: error.config?.data
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to update case'
    });
  }
};

// Delete case in TheHive and Mongo
export const removeCase = async (req, res) => {
  try {
    if (!req.params.caseId) {
      return res.status(400).json({ error: "Missing caseId parameter" });
    }

    await deleteCase(req.params.caseId);
    res.status(204).send();
  } catch (error) {
    console.error('TheHive API Error (removeCase):', {
      status: error.response?.status,
      data: error.response?.data,
      request: error.config?.data
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to delete case'
    });
  }
};

// Update the AffectedTo attribute (owner)
export const updateAffectedTo = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { newAnalyst } = req.body;

    if (!newAnalyst) {
      return res.status(400).json({ error: 'Missing newAnalyst in body' });
    }

    const updatedCase = await updateCase(caseId, { owner: newAnalyst });

    res.status(200).json({
      message: 'AffectedTo updated successfully',
      updatedCase
    });
  } catch (error) {
    console.error('Error updating AffectedTo:', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: 'Failed to update AffectedTo field' });
  }
};

// Update only status in Mongo (custom statuses)
export const changeTicketStatusByAnalyst = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { newStatus } = req.body;

    if (!ticketId || !newStatus) {
      return res.status(400).json({ error: "Missing ticketId or newStatus" });
    }

    const updatedTicket = await statusChangeByAnalyst(ticketId, newStatus);

    res.status(200).json({
      message: `Ticket status updated to '${newStatus}'`,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error in changeTicketStatusByAnalyst:', error);
    res.status(500).json({ error: error.message || 'Failed to update ticket status' });
  }
};

// Close ticket by manager (sets status to 'closed')
export const closeTicketByManager = async (req, res) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({ error: "Missing caseId parameter" });
    }

    const updatedCase = await updateCase(caseId, { status: 'closed' });

    res.status(200).json({
      message: "Case closed successfully",
      case: updatedCase
    });
  } catch (error) {
    console.error('Error in closeTicketByManager:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to close case'
    });
  }
};
