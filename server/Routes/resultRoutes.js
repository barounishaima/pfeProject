const express = require('express');
const router = express.Router();
const controller = require('../controllers/resultController');

router.get('/tasks/:taskId/results', controller.getResultsForTask);
router.get('/results/:resultId', controller.getResultDetail);
router.get('/reports/:reportId', controller.getReport);

module.exports = router;
