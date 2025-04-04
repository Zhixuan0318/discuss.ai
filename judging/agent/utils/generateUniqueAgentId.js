import { v4 as uuidv4 } from "uuid";
import db from "../config.js";

async function ensureJudgeAgentCollection() {
    const snapshot = await db.ref("Judge-Agent").once("value");
  
    if (!snapshot.exists()) {
      await db.ref("Judge-Agent").set({ _initialized: true }); // Add a placeholder key
      console.log("✅ 'Judge-Agent' collection initialized in Firebase.");
    }
}

async function generateUniqueAgentId() {
  await ensureJudgeAgentCollection(); // Ensure main collection exists

  let agentId;
  let exists = true;

  while (exists) {
    agentId = `agent_${uuidv4()}`; // Prefix for clarity

    const snapshot = await db.ref(`Judge-Agent/${agentId}`).once("value");
    exists = snapshot.exists();
  }

  return agentId;
}

export default generateUniqueAgentId;
