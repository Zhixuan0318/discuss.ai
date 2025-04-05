// This api is for quick demo purpose. It is not built for production use.

import 'dotenv/config';
import { basicTransfer } from '../utils/basicTransfer.js';

const AUTH_KEY = process.env.AUTH_KEY;

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
      return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Please use POST.' });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  try {
    const { walletID, blockchain, destinationAddress, amounts } = req.body;
    
    if (!walletID || !blockchain || !destinationAddress || !amounts) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const transactionHash = await basicTransfer(walletID, blockchain, destinationAddress, amounts);
    
    return res.status(200).json({
      success: true,
      message: "Transfer successful.",
      transactionHash,
    });
  } catch (error) {
    console.error("Error processing transfer:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}
