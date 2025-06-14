import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Initialize DefectDojo API client
export const dojoAPI = axios.create({
  baseURL: process.env.DEFECT_DOJO_URL ,
  headers: {
    'Authorization': `Token ${process.env.DEFECT_DOJO_API_KEY}`,
    'Content-Type': 'application/json'
  }
});