import "dotenv/config";
import { ethers } from "ethers";
import db from "../config.js";

// Constants
const PUBLIC_RESOLVER_ADDRESS = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";

const PUBLIC_RESOLVER_ABI = [
    "function multicall(bytes[] calldata data) external returns (bytes[] memory results)",
    "function setText(bytes32 node, string key, string value) external",
    "function setAddr(bytes32 node, uint256 coinType, bytes a) external"
];

export default async function setRecord(agentID) {
    try {
        // Load wallet and provider
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.WALLET, provider);
        const resolver = new ethers.Contract(PUBLIC_RESOLVER_ADDRESS, PUBLIC_RESOLVER_ABI, wallet);
        const iface = new ethers.Interface(PUBLIC_RESOLVER_ABI);

        // Fetch agent details
        const agentSnapshot = await db.ref(`Judge-Agent/${agentID}`).once("value");
        const agentData = agentSnapshot.val();
        if (!agentData) throw new Error("Agent data not found");

        const { avatar, light_lore, name, campaign_id, ens } = agentData;
        if (!ens?.node) throw new Error("ENS node not found for agent");
        const node = ens.node; // Ensure this is bytes32 format

        // Fetch campaign pool address
        const campaignSnapshot = await db.ref(`Campaigns/${campaign_id}/poolAddress`).once("value");
        const poolAddress = campaignSnapshot.val();
        if (!poolAddress) throw new Error("Campaign pool address not found");

        // Ensure nodehash is passed correctly
        const calls = [
            iface.encodeFunctionData("setText", [node, "description", light_lore]),
            iface.encodeFunctionData("setText", [node, "avatar", avatar]),
            iface.encodeFunctionData("setText", [node, "name", name]),
            iface.encodeFunctionData("setAddr", [node, 60, poolAddress])
        ];

        // Execute multicall transaction
        console.log("Sending multicall transaction...");
        const tx = await resolver.multicall(calls); 
        await tx.wait();  // Wait for confirmation

        console.log("✅ ENS records updated successfully in one transaction!");
        console.log("Transaction confirmed. Hash:", tx.hash);
        
    } catch (error) {
        console.error("❌ Error updating ENS records:", error);
    }
}