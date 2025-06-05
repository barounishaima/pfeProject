import axios from'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI backend
  timeout: 10000,
});

export default api;