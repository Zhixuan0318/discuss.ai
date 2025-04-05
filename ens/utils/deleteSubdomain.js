import "dotenv/config";
import { ethers } from "ethers";

const NAME_WRAPPER_ADDRESS = "0x0635513f179D50A207757E05759CbD106d7dFcE8";
const NAME_WRAPPER_ABI = [
    "function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) external"
];

export default async function deleteSubdomain(node) {
    try {
        // Load wallet and provider
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.WALLET, provider);

        // Connect to contract
        const nameWrapper = new ethers.Contract(NAME_WRAPPER_ADDRESS, NAME_WRAPPER_ABI, wallet);

        console.log(`Deleting subdomain with node: ${node}`);

        // Call setRecord to clear ownership and resolver
        const tx = await nameWrapper.setRecord(
            node, 
            "0x0000000000000000000000000000000000000000", // owner
            "0x0000000000000000000000000000000000000000", // resolver
            0 // ttl
        );

        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Subdomain deleted successfully.`);

        return "Subdomain deleted successfully.";
    } catch (error) {
        console.error("Error deleting subdomain:", error);
        throw error;
    }
}
