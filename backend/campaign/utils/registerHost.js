export default async function registerHost(walletAddress, campaignID) {
    try {
        const response = await fetch("https://llm-user.vercel.app/api/host", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.AUTH_KEY}`
            },
            body: JSON.stringify({ walletAddress, campaignID })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Failed to register host");
        }

        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}
