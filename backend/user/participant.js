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

    await db.ref(`Users/${walletAddress}/participate/${campaignID}`).set(true);

    return res.status(200).json({
      message: `User with wallet ${walletAddress} participate ${campaignID} successfully!`,
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to add user as participant of the campaign: ${error.message}` });
  }
}
