import express from 'express';
import { getAlerts } from '../controllers/wazuh.js';

const router = express.Router();

router.get('/alerts', getAlerts);

export {router as wazuhRouter};
