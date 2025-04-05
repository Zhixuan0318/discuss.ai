import 'dotenv/config';
import db from '../config.js';

const USDC_CONTRACT_ADDRESSES = {
  "UNI-SEPOLIA": "0x31d0220469e10c4E71834a79b1f276d740d3768F",
  "ETH-SEPOLIA": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  "ARB-SEPOLIA": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  "MATIC-AMOY": "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
  "AVAX-FUJI": "0x5425890298aed601595a70ab815c96711a31bc65"
};

const CIRCLE_API_URL = "https://api.circle.com/v1/w3s/wallets";
const CIRCLE_API_KEY = process.env.TEST_API_KEY;
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Use GET request.' });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  try {
    const { walletID } = req.query;

    if (!walletID) {
      return res.status(400).json({ success: false, message: 'Missing walletID parameter' });
    }

    const poolRef = db.ref(`Pools/${walletID}`);
    const snapshot = await poolRef.once("value");
    const pool = snapshot.val();

    if (!pool) {
      return res.status(404).json({ success: false, message: "Pool not found. A correct wallet ID is needed." });
    }

    const { blockchain, poolAmount } = pool;
    const contractAddress = USDC_CONTRACT_ADDRESSES[blockchain];

    if (!contractAddress) {
      return res.status(400).json({ success: false, message: "Unsupported blockchain." });
    }

    // Fetch wallet balances from Circle API
    const response = await fetch(`${CIRCLE_API_URL}/${walletID}/balances`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CIRCLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch from Circle API. Response status:", response.status);
      return res.status(500).json({ success: false, message: "Failed to fetch wallet balance from Circle API" });
    }

    const data = await response.json();
    console.log("Circle API Response:", JSON.stringify(data, null, 2));
    
    const tokenBalances = data.data?.tokenBalances || [];

    // Find USDC balance
    const usdcBalance = tokenBalances.find(token => token.token.tokenAddress && token.token.tokenAddress.toLowerCase() === contractAddress.toLowerCase());

    if (!usdcBalance) {
      return res.status(500).json({ success: false, message: "USDC balance not found for this wallet." });
    }

    const balance = parseFloat(usdcBalance.amount); // Convert balance from string to float

    if (balance == poolAmount) {

      console.log("The pool is fully funded.");
      return res.status(200).json({ success: true, message: "The pool is fully funded." });

    } else if (balance > poolAmount) {

      console.log(`The pool is overfunded. Pool amount increased to ${balance} USDC!`);
      await poolRef.update({ poolAmount: balance });
      return res.status(200).json({
        success: true,
        message: `The pool is overfunded. Pool amount increased to ${balance} USDC!`
      });

    } else {

      console.log("The pool is not yet fully funded.");
      return res.status(200).json({ success: false, message: "The pool is not yet fully funded." });

    }
  } catch (error) {
    console.error("Error checking pool funding status:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}
