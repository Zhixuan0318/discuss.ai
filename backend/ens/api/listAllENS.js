// for testing use only, not for production purpose

import "dotenv/config";
import listSubdomains from "../utils/listSubdomains.js";

export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    if (req.method !== "GET") {
      return res.status(405).json({ success: false, message: "Method Not Allowed. Please use GET." });
    }
  
    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }
  
    try {
      // Call listSubdomains
      const result = await listSubdomains();
  
      // Return the response
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
  }