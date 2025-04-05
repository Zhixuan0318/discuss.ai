// Function to fetch txhash after tx complete or confirmed
export default async function fetchTxHash(transactionID) {

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