//services/wazuh.js

import axios from "axios";
import https from "https";
import WebSocket from "ws";
import "dotenv/config";
import { Client } from "@elastic/elasticsearch";
import Alert from "../models/Alert.js";

const agent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ Accept self-signed certs
});

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  agent,
});

export const fetchRecentWazuhAlerts = async () => {
  const response = await axios.post(
    `${process.env.ELASTICSEARCH_URL}/wazuh-alerts-*/_search`,
    {
      size: 100,
      sort: [{ "@timestamp": { order: "desc" } }],
      query: {
        range: {
          "@timestamp": {
            gte: "now-5m",
            lte: "now"
          }
        }
      }
    },
    {
      auth: {
        username: process.env.ELASTICSEARCH_USER,
        password: process.env.ELASTICSEARCH_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }
  );

  const hits = response.data.hits?.hits || [];
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
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(10).lean(); // Use lean() to get plain JavaScript objects

    return alerts.map((alert) => ({
      ruleId: alert.ruleId,
      description: "No description", // Placeholder; can be added to schema later
      severity:
        alert.severity <= 5 ? "low" : alert.severity <= 10 ? "medium" : "high",
      agentName: "unknown", // Placeholder; add to schema if needed
      timestamp: alert.timestamp,
    }));
  } catch (error) {
    console.error("Error fetching alerts from MongoDB:", error.message);
    return [];
  }
};
