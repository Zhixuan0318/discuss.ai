import forge from 'node-forge';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.TEST_API_KEY,
  entitySecret: process.env.ENTITY_SECRET
});

export async function cipher() {
  // Await the public key response
  const response = await client.getPublicKey();
  
  // Extract the actual public key string from response.data.publicKey
  const publicKeyPem = response.data.publicKey.replace(/\\n/g, '\n').trim();

  const entitySecret = forge.util.hexToBytes(process.env.ENTITY_SECRET);
  
  let publicKey;
  try {
    publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  } catch (error) {
    console.error("Failed to parse PUBLIC_KEY. Ensure it is correctly formatted.", error);
    throw error;
  }

  const encryptedData = publicKey.encrypt(entitySecret, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() },
  });

  return forge.util.encode64(encryptedData);
}
