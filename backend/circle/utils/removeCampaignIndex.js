import { OpenAIEmbeddings } from "@langchain/openai";
import { RedisVectorStore } from "@langchain/redis";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!redisUrl) throw new Error("REDIS_URL is not set in environment variables.");
if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not set in environment variables.");

let redisClient;

/**
 * Initializes a Redis client (singleton pattern).
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

const embeddings = new OpenAIEmbeddings({
    apiKey: openaiApiKey,
    model: "text-embedding-3-small",
});

/**
 * Removes the vector index for a given campaign ID.
 * @param {string} campaignID - The campaign ID whose index should be removed.
 */
export async function removeCampaignIndex(campaignID) {
    if (!campaignID) {
        throw new Error("campaignID is required.");
    }

    try {
        const client = await getRedisClient();

        const vectorStore = new RedisVectorStore(embeddings, {
            redisClient: client,
            indexName: campaignID,
        });

        await vectorStore.delete({ deleteAll: true });

        console.log(`Successfully removed index for campaign: ${campaignID}`);
    } catch (error) {
        console.error(`Failed to remove campaign index: ${error.message}`);
        throw error;
    }
}
