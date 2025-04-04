/**
 * Fetch agent details from the API using the provided agent ID.
 * @param {string} agentID - The unique identifier of the agent.
 * @returns {Promise<Object>} - The JSON response containing agent details.
 */
export async function agentFetcher(agentID) {
    const apiUrl = `https://judge-agent.vercel.app/api/fetch-agent?agentID=${encodeURIComponent(agentID)}&returnCampaignID=true`;
  
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch agent data: ${response.status} ${response.statusText}`);
    }
  
    return await response.json();
  }
  