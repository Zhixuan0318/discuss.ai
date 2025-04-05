import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

// Initialize the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialize the ChatOpenAI model
const model = new ChatOpenAI({
  apiKey: openaiApiKey,
  model: 'gpt-3.5-turbo',
  temperature: 0,
});

// Define the schema for the expected output
const querySchema = z.object({
  queries: z.array(z.string()).describe('A list of search queries based on the markdown blog post content'),
});

// Create a structured LLM with the defined schema
const structuredLlm = model.withStructuredOutput(querySchema, {
  method: 'json_mode',
  name: 'querySchema',
  strict: true,
});

/**
 * Generates the system prompt based on the number of queries.
 * @param {number} numberOfQueries - The desired number of queries to generate.
 * @returns {string} - The generated system prompt.
 */
function generateSystemPrompt(numberOfQueries) {
    return `
  You are an intelligent planner agent specializing in query generation for information retrieval. Your task is to read a markdown blog post and generate only ${numberOfQueries} structured, retrieval-optimized queries. These queries will be embedded using OpenAI's text-embedding-3-small and used to retrieve relevant documents from a Redis vector database via similarity search.
  
  **STRICT REQUIREMENT:** You must generate exactly ${numberOfQueries} querie(s). Not more, not less.

  Guidelines for Query Generation:
  - Goal: The retrieved documents must provide useful context for a judging agent to analyze the blog post accurately, minimizing assumptions and guesswork.
  - Query Diversity: Ensure the ${numberOfQueries} queries target key claims, supporting evidence, definitions, and counterarguments.
  - Levels of Granularity: Include both broad and specific queries, covering overarching themes, critical details, and alternative perspectives.
  - Avoid Redundancy: Do not generate duplicate or overly generic queries. Each query should contribute unique value to retrieval.
  - Output Format: Return the ${numberOfQueries} queries in valid JSON format under the "queries" key.
  `;
  }

/**
 * Generates queries based on the provided markdown content.
 * @param {string} markdownContent - The markdown content to analyze.
 * @param {number} numberOfQueries - The number of queries to generate.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the generated queries.
 */
export async function generateQueries(markdownContent, numberOfQueries) {
    const systemPrompt = generateSystemPrompt(numberOfQueries);
    const userPrompt = `Here is a markdown content:\n\n${markdownContent}\n\nGenerate the necessary queries.`;
  
    const response = await structuredLlm.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  
    return response; // The response is already parsed into the defined schema
  }