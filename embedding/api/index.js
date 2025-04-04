import { webLoader } from "../utils/web-loader.js";     
import { splitDocuments } from "../utils/text-splitter.js"; 
import { embedDocuments } from "../utils/embedder.js";
import db from "../config.js";
import convertAgentIdToCampaignId from "../utils/agentID-to-campaignID.js";

const API_KEY = process.env.API_KEY;

// POST Request Handler
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  try {

    const { agentID } = req.body;
    if (!agentID) {
      return res.status(400).json({ error: "Invalid input. Please provide an agentID." });
    }

    // Retrieve URLs from Firebase Realtime Database
    const ref = db.ref(`Judge-Agent/${agentID}/references`);
    const snapshot = await ref.once("value");
    const urls = snapshot.val();

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(404).json({ error: "No references found for the provided agentID." });
    }

    // Convert agentID to campaignId
    const campaignId = await convertAgentIdToCampaignId(agentID);

    // Load documents sequentially
    const documents = [];
    for (const url of urls) {
      console.log(`Fetching: ${url}`);
      const doc = await webLoader(url);
      if (doc) {
        documents.push(doc);
      }
    }

    if (documents.length === 0) {
      return res.status(404).json({ error: "No documents could be loaded." });
    }

    // Split documents into smaller chunks
    const splitDocs = await splitDocuments(documents);

    // Embed the document chunks using the derived campaignId
    await embedDocuments(splitDocs, campaignId);

    return res.status(200).json({
      success: true,
      message: "Documents processed and embedded successfully!"
    });

  } catch (error) {
    console.error("Error in processing:", error);
    return res.status(500).json({ error: "An error occurred during embedding process." });
  }
}
