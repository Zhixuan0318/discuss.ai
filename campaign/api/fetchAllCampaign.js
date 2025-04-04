import db from "../config.js";

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
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
        return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    try {
        // Reference the Campaigns collection
        const campaignsRef = db.ref("Campaigns");
        const campaignsSnapshot = await campaignsRef.once("value");

        if (!campaignsSnapshot.exists()) {
            return res.status(404).json({ success: false, error: "No campaigns found" });
        }

        const campaignsData = campaignsSnapshot.val();

        // Convert object to array
        const campaignList = Object.entries(campaignsData).map(([campaignID, data]) => ({
            campaignID,
            campaignName: data.name,
            poolAmount: data.poolAmount,
            mode: data.mode,
            isRevealed: data.isRevealed,
            agentID: data.agentID,
            timestamp: data.timestamp ? new Date(data.timestamp).getTime() : 0, // Convert ISO to Unix timestamp
        }));

        // Fetch agent details for each campaign
        const agentPromises = campaignList.map(async (campaign) => {
            if (!campaign.agentID) {
                return { 
                    ...campaign, 
                    agentName: "Unknown", 
                    agentAvatar: null, 
                    agentENS: null 
                };
            }
        
            const agentRef = db.ref(`Judge-Agent/${campaign.agentID}`);
            const agentSnapshot = await agentRef.once("value");
            const agentData = agentSnapshot.val();

            return {
                ...campaign,
                agentName: agentData?.name || "Unknown",
                agentENS: agentData?.ens?.subdomain || null,
                agentAvatar: agentData?.avatar || null,
            };
        });

        const enrichedCampaigns = await Promise.all(agentPromises);

        // ✅ Sorting after fetching agent details
        const finalCampaigns = enrichedCampaigns
            .sort((a, b) => b.timestamp - a.timestamp) // Sort latest first
            .map(({ timestamp, ...rest }) => rest); // Remove timestamp

        return res.status(200).json({
            success: true,
            campaigns: finalCampaigns
        });

    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
}
