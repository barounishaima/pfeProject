import api from '../utils/apiClient';

exports.createTask = (data) => api.post('/tasks', data);
exports.getTasks = () => api.get('/tasks');
exports.getTask = (id) => api.get(`/tasks/${id}`);
exports.updateTask = (id, data) => api.put(`/tasks/${id}`, data);
exports.deleteTask = (id) => api.delete(`/tasks/${id}`);
exports.startTask = (id) => api.post(`/tasks/${id}/start`);