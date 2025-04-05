import { put } from "@vercel/blob";

/**
 * Stores an avatar image in Vercel Blob storage.
 * @param {string} agentID - The unique identifier for the agent.
 * @param {ArrayBuffer} arrayBuffer - The image data as an ArrayBuffer.
 * @returns {Promise<string>} - The public URL of the stored avatar.
 */
export default async function storeAvatar(agentID, arrayBuffer) {
  if (!agentID || !arrayBuffer) {
    throw new Error("agentID and arrayBuffer are required.");
  }

  const filePath = `avatar/${agentID}.png`;

  const blob = await put(filePath, arrayBuffer, {
    access: "public",
    contentType: "image/png",
  });

  return blob.url; // Returns the public URL of the stored image
}
