import db from "../config.js";

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed. Use DELETE." });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  try {
    // Extract agentID from query params
    const { agentID } = req.query;

    if (!agentID) {
      return res.status(400).json({ error: "Missing agentID in query parameters." });
    }

    // Check if agent exists in Firebase
    const agentRef = db.ref(`Judge-Agent/${agentID}`);
    const snapshot = await agentRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Agent not found." });
    }

    // Delete the agent from Firebase
    await agentRef.remove();

    return res.status(200).json({ message: `Agent ${agentID} deleted successfully!` });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
