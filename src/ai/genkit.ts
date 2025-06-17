import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY, // Add your API key here
    })
  ],
  model: 'googleai/gemini-2.0-flash',
});
