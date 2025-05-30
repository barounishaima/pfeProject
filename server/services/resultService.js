import api from '../utils/apiClient';

exports.getResultsForTask = (taskId) => api.get(`/tasks/${taskId}/results`);
exports.getResultDetail = (resultId) => api.get(`/results/${resultId}`);
exports.getReport = (reportId, format = 'xml') =>
  api.get(`/reports/${reportId}`, { params: { format } });