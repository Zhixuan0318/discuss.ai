import 'dotenv/config';
import { createCampaign } from './api/createCampaign.js';

const name = "Test Campaign";
const agentID = "agent_sample";
const hostWalletAddress = "test";
const walletID = "test";


const response = await createCampaign(name, agentID, hostWalletAddress, walletID);

console.log(response);