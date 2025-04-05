export async function registerParticipant(walletAddress, campaignID) {

    const API_URL = "https://llm-user.vercel.app/api/participant";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.AUTH_KEY}`
            },
            body: JSON.stringify({ walletAddress, campaignID })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Failed to register participant");
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}
