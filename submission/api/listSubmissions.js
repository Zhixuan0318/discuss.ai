import 'dotenv/config';
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
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    // Authenticate request
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_KEY}`) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid API key" });
    }

    const { campaignID } = req.query;
    if (!campaignID) {
        return res.status(400).json({ success: false, message: "campaignID is required" });
    }

    try {
        const submissionsRef = db.ref(`Submissions/${campaignID}`);
        const snapshot = await submissionsRef.once("value");
        
        if (!snapshot.exists()) {
            return res.status(404).json({ success: false, message: "No submissions found for this campaign" });
        }

        const submissions = [];
        snapshot.forEach(childSnapshot => {
            submissions.push({
                walletAddress: childSnapshot.key,
                timestamp: childSnapshot.val().timestamp
            });
        });

        return res.status(200).json({ success: true, submissions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
