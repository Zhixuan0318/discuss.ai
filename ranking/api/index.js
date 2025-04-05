import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import rankTool from "../utils/rankTool.js";
import rewardTool from "../utils/rewardTool.js";
import prompt from '../utils/promptTemplate.js';
import db from '../config.js';

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
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const { campaignID } = req.body;
        if (!campaignID) {
            return res.status(400).json({ success: false, message: "Missing campaignID" });
        }

        await db.ref(`Campaigns/${campaignID}`).update({ isRanking: true });

        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-3.5-turbo',
            temperature: 0,
        });

        const tools = [rankTool, rewardTool];
        const agent = createToolCallingAgent({ llm, tools, prompt });
        const agentExecutor = new AgentExecutor({ agent, tools });

        await agentExecutor.invoke({campaignID: campaignID});

        return res.status(200).json({
            success: true,
            message: `Ranker agent has completed the ranking and reward has been transferred to the winner of ${campaignID}`,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}