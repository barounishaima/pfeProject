//routes/wazuh.js

import express from 'express';
import { syncWazuhAlerts, getWazuhAlerts } from '../controllers/wazuh.js';

const router = express.Router();

router.post('/sync', syncWazuhAlerts);
router.get('/', getWazuhAlerts);

export default router;
