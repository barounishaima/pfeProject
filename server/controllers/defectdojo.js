import DefectDojoService from '../services/defectdojo.js';

/**
 * Get all vulnerabilities from MongoDB.
 * Optionally filter by severity using the `?severity=High` query parameter.
 */
export const getVulnerabilities = async (req, res) => {
  try {
    const severity = req.query.severity;
    let findings = await DefectDojoService.getAllFindings();

    if (severity) {
      findings = findings.filter(f => f.severity === severity);
    }


    res.status(200).json(findings);
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error.message);
    res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
};
