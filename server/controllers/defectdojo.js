import { getActiveFindings } from '../services/defectdojo.js';


export const getVulnerabilities = async (req, res) => {
  try {
    const severity = req.query.severity;
    let findings = await getActiveFindings();

    if (severity) {
      findings = findings.filter(f => f.severity === severity);
    }

    const simplified = findings.map(f => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      product: f.product_name,
      component: f.component_name,
      mitigation: f.mitigation,
      date: f.date,
      url: f.unique_id_from_tool
    }));
    res.json(simplified);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
};
