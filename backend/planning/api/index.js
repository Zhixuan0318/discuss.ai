import { generateQueries } from '../planner.js';
import { webLoader } from '../utils/web-loader.js';

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Authenticate request
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }

  const { url, numberOfQueries } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  if (numberOfQueries && typeof numberOfQueries !== 'number') {
    return res.status(400).json({ error: 'numberOfQueries must be a number' });
  }

  try {
    // Load the markdown content from the given URL
    const document = await webLoader(url);
    
    if (!document || !document.pageContent) {
      return res.status(500).json({ error: 'Failed to fetch markdown content from the URL' });
    }

    // Pass extracted markdown content to generateQueries
    const queries = await generateQueries(document.pageContent, numberOfQueries);
    
    return res.status(200).json(queries);
  } catch (error) {
    console.error('Error generating queries:', error);
    return res.status(500).json({ error: 'Planner Agent encountered an issue generating queries!' });
  }
}
