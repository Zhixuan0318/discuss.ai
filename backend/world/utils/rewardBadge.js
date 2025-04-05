import "dotenv/config";
import { ethers } from "ethers";

const NFT_CONTRACT_ADDRESS = "0x58a8Dc49771EbD9E49D93607efe7435F5BFaafaD";
const RPC_URL = "https://worldchain-sepolia.g.alchemy.com/public";
const ABI = [
    "function mint(address recipient) external"
];

export default async function rewardBadge(worldAddress) {
    if (!ethers.isAddress(worldAddress)) {
        throw new Error("Invalid recipient address");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.WALLET, provider);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, wallet);

    try {
        const tx = await contract.mint(worldAddress);
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        throw new Error(`Transaction failed: ${error.message}`);
    }
}
