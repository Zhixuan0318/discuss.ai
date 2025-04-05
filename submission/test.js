import 'dotenv/config';
import { createSubmission } from './api/index.js';
import { addScore } from './utils/addScore.js';

const campaignID = "campaign_4a1e76c0-dab1-4c2b-9c85-8ae08f14f707";
const submissionURL = "https://medium.com/@prathamsk130/scraping-tweets-for-real-time-data-analysis-using-ntscraper-a875f6d030b9";
const participantWalletAddress = "0xa5cad5289f38c2992bb9ead1ae6f7cfa2911f723";
const preferredBlockchain = "ETH-SEPOLIA";

const response = await createSubmission(campaignID, submissionURL, participantWalletAddress, preferredBlockchain);

console.log(response);

const score = 12;
const add = await addScore(campaignID,participantWalletAddress,score);
console.log(add);