//utils/apiClinet.js

import axios from'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // FastAPI backend
  timeout: 10000,
});

export default api;