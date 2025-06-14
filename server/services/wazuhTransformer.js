export const convertAlertsToDefectDojoJSON = (rawAlerts = []) => {
    const findings = rawAlerts.map(alert => ({
      title: `Wazuh Rule ${alert.ruleId || 'N/A'}`,
      description: `Detected by Wazuh agent at ${alert.timestamp.toISOString()}`,
      severity:
        alert.severity <= 5 ? 'Low' :
        alert.severity <= 10 ? 'Medium' : 'High',
      source: 'Wazuh',
      timestamp: alert.timestamp.toISOString(),
      unique_id_from_tool: alert.wazuhAlertId || undefined
    }));
  
    return { findings };
  };
  