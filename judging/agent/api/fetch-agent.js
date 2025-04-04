import db from "../config.js";

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed. Use GET." });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  } 

  try {
    // Extract query params
    const { agentID, returnCampaignID } = req.query;

    // Validate agentID
    if (!agentID) {
      return res.status(400).json({ error: "Missing agentID in query parameters." });
    }

    // Fetch agent data from Firebase
    const snapshot = await db.ref(`Judge-Agent/${agentID}`).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Agent not found." });
    }

    // Get agent data
    const agentData = snapshot.val();

    // Exclude campaign_id unless explicitly requested
    if (returnCampaignID !== "true") {
      delete agentData.campaign_id;
    }

    return res.status(200).json(agentData);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
