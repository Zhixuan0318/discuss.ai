import "dotenv/config";
import createSubdomain from "../utils/createSubdomain.js";
import setRecord from "../utils/setRecord.js";

export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method Not Allowed. Please use POST." });
    }
  
    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }
  
    try {
      const { name, agentID } = req.body;
      if (!name || !agentID) {
        return res.status(400).json({ success: false, message: "Missing required parameters: name and agentID." });
      }
  
      // Call createSubdomain
      const subdomain = await createSubdomain(name, agentID);
  
      // Call setRecord
      await setRecord(agentID);
  
      // Return the ENS subdomain of the agent
      return res.status(200).json({ success: true, subdomain });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
  }