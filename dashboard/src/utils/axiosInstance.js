// src/utils/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', 
  withCredentials: true,// Change to your backend URL if different
});

// Automatically add token to Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},
error => Promise.reject(error)
);

export default api;
