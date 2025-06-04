const service = require('../services/resultService');

// Get all results for a given task (scan)
exports.getResultsForTask = async (req, res) => {
  try {
    const results = await service.getResultsForTask(req.params.taskId);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No results found for this task' });
    }

    res.json({
      data: results,
      meta: {
        total: results.length,
        count: results.length
      }
    });
  } catch (err) {
    console.error('Error fetching task results:', err);
    res.status(500).json({
      error: 'Failed to fetch task results',
      details: err.message
    });
  }
};

// Get detail for a single result by MongoDB _id
exports.getResultDetail = async (req, res) => {
  try {
    const result = await service.getResultDetail(req.params.resultId);

    if (!result) {
      return res.status(404).json({
        error: 'Result not found',
        details: `No result found with ID ${req.params.resultId}`
      });
    }

    res.json({
      data: result,
      meta: {
        id: req.params.resultId
      }
    });
  } catch (err) {
    console.error(`Error processing result detail ${req.params.resultId}:`, err);
    res.status(500).json({
      error: 'Failed to process result details',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Proxy getReport to external API (no change needed)
exports.getReport = async (req, res) => {
  try {
    const { format } = req.query;
    const result = await service.getReport(req.params.reportId, format);
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};