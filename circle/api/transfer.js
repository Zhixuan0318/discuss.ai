import 'dotenv/config';
import db from "../config.js";
import transfer from '../utils/complete-transfer.js';
// import { removeCampaignIndex } from '../utils/removeCampaignIndex.js';

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

    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid API key" });
    }

    const { campaignID } = req.body;
    if (!campaignID) {
        return res.status(400).json({ success: false, message: "campaignID is required" });
    }

    try {
        const startTime = Date.now(); // Start execution time tracking

        // Execute transfer function
        const txHash = await transfer(campaignID);

        // Calculate execution duration
        const endTime = Date.now();
        const duration = endTime - startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        const formattedDuration = `${String(minutes).padStart(2, '0')} minutes ${String(seconds).padStart(2, '0')} seconds`;

        // Update Firebase
        const campaignRef = db.ref(`Campaigns/${campaignID}`);
        await campaignRef.update({
            "isRevealed": true,
            "isRanking": false,
            "winner/txHash": txHash,
            "winner/transferExecutionDuration": formattedDuration
        });

        // await removeCampaignIndex(campaignID);

        return res.status(200).json({ success: true, txHash, transferExecutionDuration: formattedDuration });
    } catch (error) {
        console.error("Transfer API failed:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
