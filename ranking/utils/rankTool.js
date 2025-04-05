import 'dotenv/config';
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const rankTool = tool(
  async ({ campaignID }) => {
    const response = await fetch(`https://llm-circle.vercel.app/api/start-ranking?campaignID=${campaignID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ranking failed: ${errorData.message || "Unknown error"}`);
    }
    console.log("Agent called Rank Tool. Ranking executed successfully!");

    return "Ranking completed successfully. The top submission has been selected as the winner.";
  },
  {
    name: "rank_submissions",
    description: "Ranks all submissions for a campaign and selects the highest-scoring one as the winner.",
    schema: z.object({
      campaignID: z.string().describe("The unique ID of the campaign whose submissions need to be ranked."),
    }),
  }
);

export default rankTool;
