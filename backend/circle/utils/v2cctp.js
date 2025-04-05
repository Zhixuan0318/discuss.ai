import { v4 as uuidv4 } from 'uuid';
import { cipher } from '../utils/cipher.js';
import { waitForTransactionCompletion } from './waitForTransactionCompletion.js';

// Contract addresses
const MESSENGER = {
    "ETH-SEPOLIA": "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    "AVAX-FUJI": "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa"
};

const TRANSMITTER = {
    "ETH-SEPOLIA": "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    "AVAX-FUJI": "0xe737e5cebeeba77efe34d4aa090756590b1ce275"
};

const USDC_CONTRACT_ADDRESSES = {
    "ETH-SEPOLIA": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    "AVAX-FUJI": "0x5425890298aed601595a70ab815c96711a31bc65"
};

// Domain mappings
const DOMAIN = {
    "ETH-SEPOLIA": 0,
    "AVAX-FUJI": 1,
};

export async function approve(sourceChain, amount, walletID) {
    const contractAddress = USDC_CONTRACT_ADDRESSES[sourceChain];
    if (!contractAddress) {
        throw new Error(`Unsupported blockchain: ${sourceChain}`);
    }

    const tokenMessenger = MESSENGER[sourceChain];
    if (!tokenMessenger) {
        throw new Error(`No messenger found: ${sourceChain}`);
    }

    const idempotencyKey = uuidv4();
    const entitySecretCiphertext = await cipher();

    const requestBody = {
        abiFunctionSignature: "approve(address,uint256)",
        abiParameters: [
            tokenMessenger,
            amount * 1_000_000
        ],
        idempotencyKey: idempotencyKey,
        contractAddress: contractAddress,
        feeLevel: "LOW",
        walletId: walletID,
        entitySecretCiphertext: entitySecretCiphertext
    };

    const response = await fetch('https://api.circle.com/v1/w3s/developer/transactions/contractExecution', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Approval failed: ${errorResponse.message}`);
    }

    const responseData = await response.json();
    return responseData;
}

// Burn USDC: TokenMessengerV2 contract
export async function burn(sourceChain, destChain, amount, destAddress, walletID) {

    const contractAddress = MESSENGER[sourceChain];
    if (!contractAddress) {
        throw new Error(`Unsupported messenger on blockchain: ${sourceChain}`);
    }

    const usdcContract = USDC_CONTRACT_ADDRESSES[sourceChain];
    if (!usdcContract) {
        throw new Error(`No USDC contract found for source chain: ${sourceChain}`);
    }

    const domain = DOMAIN[destChain];
    if (domain === undefined) {
        throw new Error(`Unsupported domain on blockchain: ${destChain}`);
    }

    // Convert destination address to bytes32
    const encodedDestinationAddress = `0x${destAddress.replace(/^0x/, '').padStart(64, '0')}`;

    const idempotencyKey = uuidv4();
    const entitySecretCiphertext = await cipher();
    const minFinalityThreshold = 500;
    const maxFee = 500;
    const destinationCaller = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const requestBody = {
        abiFunctionSignature: "depositForBurn(uint256,uint32,bytes32,address,bytes32,uint256,uint32)",
        abiParameters: [
            amount * 1_000_000,
            domain,
            encodedDestinationAddress,
            usdcContract,
            destinationCaller,
            maxFee,
            minFinalityThreshold
        ],
        idempotencyKey: idempotencyKey,
        contractAddress: contractAddress,
        feeLevel: "LOW",
        walletId: walletID,
        entitySecretCiphertext: entitySecretCiphertext
    };

    const response = await fetch('https://api.circle.com/v1/w3s/developer/transactions/contractExecution', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Burn failed: ${errorResponse.message}`);
    }

    const responseData = await response.json();
    const txID = responseData.data.id;

    await waitForTransactionCompletion(txID);

    const txHash = await fetchTxHash(txID);
    return txHash;
}

// Retrieve attestation
export async function attest(transactionHash, sourceChain) {
    
    const domain = DOMAIN[sourceChain];
    const url = `https://iris-api-sandbox.circle.com/v2/messages/${domain}?transactionHash=${transactionHash}`;

    while (true) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.TEST_API_KEY}`
            }
        });

        if (response.status === 404) {
            console.log("Waiting for attestation...");
        } else {

            const data = await response.json();

            if (data?.messages?.[0]?.status === "complete") {

                console.log("Attestation retrieved successfully!");
                return data.messages[0];

            }
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

//Mint USDC: Use transmitter V2
export async function mint(messageBytes, attestation, destChain, walletID) {
    const contractAddress = TRANSMITTER[destChain];
    if (!contractAddress) {
        throw new Error(`Unsupported blockchain: ${destChain}`);
    }

    const idempotencyKey = uuidv4();
    const entitySecretCiphertext = await cipher();

    const requestBody = {
        abiFunctionSignature: "receiveMessage(bytes,bytes)",
        abiParameters: [messageBytes, attestation],
        idempotencyKey: idempotencyKey,
        contractAddress: contractAddress,
        feeLevel: "LOW",
        walletId: walletID,
        entitySecretCiphertext: entitySecretCiphertext
    };

    try {
        const response = await fetch('https://api.circle.com/v1/w3s/developer/transactions/contractExecution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TEST_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Mint USDC failed: ${errorResponse.message}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error("Error in mint USDC function:", error);
        throw error;
    }
}

// Function to fetch txhash after tx complete or confirmed
async function fetchTxHash(transactionID) {

    const response = await fetch(`https://api.circle.com/v1/w3s/transactions/${transactionID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_API_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch transaction status: ${response.statusText}`);
    }

    const responseData = await response.json();
    const txHash = responseData.data.transaction.txHash;

    return txHash;
}

export default async function v2cctp(sourceChain, sourceWalletID, destChain, destWalletID, destWalletAddress, amount) {
    try {
        console.log("Starting CCTP V2 Transfer...");

        // Step 1: Approve
        console.log("Approving USDC transfer...");
        const approveResponse = await approve(sourceChain, amount, sourceWalletID);
        await waitForTransactionCompletion(approveResponse.data.id);
        console.log("Approval completed.");

        // Step 2: Burn
        console.log("Burning USDC...");
        const burnTxHash = await burn(sourceChain, destChain, amount, destWalletAddress, sourceWalletID);
        console.log("Burn completed.");

        // Step 3: Attest
        console.log("Fetching attestation...");
        const attestation = await attest(burnTxHash, sourceChain);
        console.log("Attestation received.");

        // Step 4: Mint
        console.log("Minting USDC...");
        const messageBytes = attestation.message;
        const finalAttestation = attestation.attestation;
        const txReponse = await mint(messageBytes, finalAttestation, destChain, destWalletID);
        const txID = txReponse.data.id;
        await waitForTransactionCompletion(txID);
        console.log("Minting completed. CCTP V2 Transfer successful!");

        return txID;

    } catch (error) {
        console.error("CCTP Transfer failed:", error);
        throw error;
    }
}
