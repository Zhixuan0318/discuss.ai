import "dotenv/config";
import rewardBadge from "../utils/rewardBadge.js";
import db from "../config.js";

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

    // Handle preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed. Please use POST." });
    }

    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid API key" });
    }

    try {
        const { campaignID } = req.body;
        if (!campaignID) {
            return res.status(400).json({ success: false, message: "Missing campaignID in request body." });
        }

        // Fetch campaign winner details from Firebase
        const snapshot = await db.ref(`Campaigns/${campaignID}/winner`).once("value");
        const winnerData = snapshot.val();

        if (winnerData && winnerData.submitViaWorld) {
            const worldAddress = winnerData?.worldAddress;
            if (!worldAddress) {
                return res.status(400).json({ success: false, message: "Missing worldAddress in database entry." });
            }

            // Call rewardBadge with worldAddress
            const txHash = await rewardBadge(worldAddress);
            return res.status(200).json({ 
                success: true, 
                message: `Badge rewarded to winner on World Sepolia. tx hash: ${txHash}` 
            });
        }
        
        return res.status(200).json({ success: true, message: "It is not submitted from World Mini App, flow completed." });
    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
