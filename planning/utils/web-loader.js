import { Document } from "langchain/document";
import { checkMediumRedirect } from "./redirect-handler.js";

/**
 * Pass in URL to fetch a markdown version of it via the API. Returns a LangChain Document.
 * @param {string} url - The URL to convert to markdown.
 * @returns {Promise<Document|null>} - A LangChain Document with content and metadata.
 */

export async function webLoader(url, retry = true) {
  try {
    const apiUrl = `https://llm-url2md.vercel.app/api/?url=${encodeURIComponent(url)}`;

    // Call the API to get markdown content
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
    }

    const markdownContent = await response.text();

    // Check if the response contains a redirection message (A problem with Medium)
    const redirectedUrl = checkMediumRedirect(markdownContent);
    if (redirectedUrl && retry) {
      console.warn(`🔄 Redirect detected. Retrying with new URL: ${redirectedUrl}`);
      return webLoader(redirectedUrl, false); // Retry with new URL, but only once
    }

    // Create and return a LangChain Document
    return new Document({
      pageContent: markdownContent,
      metadata: { source: url },
    });
  } catch (error) {
    console.error(`❌ Error fetching markdown for ${url}:`, error);
    return null;
  }
}
