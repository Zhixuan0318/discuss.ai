// This api is for quick demo purpose. It is not built for production use.

import 'dotenv/config';

const WALLETS = {
    "UNI-SEPOLIA-PROXY": "2c4b3e2f-54ed-5117-985a-567bf60408e0",
    "ETH-SEPOLIA-PROXY": "5b0832a2-057d-5712-9236-6b1a09c6bcff",
    "ARB-SEPOLIA-PROXY": "7c648c03-ba75-5dbe-88cb-7729d6e6f428",
    "MATIC-AMOY-PROXY": "2d0ea721-b8c6-5cfa-ac7e-2efbc02983bb",
    "AVAX-FUJI-PROXY": "0411011b-74d2-57bd-8d94-c910a7dda475",
    "ETH-SEPOLIA-FUNDER": "3ac2642b-8c9e-53c3-ae0f-dc78d61fbce9",
    "AVAX-FUJI-FUNDER": "b1917580-5a23-5234-a928-c1fa7dc8f6f9"
};

const CIRCLE_API_URL = "https://api.circle.com/v1/w3s/wallets";
const CIRCLE_API_KEY = process.env.TEST_API_KEY;

const options = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${CIRCLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

export default async function checkProxyAndFunderBalances(req, res) {

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
  if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  try {
    const walletBalances = {};

    for (const [walletName, walletID] of Object.entries(WALLETS)) {
      const balanceResponse = await fetch(`${CIRCLE_API_URL}/${walletID}/balances`, options);
      if (!balanceResponse.ok) {
        console.error(`Failed to fetch balance for ${walletName}`);
        continue;
      }
      const balanceData = await balanceResponse.json();

      const walletResponse = await fetch(`${CIRCLE_API_URL}/${walletID}`, options);
      if (!walletResponse.ok) {
        console.error(`Failed to fetch wallet details for ${walletName}`);
        continue;
      }
      const walletData = await walletResponse.json();

      walletBalances[walletName] = {
        id: walletID,
        address: walletData.data?.wallet?.address || "",
        TOKENS: balanceData.data?.tokenBalances?.reduce((acc, token) => {
          const key = token.token.symbol.trim() || token.token.blockchain;
          acc[key] = parseFloat(token.amount);
          return acc;
        }, {})
      };      
    }

    return res.status(200).json(walletBalances);
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}


