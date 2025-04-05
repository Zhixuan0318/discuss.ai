import 'dotenv/config';
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
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {

      return res.status(401).json({ error: "Unauthorized: Invalid API key" });

    }
  
    try {
      const { walletAddress, campaignID } = req.body;
  
      if (!walletAddress || !campaignID) {
        return res.status(400).json({ error: "walletAddress and campaignID are required" });
      }
  
      const userRef = db.ref(`Users/${walletAddress}`);
      const snapshot = await userRef.once("value");
  
      if (!snapshot.exists()) {
        console.log(`${walletAddress} is eligible to submit.`);
        return res.status(200).json({ status: "ELIGIBLE-TO-SUBMIT" });
      }
  
      const userData = snapshot.val();
      
      if (userData.host && userData.host[campaignID]) {
        console.log(`${walletAddress} is a host.`);
        return res.status(200).json({ status: "HOST" });
      }
      
      if (userData.participate && userData.participate[campaignID]) {
        console.log(`${walletAddress} is a participant.`);
        return res.status(200).json({ status: "PARTICIPANT" });
      }
      
      console.log(`${walletAddress} is eligible to submit.`);
      return res.status(200).json({ status: "ELIGIBLE-TO-SUBMIT" });
  
    } catch (error) {
      return res.status(500).json({ error: `Failed to check status: ${error.message}` });
    }
}