import express from 'express';
import {
  getResultsForTask,
  getResultDetail,
  getReport
} from '../controllers/resultController.js';

const router = express.Router();

router.get('/tasks/:taskId/results', getResultsForTask);
router.get('/results/:resultId', getResultDetail);
router.get('/reports/:reportId', getReport);

export default router;
