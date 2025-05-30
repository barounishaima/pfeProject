import api from '../utils/apiClient';

exports.createSchedule = (data) => api.post('/schedules', data);
exports.getSchedules = () => api.get('/schedules');
exports.getSchedule = (id) => api.get(`/schedules/${id}`);
exports.updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
exports.deleteSchedule = (id) => api.delete(`/schedules/${id}`);