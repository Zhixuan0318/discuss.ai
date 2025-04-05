import { v4 as uuidv4 } from 'uuid';
import { cipher } from '../utils/cipher.js';
import { waitForTransactionCompletion } from './waitForTransactionCompletion.js';

const USDC_CONTRACT_ADDRESSES = {
    "UNI-SEPOLIA": "0x31d0220469e10c4E71834a79b1f276d740d3768F",
    "ETH-SEPOLIA": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    "ARB-SEPOLIA": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    "MATIC-AMOY": "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
    "AVAX-FUJI": "0x5425890298aed601595a70ab815c96711a31bc65"
};

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

export async function basicTransfer(walletID, blockchain, destinationAddress, amounts) {
    const tokenAddress = USDC_CONTRACT_ADDRESSES[blockchain];
    if (!tokenAddress) {
      throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  
    const idempotencyKey = uuidv4();
    const entitySecretCiphertext = await cipher();
  
    const requestBody = {
      walletId: walletID,
      blockchain: blockchain,
      entitySecretCiphertext: entitySecretCiphertext,
      destinationAddress: destinationAddress,
      tokenAddress: tokenAddress,
      amounts: amounts,
      idempotencyKey: idempotencyKey,
      feeLevel:'LOW'
    };
  
    const response = await fetch('https://api.circle.com/v1/w3s/developer/transactions/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
  
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`Transfer failed: ${errorResponse.message}`);
    }
  
    const responseData = await response.json();
    const transactionId = responseData.data.id;

    await waitForTransactionCompletion(transactionId);
    const transactionHash = await fetchTxHash(transactionId);

    return transactionHash;
}



