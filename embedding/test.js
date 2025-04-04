import 'dotenv/config';
import { webLoader } from "./utils/web-loader.js";
import { splitDocuments } from "./utils/text-splitter.js";
import { embedDocuments } from "./utils/embedder.js";

async function main() {

  // Define an array of URLs
  const urls = [
    "https://bitfinexed.medium.com/circle-usdc-be-better-than-tether-dont-talk-about-transparency-show-transparency-63c37b6614a3",
  ];

  const documents = [];

  // Load documents one by one
  for (const url of urls) {
    console.log(`Fetching ${url} ...`);
    const doc = await webLoader(url);
    if (doc) {
      documents.push(doc);
    }
  }

  console.log(`Fetched ${documents.length} documents.`);

  // Split the documents into chunks
  const splitDocs = await splitDocuments(documents);

  // Hardcoded campaign id
  const campaignId = "te123st";

  // Pass the split documents and campaign id to the embedder
  await embedDocuments(splitDocs, campaignId);
  console.log("Embedding completed for campaign:", campaignId);
  
}

main().catch(console.error);

