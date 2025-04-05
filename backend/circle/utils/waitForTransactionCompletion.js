// Function to wait for a transaction to complete wih per second polling
export async function waitForTransactionCompletion(transactionID) {

    console.log(`Checking transaction ${transactionID} status every second`);

    while (true) {
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
        const transactionState = responseData.data.transaction.state;

        console.log(`Transaction ${transactionID} status: ${transactionState}`);

        if (transactionState === "COMPLETE" || transactionState === "CONFIRMED") {
            return;
        } else if (transactionState === "FAILED") {
            throw new Error(`Transaction ${transactionID} failed.`);
        }

        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}