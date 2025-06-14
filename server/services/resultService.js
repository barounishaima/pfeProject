import api from '../utils/apiClient.js';
import ReportSummary from '../models/ReportSummary.js';

// Get all report summaries for a given task (scan)
export const getResultsForTask = async (taskId) => {
  try {
    const results = await ReportSummary.find({ scanId: taskId }).exec();
    return results;
  } catch (error) {
    throw new Error(`Failed to get results for task ${taskId}: ${error.message}`);
  }
};

// Get detail for a single report summary by its MongoDB _id
export const getResultDetail = async (resultId) => {
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

// Get the actual report from the GVM API
export const getReport = (reportId, format = 'xml') => {
  return api.get(`/reports/${reportId}`, { params: { format } });
};
