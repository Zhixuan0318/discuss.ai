import { OpenAIEmbeddings } from "@langchain/openai";
import { RedisVectorStore } from "@langchain/redis";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!redisUrl) throw new Error("REDIS_URL is not set in environment variables.");
if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not set in environment variables.");

let redisClient;

/**
 * Initializes and returns a Redis client (singleton pattern).
 */
async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: redisUrl });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
    console.log("Connected to Redis.");
  }
  return redisClient;
}

// DELETE Request Handler
export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed. Use DELETE." });
    }
  
    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.API_KEY}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }
  
    try {
      const { campaignID } = req.body;
      if (!campaignID) {
        return res.status(400).json({ error: "Invalid input. Please provide a campaignID." });
      }
  
      const client = await getRedisClient();
      const embeddings = new OpenAIEmbeddings({
        apiKey: openaiApiKey,
        model: "text-embedding-3-small",
      });
  
      const vectorStore = new RedisVectorStore(embeddings, {
        redisClient: client,
        indexName: campaignID,
      });
  
      await vectorStore.delete({ deleteAll: true });
  
      return res.status(200).json({
        success: true,
        message: `Successfully removed index for campaign: ${campaignID}`,
      });
  
    } catch (error) {
      console.error("Error removing campaign index:", error);
      return res.status(500).json({ error: "An error occurred while removing the campaign index." });
    }
  }