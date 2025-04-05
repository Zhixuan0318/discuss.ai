import "dotenv/config";
import { ethers } from "ethers";
import db from "../config.js";

// Constants
const PUBLIC_RESOLVER_ADDRESS = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";
const NAME_WRAPPER_ADDRESS = "0x0635513f179D50A207757E05759CbD106d7dFcE8";
const NAME_WRAPPER_ABI = [ 
    "function setSubnodeRecord(bytes32 parentNode, string label, address owner, address resolver, uint64 ttl, uint32 fuses, uint64 expiry) external",
    "function setResolver(bytes32 node, address resolver) external"
];

const PARENT_NODE = "0x53f321b5af060eaa6a20753998a1e6a957e7ffa9f1e8632ab1ff2131297b69c7";
const OWNER = "0xB1061f26eDcAD70d33ea4681d96e18F9B5316791";
const RESOLVER = "0x8948458626811dd0c23EB25Cc74291247077cC51";
const TTL = 0;
const FUSES = 0;
const EXPIRY = 0;


// Clean up name input to ensure it is subdomain suitable
function formatter(name) {
    return name
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9-]/g, '') // Remove unsupported characters
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Get the address of the subdomain node
export async function getNode(txHash) {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt || receipt.logs.length < 4 || receipt.logs[3].topics.length < 2) {
        throw new Error("Topic 1 not found in fourth transaction logs.");
    }

    return receipt.logs[3].topics[1];
}

// Function to create subdomain
export default async function createSubdomain(name, agentID) {
    try {

        name = formatter(name);

        // Load wallet and provider
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Replace with your RPC URL
        const wallet = new ethers.Wallet(process.env.WALLET, provider);
        
        // Connect to contract
        const nameWrapper = new ethers.Contract(NAME_WRAPPER_ADDRESS, NAME_WRAPPER_ABI, wallet);

        console.log(`Creating subdomain: ${name}.${process.env.DOMAIN}`);

        // Send transaction
        const tx = await nameWrapper.setSubnodeRecord(
            PARENT_NODE, 
            name, 
            OWNER, 
            RESOLVER, 
            TTL, 
            FUSES, 
            EXPIRY
        );

        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Subdomain ${name}.${process.env.DOMAIN} created successfully!`);

        // Get node from transaction
        const node = await getNode(tx.hash);
        console.log(`Node extracted: ${node}`);

        // Set resolver for the subdomain to public resolver contract
        const resolverTx = await nameWrapper.setResolver(node, PUBLIC_RESOLVER_ADDRESS);
        console.log(`Setting resolver: ${resolverTx.hash}`);
        await resolverTx.wait();
        console.log(`Resolver set successfully for node: ${node}`);

        // Firebase update
        const subdomain = `${name}.${process.env.DOMAIN}`;
        await db.ref(`Judge-Agent/${agentID}/ens`).set({ 
            subdomain, 
            node 
        });

        console.log(`db updated: Judge-Agent/${agentID}/ens -> { subdomain: ${subdomain}, node: ${node} }`);

        return subdomain;

    } catch (error) {
        console.error("Error creating subdomain:", error);
    }
}

