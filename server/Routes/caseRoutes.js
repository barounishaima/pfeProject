import express from 'express';
import {
  createNewCase,
  getCasesFromTheHive,
  getSingleCaseFromTheHive,
  getAllStoredTickets,
  getTicket,
  modifyCase,
  removeCase,
  updateAffectedTo,
  changeTicketStatusByAnalyst,
  closeTicketByManager,
  createNewTicket
} from '../controllers/caseController.js';

const router = express.Router();

// TheHive case routes
router.post('/cases', createNewCase); // Create new TheHive case + Mongo ticket

router.get('/cases/thehive', getCasesFromTheHive); // Get all TheHive cases
router.get('/cases/thehive/:caseId', getSingleCaseFromTheHive); // Get one TheHive case by caseId
router.put('/cases/thehive/:caseId', modifyCase); // Update TheHive case + Mongo ticket
router.patch('/cases/thehive/:caseId/affected-to', updateAffectedTo); // Update owner field in TheHive case
router.delete('/cases/thehive/:caseId', removeCase); // Delete TheHive case + Mongo ticket

// Mongo ticket routes
router.post('/tickets', createNewTicket); // Create ticket in Mongo only
router.get('/tickets', getAllStoredTickets); // Get all tickets in Mongo
router.get('/tickets/:ticketId', getTicket); // Get ticket by ticketId
router.patch('/tickets/:ticketId/status', changeTicketStatusByAnalyst); // Update ticket status in Mongo
router.patch('/tickets/:ticketId/close', closeTicketByManager); // Close ticket by manager

export default router;
