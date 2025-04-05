import db from "../config.js";
import { basicTransfer } from "./basicTransfer.js";
import v1cctp from "./v1cctp.js";
import v2cctp from "./v2cctp.js";
import v2cctpWithHook from "./v2cctpWithHook.js";
import fetchTxHash from "./fetchTxHash.js";


const PROXY_WALLET_ID = {
    "UNI-SEPOLIA": "2c4b3e2f-54ed-5117-985a-567bf60408e0",
    "ETH-SEPOLIA": "5b0832a2-057d-5712-9236-6b1a09c6bcff",
    "ARB-SEPOLIA": "7c648c03-ba75-5dbe-88cb-7729d6e6f428",
    "MATIC-AMOY": "2d0ea721-b8c6-5cfa-ac7e-2efbc02983bb",
    "AVAX-FUJI": "0411011b-74d2-57bd-8d94-c910a7dda475"
};

export default async function transfer(campaignID) {
    try {
        // Fetch campaign blockchain info
        const campaignRef = db.ref(`Campaigns/${campaignID}`);
        const campaignSnapshot = await campaignRef.get();
        if (!campaignSnapshot.exists()) {
            throw new Error(`Campaign ${campaignID} not found.`);
        }

        const campaignData = campaignSnapshot.val();
        const campaignBlockchain = campaignData.blockchain;
        const poolWalletID = campaignData.walletID;
        const winnerBlockchain = campaignData.winner.preferredBlockchain;
        const winnerWalletAddress = campaignData.winner.walletAddress;
        const poolAmount = String(campaignData.poolAmount);
        const amount = [poolAmount];

        let transactionHash;

        if (campaignBlockchain === winnerBlockchain) {
            console.log("Same blockchain detected. Initiating basicTransfer...");
            transactionHash = await basicTransfer(poolWalletID, campaignBlockchain, winnerWalletAddress, amount);
        } else {
            console.log("Different blockchains detected. Selecting appropriate CCTP transfer...");
            const proxyWalletID = PROXY_WALLET_ID[winnerBlockchain];

            if (campaignBlockchain === "ETH-SEPOLIA" && winnerBlockchain === "AVAX-FUJI") {

                console.log("Using v2cctp for ETH-SEPOLIA -> AVAX-FUJI transfer...");
                const txID = await v2cctp(campaignBlockchain, poolWalletID, winnerBlockchain, proxyWalletID, winnerWalletAddress, amount);
                transactionHash = await fetchTxHash(txID);

            } else if(campaignBlockchain === "AVAX-FUJI" && winnerBlockchain === "ETH-SEPOLIA"){

                console.log("Using v2cctp with hook for AVAX-FUJI -> ETH-SEPOLIA transfer...");
                const txID = await v2cctpWithHook(campaignBlockchain, poolWalletID, winnerBlockchain, proxyWalletID, winnerWalletAddress, amount);
                transactionHash = await fetchTxHash(txID);

            }else {

                console.log("Using v1cctp for cross-chain transfer...");
                const txID = await v1cctp(campaignBlockchain, poolWalletID, winnerBlockchain, proxyWalletID, winnerWalletAddress, amount);
                transactionHash = await fetchTxHash(txID);
                
            }
        }

        return transactionHash;

    } catch (error) {
        console.error("Transfer process failed:", error);
        throw error;
    }
}
