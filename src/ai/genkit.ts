import {genkit} from 'genkit/core';
import {googleAI} from '@genkit-ai/googleai';

/**
 * The `ai` object is a configured instance of Genkit.
 *
 * It is initialized with the Google AI plugin and a directory for storing prompts.
 * This instance is used throughout the application to define and run AI flows,
 * generate content, and manage AI-related tasks.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
    // Add other plugins like vector databases here if needed.
  ],
  // The directory where your .prompt files are stored.
  promptDir: './src/ai/prompts',
});
