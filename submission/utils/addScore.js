import db from "../config.js";

/**
 * Adds a score to a submission and marks it as judged.
 * @param {string} campaignID - The ID of the campaign.
 * @param {string} participantWalletAddress - The participant's wallet address.
 * @param {number} score - The score to be added.
 * @returns {Promise<Object>} - A promise resolving to the result of the operation.
 */
export async function addScore(campaignID, participantWalletAddress, score) {
    if (!campaignID || !participantWalletAddress || score === undefined) {
        throw new Error("All fields are required");
    }

    try {
        const submissionRef = db.ref(`Submissions/${campaignID}/${participantWalletAddress}`);
        const snapshot = await submissionRef.once("value");

        if (!snapshot.exists()) {
            throw new Error("Submission does not exist");
        }

        // Update the submission with the score and set judged to true
        await submissionRef.update({
            score,
            judged: true
        });

        return { success: true, message: "Score added successfully. Marked as judged." };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
