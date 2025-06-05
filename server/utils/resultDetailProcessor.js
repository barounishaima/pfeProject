// utils/resultDetailProcessor.js

function processResultDetail(rawData) {
  if (!rawData?.result) {
    throw new Error('Invalid result data structure');
  }

  const result = rawData.result;
  
  return {
    id: result.id,
    name: result.name,
    threat: result.threat,
    severity: parseFloat(result.severity) || 0.0,
    originalThreat: result.original_threat,
    originalSeverity: parseFloat(result.original_severity) || 0.0,
    port: result.port,
    compliance: result.compliance,
    dates: {
      created: result.creation_time,
      modified: result.modification_time
    },
    task: {
      id: result.task?.id,
      name: result.task?.name
    },
    host: {
      hostname: result.host?.hostname,
      asset: result.host?.asset
    },
    nvt: {
      name: result.nvt?.name,
      family: result.nvt?.family,
      type: result.nvt?.type,
      oid: result.nvt?.oid,
      cvss: {
        base: parseFloat(result.nvt?.cvss_base) || 0.0,
        vector: parseCvssVector(result.nvt?.tags),
        version: detectCvssVersion(result.nvt?.severities)
      },
      severities: processSeverities(result.nvt?.severities),
      tags: parseTags(result.nvt?.tags),
      solution: result.nvt?.solution,
      scanVersion: result.scan_nvt_version
    },
    qod: {
      value: parseInt(result.qod?.value) || 0,
      type: result.qod?.type
    },
    description: cleanDescription(result.description),
    httpMethods: result.name.includes('HTTP Methods') 
      ? parseHttpMethods(result.description) 
      : null,
    raw: rawData // Include raw data for debugging/fallback
  };
}

function parseCvssVector(tags) {
  if (!tags) return null;
  const cvssMatch = tags.match(/cvss_base_vector=([^|]+)/);
  return cvssMatch ? cvssMatch[1] : null;
}

function detectCvssVersion(severities) {
  if (!severities) return null;
  if (severities.severity) {
    return severities.severity.type === 'cvss_base_v3' ? '3.x' : '2.0';
  }
  return null;
}

function processSeverities(severities) {
  if (!severities) return null;
  
  const result = {
    score: parseFloat(severities.score) || 0.0
  };
  
  if (severities.severity) {
    result.details = {
      origin: severities.severity.origin,
      date: severities.severity.date,
      score: parseFloat(severities.severity.score) || 0.0,
      vector: severities.severity.value,
      type: severities.severity.type
    };
  }
  
  return result;
}

// Reuse these from scanResultProcessor.js
const { cleanDescription, parseTags, parseHttpMethods } = require('./scanResultProcessor');

module.exports = {
  processResultDetail,
  parseCvssVector,
  detectCvssVersion,
  processSeverities
};