const service = require('../services/resultService');

const { processScanResults } = require('../utils/scanResultProcessor');

exports.getResultsForTask = async (req, res) => {
  try {
    const response = await service.getResultsForTask(req.params.taskId);
    
    if (!response.data) {
      return res.status(404).json({ error: 'No results found for this task' });
    }

    // Process the raw results into a more usable format
    const processedResults = processScanResults(response.data);

    // Add pagination info if available
    const resultWithMeta = {
      data: processedResults,
      meta: {
        total: response.data.result_count?.filtered || processedResults.length,
        count: processedResults.length,
        status: response.data.status,
        statusText: response.data.status_text
      }
    };

    res.json(resultWithMeta);
  } catch (err) {
    console.error('Error fetching task results:', err);
    res.status(500).json({ 
      error: 'Failed to fetch task results',
      details: err.message 
    });
  }
};


const { processResultDetail } = require('../utils/resultDetailProcessor');

exports.getResultDetail = async (req, res) => {
  try {
    const response = await service.getResultDetail(req.params.resultId);
    
    if (!response.data?.result) {
      return res.status(404).json({ 
        error: 'Result not found',
        details: `No result found with ID ${req.params.resultId}`
      });
    }

    const processedResult = processResultDetail(response.data);
    
    res.json({
      data: processedResult,
      meta: {
        status: response.data.status,
        statusText: response.data.status_text,
        filteredCount: parseInt(response.data.result_count?.filtered) || 1
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

exports.getReport = async (req, res) => {
  try {
    const { format } = req.query;
    const result = await service.getReport(req.params.reportId, format);
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};