import theHiveClient from '../config/theHiveConfig.js';
import net from'net';
import { URL } from'url';

export const createObservable = async (caseId, observableData) => {
  try {
    const res = await theHiveClient.post(`/case/${caseId}/artifact`, observableData);
    return res.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.some(e => e.message?.includes("duplicate"))) {
      console.warn(`[createObservable] Observable ${observableData.data} already exists in case ${caseId}`);
      return null;
    }
    throw error;
  }
};

export const getObservablesByCaseId = async (caseId) => {
  const body = {
    _parent: {
      _type: 'case',
      _query: {
        _id: caseId
      }
    }
  };
  const res = await theHiveClient.post('/case/artifact/_search', body);
  return res.data;
};

export const updateObservableById = async (observableId, updates) => {
  const res = await theHiveClient.patch(`/case/artifact/${observableId}`, updates);
  return res.data;
};

export const deleteObservableById = async (observableId) => {
  await theHiveClient.delete(`/case/artifact/${observableId}`);
};

export const extractObservablesFromFinding = (finding) => {
  const obs = [];

  if (finding.cve) {
    const cves = Array.isArray(finding.cve) ? finding.cve : [finding.cve];
    cves.forEach(c => {
      obs.push({ dataType: 'cve', data: c, ioc: false, tlp: 2 });
    });
  }

  if (finding.endpoints) {
    finding.endpoints.forEach(ep => {
      try {
        const host = typeof ep === 'string' ? new URL(ep).hostname : ep.host;
        if (!host) return;
        const type = net.isIP(host) ? 'ip' : 'domain';
        obs.push({ dataType: type, data: host, ioc: false, tlp: 2 });
      } catch (err) {
        console.warn('Invalid endpoint format in finding:', ep);
      }
    });
  }

  return obs;
};

export const addObservablesToCase = async (caseId, observables) => {
  for (const o of observables) {
    try {
      await createObservable(caseId, o);
    } catch (err) {
      console.error(`Failed to add observable ${o.data} to case ${caseId}:`, err.message);
    }
  }
};


