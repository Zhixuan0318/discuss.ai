import db from "../config.js";

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

    if (req.method !== "GET") {
        return res.status(405).json({ success: false, error: "Method Not Allowed" });
    }

    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
        return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    try {
        const { campaignID } = req.query;

        if (!campaignID) {
            throw new Error("Missing required parameter: campaignID");
        }

        // Reference the Campaigns collection
        const campaignRef = db.ref(`Campaigns/${campaignID}`);
        const campaignSnapshot = await campaignRef.get();

        if (!campaignSnapshot.exists()) {
            throw new Error("Campaign not found");
        }

        // Fetch campaign data
        const campaignData = campaignSnapshot.val();

        return res.status(200).json({
            success: true,
            campaignID,
            data: campaignData
        });

    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
}
