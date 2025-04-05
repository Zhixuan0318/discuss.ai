import { v4 as uuidv4 } from 'uuid';
import { cipher } from './cipher.js';
import Web3 from 'web3';
import { waitForTransactionCompletion } from './waitForTransactionCompletion.js';

const RPC_PROVIDERS = {
    "UNI-SEPOLIA": `https://unichain-sepolia.infura.io/v3/${process.env.INFURA}`,
    "ETH-SEPOLIA": `https://sepolia.infura.io/v3/${process.env.INFURA}`,
    "ARB-SEPOLIA": `https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA}`,
    "MATIC-AMOY":  `https://polygon-amoy.infura.io/v3/${process.env.INFURA}`
};


const MESSENGER = {
    "UNI-SEPOLIA": "0x8ed94B8dAd2Dc5453862ea5e316A8e71AAed9782",
    "ETH-SEPOLIA": "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    "ARB-SEPOLIA": "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    "MATIC-AMOY": "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5"
};

const TRANSMITTER = {
    "UNI-SEPOLIA": "0xbc498c326533d675cf571B90A2Ced265ACb7d086",
    "ETH-SEPOLIA": "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    "ARB-SEPOLIA": "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872",
    "MATIC-AMOY": "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD"
};


const USDC_CONTRACT_ADDRESSES = {
    "UNI-SEPOLIA": "0x31d0220469e10c4E71834a79b1f276d740d3768F",
    "ETH-SEPOLIA": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    "ARB-SEPOLIA": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    "MATIC-AMOY": "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582"
};

const DOMAIN = {
    "UNI-SEPOLIA": 10,
    "ETH-SEPOLIA": 0,
    "ARB-SEPOLIA": 3,
    "MATIC-AMOY": 7
};

function getWeb3(chain) {
    const rpcUrl = RPC_PROVIDERS[chain];
    if (!rpcUrl) {
        throw new Error(`Unsupported blockchain: ${chain}`);
    }
    return new Web3(rpcUrl);
}


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
            (amount * 1_000_000).toString()
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

export async function burn(sourceChain, destChain, amount, destAddress, walletID) {

    const web3 = getWeb3(sourceChain);

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

    const encodedDestinationAddress = web3.eth.abi.encodeParameter('address', destAddress);

    const idempotencyKey = uuidv4();
    const entitySecretCiphertext = await cipher();

    const requestBody = {
        abiFunctionSignature: "depositForBurn(uint256,uint32,bytes32,address)",
        abiParameters: [
            (amount * 1_000_000).toString(),
            domain,
            encodedDestinationAddress,
            usdcContract
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
    return responseData.data.id;
}

export async function attest(transactionID, sourceChain) {

    const web3 = getWeb3(sourceChain);

    //Fetch the transaction object from Circle's API
    const transactionResponse = await fetch(`https://api.circle.com/v1/w3s/transactions/${transactionID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TEST_API_KEY}`
        }
    });

    if (!transactionResponse.ok) {
        throw new Error(`Failed to fetch transaction: ${transactionResponse.statusText}`);
    }

    const transactionData = await transactionResponse.json();

    const transactionHash = transactionData.data.transaction.txHash;

    if (!transactionHash) {
        throw new Error('Tx hash not found in response. Transaction state might not yet confirmed.');
    }

    //Decode messageBytes and compute messageHash
    const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
    const eventTopic = web3.utils.keccak256('MessageSent(bytes)');
    
    const log = transactionReceipt.logs.find(log => log.topics[0] === eventTopic);
    if (!log) {
        throw new Error('MessageSent event not found in transaction logs');
    }

    const messageBytes = web3.eth.abi.decodeParameters(['bytes'], log.data)[0];

    const messageHash = web3.utils.keccak256(messageBytes);

    if (!messageHash) {
        throw new Error('Failed to compute message hash from messageBytes');
    }

    //Fetch Attestation Signature from Circle's Iris API

    let attestationResponse = { status: 'pending' };

    while (attestationResponse.status !== 'complete') {
        const attestationRequest = await fetch(`https://iris-api-sandbox.circle.com/attestations/${messageHash}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        attestationResponse = await attestationRequest.json();

        if (attestationResponse.status === 'failed') {
            throw new Error('Attestation failed');
        }

        // Wait 2 seconds before retrying (rate limit)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {messageBytes, attestationResponse};
}

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

export default async function v1cctp(sourceChain, sourceWalletID, destChain, destWalletID, destWalletAddress, amount) {
    try {
        console.log("Starting CCTP Transfer...");

        // Step 1: Approve
        console.log("Approving USDC transfer...");
        const approveResponse = await approve(sourceChain, amount, sourceWalletID);
        await waitForTransactionCompletion(approveResponse.data.id);
        console.log("Approval completed.");

        // Step 2: Burn
        console.log("Burning USDC...");
        const burnTransactionID = await burn(sourceChain, destChain, amount, destWalletAddress, sourceWalletID);
        await waitForTransactionCompletion(burnTransactionID);
        console.log("Burn completed.");

        // Step 3: Attest
        console.log("Fetching attestation...");
        const { messageBytes, attestationResponse } = await attest(burnTransactionID, sourceChain);
        console.log("Attestation received.");

        // Step 4: Mint
        console.log("Minting USDC...");
        const txReponse = await mint(messageBytes, attestationResponse.attestation, destChain, destWalletID);
        const txID = txReponse.data.id;
        await waitForTransactionCompletion(txID);
        console.log("Minting completed. CCTP Transfer successful!");

        return txID;

    } catch (error) {
        console.error("CCTP Transfer failed:", error);
        throw error;
    }
}




