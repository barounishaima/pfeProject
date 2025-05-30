import axios from "axios";
import https from "https";

export const getAlerts = async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.ELASTICSEARCH_URL}/wazuh-alerts-*/_search`,
      {
        size: 50,
        sort: [{ "@timestamp": { order: "desc" } }],
      },
      {
        auth: {
          username: process.env.ELASTICSEARCH_USER,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    const hits = response.data.hits.hits.map((hit) => {
      const alert = hit._source;
      return {
        ruleId: alert.rule?.id,
        description: alert.rule?.description,
        severity:
          alert.rule?.level <= 5
            ? "low"
            : alert.rule?.level <= 10
            ? "medium"
            : "high",
        agentName: alert.agent?.name,
        timestamp: alert["@timestamp"],
      };
    });

    res.json(hits);
  } catch (error) {
    console.error("Error querying Elasticsearch:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch alerts from Elasticsearch" });
  }
};
