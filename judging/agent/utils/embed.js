export async function embed(urls, campaignId) {
    const API_URL = "https://llm-embedder.vercel.app/api"; // Adjust the API endpoint if needed
    const API_KEY = process.env.API_KEY;
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ urls, campaignId }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to embed documents");
      }
    } catch (error) {
      console.error("Embedding failed:", error);
    }
  }
