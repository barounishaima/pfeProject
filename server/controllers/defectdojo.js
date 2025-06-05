import { getAllFindings } from '../services/defectdojo.js';

/**
 * Get all vulnerabilities from MongoDB.
 * Optionally filter by severity using the `?severity=High` query parameter.
 */
export const getVulnerabilities = async (req, res) => {
  try {
    const severity = req.query.severity;
    let findings = await getAllFindings();

    if (severity) {
      findings = findings.filter(f => f.severity === severity);
    }

    const simplified = findings.map(f => ({
      id: f._id,
      title: f.title,
      severity: f.severity,
      product: f.product_name,
      component: f.component_name,
      mitigation: f.mitigation,
      date: f.date,
      source: f.source
    }));

    res.status(200).json(simplified);
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error.message);
    res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
};
