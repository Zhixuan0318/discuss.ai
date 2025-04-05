import "dotenv/config";
import db from "../config.js";

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

    // Handle preflight requests
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
        const { campaignID, participantWalletAddress, worldAddress } = req.body;

        if (!campaignID || !participantWalletAddress || !worldAddress) {
            return res.status(400).json({ success: false, message: "Missing campaignID, participantWalletAddress, or worldAddress" });
        }

        // Write to Firebase Realtime Database
        await db.ref(`Submissions/${campaignID}/${participantWalletAddress}`).update({
            submitViaWorld: true,
            worldAddress: worldAddress
        });

        return res.status(200).json({
            success: true,
            message: `Marked ${participantWalletAddress} submission as World Mini App submission.`
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}
