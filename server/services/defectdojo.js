//services/defectdojo.js
import Vulnerability from '../models/Vulnerability.js';

/**
 * Fetch all vulnerabilities (active and inactive) from MongoDB.
 */
export async function getAllFindings() {
  try {
    const findings = await Vulnerability.find().lean();
    return findings;
  } catch (error) {
    console.error('MongoDB error while fetching all vulnerabilities:', error.message);
    return [];
  }
}

export async function createEngagement(name, startDate = new Date()) {
  const payload = {
    name,
    product: "productId", // Replace with actual product ID
    target_start: startDate.toISOString().split('T')[0],
    target_end: startDate.toISOString().split('T')[0],
    status: 'In Progress',
  };

  const res = await dojoAPI.post('/engagements/', payload);
  return res.data.id;
}
