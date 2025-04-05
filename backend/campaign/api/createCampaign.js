import db from "../config.js";
import convertAgentIdToCampaignId from "../utils/agentID-to-campaignID.js";
import registerHost from "../utils/registerHost.js";

const AUTH_KEY = process.env.AUTH_KEY;

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
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {

        return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    } 

    try {
        const { name, agentID, hostWalletAddress, walletID } = req.body;

        if (!name || !agentID || !hostWalletAddress || !walletID) {
            throw new Error("Missing required parameters");
        }

        // Check if agentID exists in Judge-Agent collection
        const agentRef = db.ref(`Judge-Agent/${agentID}`);
        const agentSnapshot = await agentRef.get();

        if (!agentSnapshot.exists()) {
            throw new Error("Agent ID not found in Judge-Agent collection. Make sure you had created one!");
        }

        // Convert agentID to campaignID
        const campaignID = convertAgentIdToCampaignId(agentID);

        // Define constants
        const submissionNumber = 0;
        const mode = "single-winner";

        // Fetch blockchain and poolAmount from Pools collection
        const poolRef = db.ref(`Pools/${walletID}`);
        const poolSnapshot = await poolRef.get();

        if (!poolSnapshot.exists()) {
            throw new Error("Wallet ID not found in Pools collection");
        }

        const { blockchain, poolAmount, walletAddress } = poolSnapshot.val();

        const poolAddress = walletAddress;

        // Reference Campaigns collection
        const campaignsRef = db.ref("Campaigns");
        const campaignRef = campaignsRef.child(campaignID);

        const timestamp = new Date().toISOString();

        // Check if Campaigns collection exists, if not, create it
        await campaignRef.set({
            name,
            agentID,
            submissionNumber,
            hostWalletAddress,
            blockchain,
            poolAmount,
            mode,
            walletID,
            poolAddress,
            timestamp,
            isRevealed: false,
            isRanking: false
        });

        // Call registerHost API
        await registerHost(hostWalletAddress, campaignID);

        // Return campaign data
        return res.status(200).json({
            success: true,
            campaignID,
            data: {
                name,
                agentID,
                submissionNumber,
                hostWalletAddress,
                blockchain,
                poolAmount,
                mode,
                walletID,
                poolAddress,
                timestamp
            }
        });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
}