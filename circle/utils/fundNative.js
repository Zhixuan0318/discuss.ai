import { v4 as uuidv4 } from 'uuid';
import { cipher } from '../utils/cipher.js';
import { waitForTransactionCompletion } from './waitForTransactionCompletion.js';

const FUNDING_AMOUNTS = {
    "UNI-SEPOLIA": ["0.003"],
    "ETH-SEPOLIA": ["0.003"],
    "ARB-SEPOLIA": ["0.003"],
    "MATIC-AMOY": ["0.05"],
    "AVAX-FUJI": ["0.005"]
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

export default async function fundNative(walletID, blockchain, destinationAddress) {
    const amounts = FUNDING_AMOUNTS[blockchain];
  
    const idempotencyKey = uuidv4();
    const entitySecretCiphertext = await cipher();
  
    const requestBody = {
      walletId: walletID,
      blockchain: blockchain,
      entitySecretCiphertext: entitySecretCiphertext,
      destinationAddress: destinationAddress,
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



