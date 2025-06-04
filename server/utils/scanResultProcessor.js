// utils/scanResultProcessor.js

function processScanResults(rawData) {
  if (!rawData || !rawData.result) {
    return [];
  }

  return rawData.result.map(result => {
    const baseResult = {
      id: result.id,
      name: result.name,
      severity: parseFloat(result.severity) || 0.0,
      threat: result.threat || 'Log',
      port: result.port,
      host: result.host?.hostname || null,
      createdAt: result.creation_time,
      modifiedAt: result.modification_time,
      description: cleanDescription(result.description),
      qod: {
        value: parseInt(result.qod?.value) || 0,
        type: result.qod?.type
      }
    };

    // Add NVT (Network Vulnerability Test) details
    if (result.nvt) {
      baseResult.nvt = {
        name: result.nvt.name,
        family: result.nvt.family,
        cvssBase: parseFloat(result.nvt.cvss_base) || 0.0,
        oid: result.nvt.oid,
        tags: parseTags(result.nvt.tags),
        solution: result.nvt.solution
      };
    }

    // Special handling for CPE Inventory results
    if (result.name === 'CPE Inventory') {
      baseResult.cpes = parseCPEs(result.description);
    }

    // Special handling for HTTP Methods results
    if (result.name.includes('HTTP Methods')) {
      baseResult.httpMethods = parseHttpMethods(result.description);
    }

    return baseResult;
  });
}

function cleanDescription(description) {
  if (!description) return null;
  return description.replace(/\s+/g, ' ').trim();
}

function parseTags(tagsString) {
  if (!tagsString) return {};
  
  const tags = {};
  const parts = tagsString.split('|');
  
  parts.forEach(part => {
    const [key, ...valueParts] = part.split('=');
    if (key && valueParts.length > 0) {
      tags[key] = valueParts.join('=');
    }
  });
  
  return tags;
}

function parseCPEs(description) {
  if (!description) return [];
  
  return description
    .split('\n')
    .filter(line => line.includes('cpe:/'))
    .map(line => {
      const parts = line.split('|');
      return parts.length > 1 ? parts[1].trim() : null;
    })
    .filter(cpe => cpe);
}

function parseHttpMethods(description) {
  if (!description) return null;
  
  const methodsMatch = description.match(/HTTP Methods\n[-]+\n(.*)/s);
  if (!methodsMatch) return null;
  
  return methodsMatch[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);
}

module.exports = {
  processScanResults,
  cleanDescription,
  parseTags,
  parseCPEs,
  parseHttpMethods
};