import express from 'express';
import { getVulnerabilities } from '../controllers/defectdojo.js';

const router = express.Router();

router.get('/vulnerabilities', getVulnerabilities);

export default router;
