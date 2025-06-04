const api = require('../utils/apiClient');
import ReportSummary from '../models/ReportSummary';

// Get all report summaries for a given task (scan)
exports.getResultsForTask = async (taskId) => {
  try {
    const results = await ReportSummary.find({ scanId: taskId }).exec();
    return results;
  } catch (error) {
    throw new Error(`Failed to get results for task ${taskId}: ${error.message}`);
  }
};

// Get detail for a single report summary by its MongoDB _id
exports.getResultDetail = async (resultId) => {
  try {
    const result = await ReportSummary.findById(resultId).exec();
    if (!result) {
      throw new Error(`ReportSummary with id ${resultId} not found`);
    }
    return result;
  } catch (error) {
    throw new Error(`Failed to get result detail: ${error.message}`);
  }
};

exports.getReport = (reportId, format = 'xml') => api.get(`/reports/${reportId}`, { params: { format } });