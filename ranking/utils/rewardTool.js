import 'dotenv/config';
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const rewardTool = tool(
  async ({ campaignID }) => {
    const response = await fetch("https://llm-circle.vercel.app/api/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaignID }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Reward transfer failed: ${data.message || "Unknown error"}`);
    }
    console.log("Agent called Reward Tool. Reward executed successfully!");

    return "Reward transfer successful! The winner had received the reward.";
  },
  {
    name: "transfer_rewards",
    description: "Transfers all USDC rewards from the campaign's pool to the winner you determined after ranking.",
    schema: z.object({
      campaignID: z.string().describe("The unique ID of the campaign whose rewards need to be transferred."),
    }),
  }
);

export default rewardTool;
