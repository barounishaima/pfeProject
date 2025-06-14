import express from 'express';
import { processFinishedScans } from '../controllers/automatisation.js';

const router = express.Router();

// Route to process finished scans
router.post('/', processFinishedScans);

export default router;
