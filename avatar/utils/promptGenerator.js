import { ChatOpenAI } from '@langchain/openai';
import promptTemplate from './promptTemplate.js';
import db from '../config.js';

// Initialize the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

// Initialize the ChatOpenAI model
const model = new ChatOpenAI({
  apiKey: openaiApiKey,
  model: 'gpt-3.5-turbo',
  temperature: 0,
});

export default async function promptGenerator(agentID) {
    try {
      // Retrieve light_lore from db
      const snapshot = await db.ref(`Judge-Agent/${agentID}/light_lore`).once('value');
      const lore = snapshot.val();
  
      if (!lore) {
        throw new Error('No lore found for the given agentID.');
      }
  
      // Format the prompt with the retrieved lore
      const prompt = await promptTemplate.format({ lore });
      
      // Invoke the model with the formatted prompt
      const response = await model.invoke(prompt);
    
      return response.content;
    } catch (error) {
      console.error('Error generating prompt:', error);
      return null;
    }
}