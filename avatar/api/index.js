import avatarGenerator from "../utils/avatarGenerator.js";
import promptGenerator from "../utils/promptGenerator.js";
import storeAvatar from "../utils/storeAvatar.js";
import db from "../config.js";

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
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.API_KEY}`) {

      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  } 

  try {
    const { agentID } = req.body;
    if (!agentID) {
      return res.status(400).json({ success: false, message: "Missing agentID" });
    }

    // Step 1: Generate prompt
    const prompt = await promptGenerator(agentID);
    
    // Step 2: Generate avatar
    const avatar = await avatarGenerator(prompt);
    
    // Step 3: Store avatar and get URL
    const avatarURL = await storeAvatar(agentID, avatar);
    
    // Step 4: Store URL in Firebase
    await db.ref(`Judge-Agent/${agentID}/avatar`).set(avatarURL);
    
    return res.status(200).json({ success: true, agentID, url: avatarURL });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}



