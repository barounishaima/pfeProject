//services/wazuh.js

const axios = require('axios');
const https = require('https');
const WebSocket = require('ws');
const Alert = require('../models/Alert');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const fetchRecentWazuhAlerts = async () => {
  const { body } = await client.search({
    index: 'wazuh-alerts-*',
    size: 100,
    sort: ['@timestamp:desc'],
    body: {
      query: {
        range: {
          '@timestamp': {
            gte: 'now-5m',
            lte: 'now',
          },
        },
      },
    },
  });

  const hits = body.hits.hits;
  const alerts = hits.map((hit) => {
    const source = hit._source;
    return {
      wazuhAlertId: hit._id,
      ruleId: source.rule?.id || '',
      severity: source.rule?.level || 0,
      timestamp: new Date(source['@timestamp']),
      VulnerabilityId: null,
    };
  });

  for (const alert of alerts) {
    await Alert.findOneAndUpdate(
      { wazuhAlertId: alert.wazuhAlertId },
      alert,
      { upsert: true, new: true }
    );
  }

  return alerts;
};

export const fetchRecentWazuhAlertsFromMongo = async () => {
  try {
    const alerts = await Alert.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(); // Use lean() to get plain JavaScript objects

    return alerts.map((alert) => ({
      ruleId: alert.ruleId,
      description: 'No description', // Placeholder; can be added to schema later
      severity:
        alert.severity <= 5 ? 'low' :
        alert.severity <= 10 ? 'medium' : 'high',
      agentName: 'unknown', // Placeholder; add to schema if needed
      timestamp: alert.timestamp
    }));
  } catch (error) {
    console.error('Error fetching alerts from MongoDB:', error.message);
    return [];
  }
}


