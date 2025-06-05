import { fetchRecentWazuhAlerts, fetchRecentWazuhAlertsFromMongo } from '../services/wazuh.js';

// This endpoint triggers a fetch from Elasticsearch and stores alerts in MongoDB
export const syncWazuhAlerts = async (req, res) => {
  try {
    const alerts = await fetchRecentWazuhAlerts();
    res.status(200).json({ message: 'Alerts synced successfully', count: alerts.length });
  } catch (error) {
    console.error('Error syncing Wazuh alerts:', error.message);
    res.status(500).json({ error: 'Failed to sync Wazuh alerts' });
  }
};

// This endpoint retrieves the latest alerts from MongoDB
export const getWazuhAlerts = async (req, res) => {
  try {
    const alerts = await fetchRecentWazuhAlertsFromMongo();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching Wazuh alerts from MongoDB:', error.message);
    res.status(500).json({ error: 'Failed to retrieve Wazuh alerts' });
  }
};
