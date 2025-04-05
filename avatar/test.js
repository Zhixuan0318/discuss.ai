import 'dotenv/config';
// import avatarGenerator from './utils/avatarGenerator.js';
// import storeAvatar from './utils/storeAvatar.js';

// const prompt = `A midday closeup photo of a fantasy goddess, emerald-green hair, golden laurel crown, glowing green eyes.  
// In front of an enchanted forest, with sharp focus on misty ancient trees and ethereal golden light filtering through leaves.  
// Candid cell-phone photography, highlighting the beauty of imperfections.  
// f/1.4 wide aperture. centered subject. high dynamic range. auto white-balance. saturated true-color. sharp background. ::3  
// blur ::-2 Painting, artistic, bokeh with beautiful ambience ::-1  
// centered, with powerful composition and color ::1 --style raw`;
// const agentID = "example-agent-313";

// const avatar = await avatarGenerator(prompt);
// const url = await storeAvatar(agentID, avatar);

// console.log(url);
import promptGenerator from './utils/promptGenerator.js';

const response = await promptGenerator("agent_4a1e76c0-dab1-4c2b-9c85-8ae08f14f707");

console.log(response);