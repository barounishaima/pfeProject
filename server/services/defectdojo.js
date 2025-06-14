// services/defectDojoService.js
import axios from 'axios';
import FormData from 'form-data';
import { Buffer } from 'buffer';
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Vulnerability from '../models/Vulnerability.js';

import dotenv from "dotenv";
dotenv.config();

// Configuration from environment variables
const DEFECT_DOJO_URL = process.env.DEFECT_DOJO_URL?.endsWith('/') 
  ? process.env.DEFECT_DOJO_URL.slice(0, -1) 
  : process.env.DEFECT_DOJO_URL;
const DEFECT_DOJO_API_KEY = process.env.DEFECT_DOJO_API_KEY;

if (!DEFECT_DOJO_URL || !DEFECT_DOJO_API_KEY) {
  throw new Error('DefectDojo URL and API key must be configured');
}

// Helper function to handle API errors
class DefectDojoError extends Error {
  constructor(message, response) {
    super(message);
    this.name = 'DefectDojoError';
    this.response = response;
  }
}

/**
 * Main DefectDojo service class
 */
export class DefectDojoService {
  constructor(config = {}) {
    this.baseUrl = DEFECT_DOJO_URL;
    this.apiKey = DEFECT_DOJO_API_KEY;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Get common headers for JSON requests
   */
  get jsonHeaders() {
    return {
      'Authorization': `Token ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Import a scan report to DefectDojo
   * @param {object} params - Import parameters
   * @param {string|Buffer|Readable} params.file - The scan report content
   * @param {string} params.scanType - Scan type identifier
   * @param {number} [params.engagementId] - Engagement ID
   * @param {object} [options] - Import options
   * @returns {Promise<object>} - Import result
   */
   async importScan({
    file,
    scanType = 'OpenVAS Parser',
    engagementId,
    ...params
  }, options = {}) {
    const form = new FormData();
  
    const isJson = scanType.toLowerCase().includes('json');
  
    // Handle different file input types
    if (typeof file === 'string') {
      console.log('[importScan] Input file is string, length:', file.length);
      
      if (file.startsWith('/') || file.startsWith('./')) {
        console.log('[importScan] Treating as file path:', file);
        form.append('file', createReadStream(file));
      } else {
        console.log(`[importScan] Treating as ${isJson ? 'JSON' : 'XML'} content`);
        const buffer = Buffer.from(file);
        form.append('file', buffer, {
          filename: `scan-${Date.now()}.${isJson ? 'json' : 'xml'}`,
          contentType: isJson ? 'application/json' : 'application/xml'
        });
      }
  
    } else if (file instanceof Buffer) {
      console.log('[importScan] Input file is Buffer, length:', file.length);
      console.log(`[importScan] Treating buffer as ${isJson ? 'JSON' : 'XML'}`);
      form.append('file', file, {
        filename: `scan-${Date.now()}.${isJson ? 'json' : 'xml'}`,
        contentType: isJson ? 'application/json' : 'application/xml'
      });
  
    } else if (file instanceof ReadableStream) {
      console.log('[importScan] Input file is ReadableStream');
      form.append('file', file);
  
    } else {
      console.error('[importScan] Invalid file type:', typeof file);
      throw new Error('Invalid file type: must be string, Buffer, or ReadableStream');
    }
  
    // Required parameters
    form.append('scan_type', scanType);
    if (engagementId) {
      console.log('[importScan] Engagement ID:', engagementId);
      form.append('engagement', engagementId.toString());
    }
  
    // Optional parameters
    const {
      active = true,
      verified = true,
      closeOldFindings = false,
      skipDuplicates = true,
      ...otherOptions
    } = options;
  
    form.append('active', active.toString());
    form.append('verified', verified.toString());
    form.append('close_old_findings', closeOldFindings.toString());
    form.append('skip_duplicates', skipDuplicates.toString());
  
    // Additional custom parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        console.log(`[importScan] Adding parameter ${key}:`, value);
        form.append(key, value.toString());
      }
    });
  
    try {
      console.log('[importScan] Sending request to DefectDojo...');
      const response = await axios.post(
        `${DEFECT_DOJO_URL}/import-scan/`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Token ${this.apiKey}`,
          },
          timeout: this.timeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
  
      console.log('[importScan] Success');
      return response.data;
  
    } catch (error) {
      console.error('[importScan] Error:', error.message, error.response?.data);
      throw new DefectDojoError(
        error.response?.data?.detail || error.response?.data || error.message,
        error.response
      );
    }
  }

  /**
   * Reimport a scan to an existing test
   * @param {object} params - Reimport parameters
   * @param {string|Buffer|Readable} params.file - The scan report content
   * @param {number} params.testId - Test ID to reimport into
   * @param {string} params.scanType - Scan type identifier
   * @param {object} [options] - Reimport options
   * @returns {Promise<object>} - Reimport result
   */
  async reimportScan({
    file,
    testId,
    scanType = 'OpenVAS Parser',
    ...params
  }, options = {}) {
    const form = new FormData();

    // Handle file input
    if (typeof file === 'string') {
      console.log('[reimportScan] Input file is string, length:', file.length);
      if (file.startsWith('/') || file.startsWith('./')) {
        console.log('[reimportScan] Treating as file path:', file);
        form.append('file', createReadStream(file));
      } else {
        console.log('[reimportScan] Treating as content, first 100 chars:', file.slice(0, 100));
        const buffer = Buffer.from(file);
        form.append('file', buffer, {
          filename: `reimport-${Date.now()}.json`,
          contentType: 'application/json'
        });
      }
    } else if (file instanceof Buffer) {
      console.log('[reimportScan] Input file is Buffer, length:', file.length);
      form.append('file', file, {
        filename: `reimport-${Date.now()}.json`,
        contentType: 'application/json'
      });
    } else if (file instanceof ReadableStream) {
      console.log('[reimportScan] Input file is ReadableStream');
      form.append('file', file);
    } else {
      console.error('[reimportScan] Invalid file type:', typeof file);
      throw new Error('Invalid file type: must be string, Buffer, or ReadableStream');
    }

    // Required parameters
    console.log('[reimportScan] Test ID:', testId);
    form.append('test', testId.toString());
    form.append('scan_type', scanType);

    // Optional parameters
    const {
      active = true,
      verified = true,
      ...otherOptions
    } = options;

    form.append('active', active.toString());
    form.append('verified', verified.toString());

    // Additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        console.log(`[reimportScan] Adding parameter ${key}:`, value);
        form.append(key, value.toString());
      }
    });

    try {
      console.log('[reimportScan] Sending request to DefectDojo...');
      const response = await axios.post(
        `${this.baseUrl}/reimport-scan/`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Token ${this.apiKey}`,
          },
          timeout: this.timeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('[reimportScan] Success, response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[reimportScan] Error:', error.message, error.response?.data);
      throw new DefectDojoError(
        error.response?.data?.detail || error.response?.data || error.message,
        error.response
      );
    }
  }

  /**
   * Create a new engagement
   * @param {object} params - Engagement parameters
   * @returns {Promise<object>} - Created engagement
   */
  async createEngagement(productId,
    name,
    startDate = new Date()) {
      try {
        const payload = {
          name,
          product: productId || 1,
          status: "In Progress",
          engagement_type: "CI/CD",   // or another valid engagement type
          start_date: startDate.toISOString().split("T")[0],
          end_date: startDate.toISOString().split("T")[0],
          target_start: startDate.toISOString().split("T")[0],
          target_end: startDate.toISOString().split("T")[0],
        };
        
        console.log('[createEngagement] Creating engagement with payload:', payload);
        console.log('DefectDojo engagement creation URL:', `${DEFECT_DOJO_URL}/engagements/`);
        
        const response = await axios.post(`${DEFECT_DOJO_URL}/engagements/`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${DEFECT_DOJO_API_KEY}`
          },
          timeout: 5000
        });
        
        console.log('[createEngagement] Success, created engagement with ID:', response.data.id);
        return response.data.id;
      } catch (error) {
        console.error('[createEngagement] Error:', error.message, error.response?.data);
        throw new Error(
          error.response?.data?.detail || error.response?.data || error.message
        );
      }
    }

  /**
   * Get findings for a test
   * @param {number} testId - Test ID
   * @param {object} [filters] - Additional filters
   * @returns {Promise<array>} - Array of findings
   */
  async getTestFindings(testId, filters = {}) {
    try {
      console.log('[getTestFindings] Fetching findings for test ID:', testId, 'with filters:', filters);
      const params = new URLSearchParams({
        test: testId.toString(),
        ...filters
      });

      const response = await axios.get(
        `${this.baseUrl}/findings/?${params.toString()}`,
        {
          headers: this.jsonHeaders,
          timeout: this.timeout
        }
      );

      console.log('[getTestFindings] Success, found:', response.data.results.length, 'findings');
      return response.data.results;
    } catch (error) {
      console.error('[getTestFindings] Error:', error.message, error.response?.data);
      throw new DefectDojoError(
        error.response?.data?.detail || error.response?.data || error.message,
        error.response
      );
    }
  }

  /**
   * Get all findings from DefectDojo
   * @param {object} [filters] - Additional filters
   * @returns {Promise<array>} - Array of findings
   */
  async getAllFindings(filters = {}) {
    try {
      console.log('[getAllFindings] Fetching all findings with filters:', filters);
      const params = new URLSearchParams(filters);
      const response = await axios.get(
        `${this.baseUrl}/findings/?${params.toString()}`,
        {
          headers: this.jsonHeaders,
          timeout: this.timeout
        }
      );

      console.log('[getAllFindings] Success, found:', response.data.results.length, 'findings');
      return response.data.results;
    } catch (error) {
      console.error('[getAllFindings] Error:', error.message, error.response?.data);
      throw new DefectDojoError(
        error.response?.data?.detail || error.response?.data || error.message,
        error.response
      );
    }
  }
}

// Export a default configured instance
export default new DefectDojoService();


