import db from "../config.js";

/**
 * Sends a judging request to the external judging API and retrieves the score.
 * @param {string} campaignID - The ID of the campaign.
 * @param {string} submissionURL - The URL of the submission.
 * @param {number} numberOfQueries - The number of queries for judging.
 * @returns {Promise<number>} - A promise resolving to the score returned by the judging API.
 */
export async function judgingTask(campaignID, submissionURL, numberOfQueries) {
    if (!campaignID || !submissionURL || !numberOfQueries) {
        throw new Error("All fields are required");
    }

    try {
        // Fetch agentID from Campaigns/{campaignID}/agentID
        const campaignRef = db.ref(`Campaigns/${campaignID}/agentID`);
        const snapshot = await campaignRef.once("value");
        
        if (!snapshot.exists()) {
            throw new Error("Campaign ID does not exist or agentID not found");
        }

        const agentID = snapshot.val();

        // Prepare request body
        const requestBody = {
            agentID,
            submissionURL,
            numberOfQueries
        };

        // Call judging API
        const response = await fetch("https://judging-task.vercel.app/api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.AUTH_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error("Failed to obtain score from judging-task API");
        }

        const score = await response.text();
        return parseInt(score, 10);
        
    } catch (error) {
        throw new Error(error.message);
    }
}
