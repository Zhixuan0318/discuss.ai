function convertAgentIdToCampaignId(agentId) {
    if (!agentId.startsWith("agent_")) {
      throw new Error("Invalid agent ID format. Expected 'agent_<uuid>'.");
    }
  
    return agentId.replace("agent_", "campaign_");
  }
  
  export default convertAgentIdToCampaignId;
  