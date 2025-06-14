import axios from 'axios';

const CORTEX_URL = process.env.CORTEX_URL;
const CORTEX_API_KEY = process.env.CORTEX_API_KEY;

const cortexClient = axios.create({
  baseURL: `${CORTEX_URL}/api`,
  headers: {
    Authorization: `Bearer ${CORTEX_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// 1. Get list of available analyzers
const getCortexAnalyzers = async () => {
  const res = await cortexClient.get('/analyzer');
  return res.data;
};

// 2. Run analyzer on a specific observable
const runAnalyzerOnObservable = async (observableId, analyzerId) => {
  const payload = {
    dataType: 'observable',
    data: observableId,
    tlp: 2,
    analyzer: analyzerId,
  };

  const res = await cortexClient.post('/analyze', payload);
  return res.data; // contains jobId
};

// 3. Get analyzer report by jobId
const getAnalyzerReport = async (jobId) => {
  const res = await cortexClient.get(`/job/${jobId}/report`);
  return res.data;
};

// Optional: run all analyzers for a given observable
const runAllAnalyzersForObservable = async (observable) => {
  const analyzers = await getCortexAnalyzers();
  const compatible = analyzers.filter(an => an.dataType === observable.dataType);

  const jobs = [];
  for (const analyzer of compatible) {
    const job = await runAnalyzerOnObservable(observable.data, analyzer.name);
    jobs.push(job);
  }

  return jobs;
};

export {
  getCortexAnalyzers,
  runAnalyzerOnObservable,
  getAnalyzerReport,
  runAllAnalyzersForObservable
};
