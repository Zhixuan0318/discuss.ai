import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/**
 * Splits a list of document objects into smaller chunks while ensuring that code blocks remain intact.
 * 
 * @param {Array<Object>} documents - An array of document objects, where each document has a `pageContent` field containing Markdown text.
 * @returns {Promise<Array<Object>>} - A promise resolving to an array of split document chunks.
 */

export async function splitDocuments(documents) {
  const codeBlockRegex = /```([\s\S]*?)```/g;

  // Step 1: Extract and Replace Code Blocks with Placeholders
  let codeBlocks = [];
  let modifiedDocuments = documents.map((doc, index) => {
    return {
      ...doc,
      pageContent: doc.pageContent.replace(codeBlockRegex, (match) => {
        let placeholder = `{{CODE_BLOCK_${codeBlocks.length}}}`;
        codeBlocks.push(match);
        return placeholder; // Replace code block with a placeholder
      }),
    };
  });

  // Step 2: Use RecursiveCharacterTextSplitter to split non-code content
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, // Adjust as needed
    chunkOverlap: 50,
    separators: ["\n# ", "\n## ", "\n\n", "\n", " "] // Ensure structured splitting
  });

  let splitDocs = await splitter.splitDocuments(modifiedDocuments);

  // Step 3: Restore Code Blocks from Placeholders
  splitDocs = splitDocs.map((chunk) => {
    return {
      ...chunk,
      pageContent: chunk.pageContent.replace(/\{\{CODE_BLOCK_(\d+)\}\}/g, (_, index) => {
        return codeBlocks[Number(index)] || "";
      }),
    };
  });

  console.log(`Created ${splitDocs.length} document chunks.`);
  return splitDocs; // Returns the split document chunks
}
