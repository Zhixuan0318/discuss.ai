import db from "../config.js";
import validateScoring from "../utils/validateScoring.js";
import isWeightageValid from "../utils/weightageChecker.js";
import validateReferences from "../utils/referencesValidator.js";
import generateUniqueAgentId from "../utils/generateUniqueAgentId.js";
import convertAgentIdToCampaignId from "../utils/agentID-to-campaignID.js";
import { embed } from "../utils/embed.js";

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
      return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  } 

  try {
    // Extract data from request body
    const { name, light_lore, expectation, rules, scoring, references } = req.body;

    // Validate input data
    if (!name || typeof name !== "string") {
      throw new Error("Invalid or missing 'name'.");
    }
    if (!light_lore || typeof light_lore !== "string") {
      throw new Error("Invalid or missing 'light_lore'.");
    }
    if (!expectation || typeof expectation !== "string") {
      throw new Error("Invalid or missing 'expectation'.");
    }
    if (!rules || typeof rules !== "string") {
      throw new Error("Invalid or missing 'rules'.");
    }

    validateScoring(scoring);  // Validate scoring criteria
    isWeightageValid(scoring); // Ensure weightage sums to 100%
    validateReferences(references); // Validate references array

    // Generate unique Agent ID
    const agentID = await generateUniqueAgentId();

    // Generate Campaign ID based on Agent ID
    const campaignID = convertAgentIdToCampaignId(agentID);

    // Construct agent data
    const agentData = {
      name,
      light_lore,
      expectation,
      rules,
      scoring,
      references,
      campaign_id: campaignID
    };

    // Save to Firebase under "Judge-Agent/{agentID}"
    await db.ref(`Judge-Agent/${agentID}`).set(agentData);

    if (references.length > 0) {
    embed(references, campaignID).catch(error => {
      console.error(`Embedding failed for campaign ${campaignID}:`, error);
    });
    }

    return res.status(201).json({ message: "Agent created successfully!", agentID });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
