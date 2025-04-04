import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { agentFetcher } from './utils/agentFetcher.js';
import { planner } from './utils/planner.js';
import promptTemplate from './promptTemplate.js';
import { webLoader } from './web-loader.js';
import { totalScoreCalc } from './totalScoreCalc.js';

// Initialize the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialize the ChatOpenAI model
const model = new ChatOpenAI({
  apiKey: openaiApiKey,
  model: 'gpt-3.5-turbo',
  temperature: 1.0,
});

// Define the schema for the expected output
const scoreSchema = z.object({
  criteria: z.string().describe("The name of the scoring criterion"),
  score: z.string().describe("The assigned score in X/Y format, where X is the score of that criterion and Y is the weightage of that criterion. e.g., 4/10"),
});

const judgingSchema = z.object({
    scores: z
      .array(scoreSchema)
      .describe("An array of individual scores for each scoring criterion"),
});
  
  // Create a structured LLM with the defined schema
const structuredLlm = model.withStructuredOutput(judgingSchema, {
    method: 'json_mode',
    name: 'judgingSchema',
    strict: true,
});


export default async function judge(agentID, submissionURL, numberOfQueries) {
  try {
    // Fetch agent data
    const agentData = await agentFetcher(agentID);
    if (!agentData) throw new Error("Agent data could not be retrieved by judge.js/agentFetcher.");

    // Extract necessary fields
    const name = agentData.name;
    const expectation = agentData.expectation;
    const rules = agentData.rules;
    const scoring = agentData.scoring;

    //Prepare planner API required body
    const numberofQueries = numberOfQueries;
    const campaignId = agentData.campaign_id;

    //Get relevant documents for judging
    const references = await planner(submissionURL, numberofQueries, campaignId);
    if (!references || references.length === 0) throw new Error("No reference documents fetch by judge.js/planner.");

    //Get submission markdown content
    const submission = await webLoader(submissionURL);
    if (!submission) throw new Error("Submission content could not be retrieved by judge.js/webLoader.");

    const prompt = await promptTemplate.format({
      name,
      expectation,
      rules,
      scoring,
      references,
      submission
    });

    const response = await structuredLlm.invoke(prompt);
    
    const totalScore = totalScoreCalc(response.scores);

    return totalScore;
    

  } catch (error) {
    console.error(`Error in judge.js function: ${error.message}`);
    throw error;
  }
}