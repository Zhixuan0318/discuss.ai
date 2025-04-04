import { OpenAIEmbeddings } from "@langchain/openai";
import { RedisVectorStore } from "@langchain/redis";
import { createClient } from "redis";

// Retrieve environment variables (adjust as needed)

const redisUrl = process.env.REDIS_URL;

const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialize Redis client and connect

const redisClient = createClient({ url: redisUrl });
await redisClient.connect();

const embeddings = new OpenAIEmbeddings({
    apiKey: openaiApiKey,
    model: "text-embedding-3-small"
  });

/**
 * Embed document chunks and store them in the Redis vector store.
 *
 * @param {Array} chunks - Array of document objects (each with pageContent and metadata).
 * @param {string} campaignId - Unique campaign ID to tag documents.
 */
export async function embedDocuments(chunks, campaignId) {
    if (!campaignId) {
      throw new Error("campaignId is required");
    }

    // Create Redis Vector Store instance

    const id = campaignId;

    const vectorStore = new RedisVectorStore(embeddings, {
      redisClient: redisClient,
      indexName: id,
    });
  
    // Enhance each document with the campaign ID
    const docs = chunks.map(doc => ({
      ...doc,
      metadata: { ...doc.metadata, campaignId }
    }));
  
    try {
      // Embed documents and store them
      await vectorStore.addDocuments(docs, embeddings);
      console.log("Documents embedded and stored successfully");
  } catch (error) {
      console.error("Error embedding documents:", error);
      throw error;
  } 
  }