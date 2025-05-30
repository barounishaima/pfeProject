import api from '../utils/apiClient';

exports.createTarget = (data) => api.post('/targets', data);
exports.getTargets = () => api.get('/targets');
exports.getTarget = (id) => api.get(`/targets/${id}`);
exports.updateTarget = (id, data) => api.put(`/targets/${id}`, data);
exports.deleteTarget = (id) => api.delete(`/targets/${id}`);