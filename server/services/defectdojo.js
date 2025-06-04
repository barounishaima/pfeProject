import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const defectDojoClient = axios.create({
  baseURL: process.env.DEFECT_DOJO_URL, // Example: http://192.168.137.90:8080/api/v2
  headers: {
    Authorization: `Token ${process.env.DEFECT_DOJO_API_KEY}`,
  },
});

async function getActiveFindings() {
  let findings = [];
  let nextUrl = 'findings/?active=true';

  try {
    while (nextUrl) {
      console.log('BASE URL:', defectDojoClient.defaults.baseURL);
      console.log('NEXT URL:', nextUrl);
      const response = await defectDojoClient.get(nextUrl);
      findings = findings.concat(response.data.results);
      console.log('Requesting:', defectDojoClient.defaults.baseURL + nextUrl);

      if (response.data.next) {
        const url = new URL(response.data.next);
        nextUrl = url.pathname.replace('/api/v2/', '') + url.search;

        if (nextUrl.startsWith('/')) {
          nextUrl = nextUrl.slice(1);
        }
      } else {
        nextUrl = null;
      }
    }
    return findings;
  } catch (error) {
    console.error('DefectDojo API error:', error.message);
    return [];
  }
}

export async function createEngagement(productId, name, startDate = new Date()) {
  const payload = {
    name,
    product: productId,
    target_start: startDate.toISOString().split('T')[0],
    target_end: startDate.toISOString().split('T')[0],
    status: 'In Progress',
  };

  const res = await dojoAPI.post('/engagements/', payload);
  return res.data.id;
}

export { getActiveFindings };