//theHiveConfig.js
import axios from 'axios';
import dotenv from 'dotenv';


const theHiveClient = axios.create({
  baseURL: process.env.THE_HIVE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.THE_HIVE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

theHiveClient.interceptors.response.use(response => {
  //console.log('Received Headers:', response.headers);
  return response;
}, error => {
  console.error('Interceptor Error:', error.message);
  return Promise.reject(error);
});

export default theHiveClient;