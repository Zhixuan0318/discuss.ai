import 'dotenv/config';
import db from "../config.js";
import { judgingTask } from "../utils/judgingTask.js";
import { addScore } from "../utils/addScore.js";
import { registerParticipant } from '../utils/registerParticipant.js';

const SUPPORTED_BLOCKCHAINS = [
    "ETH-SEPOLIA", "MATIC-AMOY", "ARB-SEPOLIA", "UNI-SEPOLIA", "AVAX-FUJI"
];

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
        
        return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    const { campaignID, submissionURL, participantWalletAddress, preferredBlockchain } = req.body;

    if (!campaignID || !submissionURL || !participantWalletAddress || !preferredBlockchain) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!SUPPORTED_BLOCKCHAINS.includes(preferredBlockchain)) {
        return res.status(400).json({ success: false, message: "Invalid preferred blockchain" });
    }

    try {
        const campaignRef = db.ref(`Campaigns/${campaignID}`);
        const snapshot = await campaignRef.once("value");
        
        if (!snapshot.exists()) {
            return res.status(404).json({ success: false, message: "Campaign ID does not exist" });
        }

        const submissionRef = db.ref(`Submissions/${campaignID}/${participantWalletAddress}`);
        const submissionData = {
            judged: false,
            submissionURL,
            preferredBlockchain,
            timestamp: new Date().toISOString()
        };

        await submissionRef.set(submissionData);

        const submissionCountRef = db.ref(`Campaigns/${campaignID}/submissionNumber`);
        await submissionCountRef.transaction(currentCount => (currentCount || 0) + 1);

        const score = await judgingTask(campaignID, submissionURL, 3);

        await addScore(campaignID, participantWalletAddress, score);

        await registerParticipant(participantWalletAddress, campaignID);

        return res.status(200).json({ success: true, message: "Submission created, judged, and score stored successfully! Wallet address had registered as participant successfully!" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
