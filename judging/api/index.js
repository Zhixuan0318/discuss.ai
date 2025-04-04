import 'dotenv/config';
import judge from '../judge.js';

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed. Use POST instead.' });
    }

    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        
        return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }
  
    try {
      const { agentID, submissionURL, numberOfQueries } = req.body;
  
      if (!agentID || !submissionURL || !numberOfQueries) {
        return res.status(400).json({ error: 'Missing required parameters: agentID, submissionURL, numberOfQueries' });
      }
  
      const result = await judge(agentID, submissionURL, numberOfQueries);
      return res.status(200).json(result);
  
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
}