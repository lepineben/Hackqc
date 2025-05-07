// This file should ONLY be imported in server-side code (API routes)
// It handles OpenAI client initialization for server-side API calls
import { OpenAI } from 'openai';

/**
 * Get an OpenAI client instance - ONLY FOR SERVER USE
 * This function creates a new OpenAI client with the API key from environment
 * It will only work on the server side and will return null on the client
 */
const getOpenAIClient = (): OpenAI | null => {
  // Only create the client on the server side
  if (typeof window === 'undefined') {
    try {
      // Check for valid API key first
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === '') {
        console.warn('Invalid or missing OpenAI API key');
        return null;
      }
      
      // Create the OpenAI client with better logging and debug
      console.log(`Initializing OpenAI client with API key ${apiKey.substring(0, 5)}...`);
      
      // Create the OpenAI client
      return new OpenAI({
        apiKey: apiKey,
        timeout: 30000, // Longer timeout for image processing
        maxRetries: 3,  // Retry failed requests
      });
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      return null;
    }
  }
  return null;
};

// Export the client instance for API routes
export const openai = getOpenAIClient();