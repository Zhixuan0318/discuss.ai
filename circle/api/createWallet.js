import 'dotenv/config';
import db from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import { cipher } from '../utils/cipher.js';
import fundNative from '../utils/fundNative.js';

const SUPPORTED_BLOCKCHAINS = [
  "ETH-SEPOLIA", "MATIC-AMOY", "ARB-SEPOLIA", "UNI-SEPOLIA", "AVAX-FUJI"
];

const PROXY_WALLET_ID = {
  "UNI-SEPOLIA": "2c4b3e2f-54ed-5117-985a-567bf60408e0",
  "ETH-SEPOLIA": "5b0832a2-057d-5712-9236-6b1a09c6bcff",
  "ARB-SEPOLIA": "7c648c03-ba75-5dbe-88cb-7729d6e6f428",
  "MATIC-AMOY": "2d0ea721-b8c6-5cfa-ac7e-2efbc02983bb",
  "AVAX-FUJI": "0411011b-74d2-57bd-8d94-c910a7dda475"
};

const AUTH_KEY = process.env.AUTH_KEY;

// API handler function for Vercel
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
    const { blockchain, poolAmount } = req.body;

    if (!SUPPORTED_BLOCKCHAINS.includes(blockchain)) {
      return res.status(400).json({ success: false, message: `Unsupported blockchain: ${blockchain} or no fully uppercase` });
    }

    const entitySecretCiphertext = await cipher();
    const idempotencyKey = uuidv4();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_API_KEY}`
      },
      body: JSON.stringify({
        idempotencyKey,
        blockchains: [blockchain],
        accountType: "EOA",
        count: 1,
        entitySecretCiphertext,
        walletSetId: process.env.WALLET_SET_ID,
      }),
    };

    const response = await fetch('https://api.circle.com/v1/w3s/developer/wallets', options);
    const responseData = await response.json();

    if (!responseData.data || !responseData.data.wallets || responseData.data.wallets.length === 0) {
      return res.status(500).json({ success: false, message: "Failed to create wallet" });
    }

    const wallet = responseData.data.wallets[0];
    const { id: walletID, address: walletAddress } = wallet;

    // Fund it with native token
    const proxyWalletID = PROXY_WALLET_ID[blockchain];
    await fundNative(proxyWalletID, blockchain, walletAddress);

    const poolsRef = db.ref("Pools");
    const walletRef = poolsRef.child(walletID);

    await walletRef.set({ walletAddress, poolAmount, blockchain });

    return res.status(200).json({
      success: true,
      message: `A ${poolAmount} USDC pool is created successfully on ${blockchain}!`,
      walletAddress,
      walletID,
      poolAmount,
      blockchain,
    });

  } catch (error) {
    console.error("Error creating wallet:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}
