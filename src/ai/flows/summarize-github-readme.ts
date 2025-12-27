// Summarizes the tech stack and description of a GitHub README file using Gemini.

'use server';

/**
 * @fileOverview A GitHub README summarization AI agent.
 *
 * - summarizeGithubReadme - A function that handles the README summarization.
 * - SummarizeGithubReadmeInput - The input type for the summarizeGithubReadme function.
 * - SummarizeGithubReadmeOutput - The return type for the summarizeGithubReadme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGithubReadmeInputSchema = z.object({
  readmeContent: z.string().describe('The content of the GitHub README.md file.'),
});

export type SummarizeGithubReadmeInput = z.infer<typeof SummarizeGithubReadmeInputSchema>;

const SummarizeGithubReadmeOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the tech stack and project description from the README.'),
});

export type SummarizeGithubReadmeOutput = z.infer<typeof SummarizeGithubReadmeOutputSchema>;

export async function summarizeGithubReadme(input: SummarizeGithubReadmeInput): Promise<SummarizeGithubReadmeOutput> {
  return summarizeGithubReadmeFlow(input);
}

const summarizeGithubReadmePrompt = ai.definePrompt({
  name: 'summarizeGithubReadmePrompt',
  input: {schema: SummarizeGithubReadmeInputSchema},
  output: {schema: SummarizeGithubReadmeOutputSchema},
  prompt: `Summarize the tech stack and project description from the following README content:\n\n{{{readmeContent}}}`,
  config: { // Add safety settings to potentially reduce model blockages on diverse READMEs
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  }
});

const summarizeGithubReadmeFlow = ai.defineFlow(
  {
    name: 'summarizeGithubReadmeFlow',
    inputSchema: SummarizeGithubReadmeInputSchema,
    outputSchema: SummarizeGithubReadmeOutputSchema,
  },
  async input => {
    const result = await summarizeGithubReadmePrompt(input);
    const output = result.output;
    const rawResponse: any = (result as any).response;
    if (output) {
      return output;
    } else {
      const finishReason = rawResponse?.candidates?.[0]?.finishReason;
      const safetyRatings = rawResponse?.candidates?.[0]?.safetyRatings;
      let rawOutputText = 'No raw text found in response parts.';
      const parts = rawResponse?.candidates?.[0]?.message?.parts ?? [];
      if (Array.isArray(parts) && parts.length > 0) {
        rawOutputText = parts.map((p: any) => p?.text ?? '').join('');
      }
      
      console.error(
        "Genkit flow 'summarizeGithubReadmeFlow' did not produce a structured output.",
        "Input README (first 100 chars):", input.readmeContent.substring(0, 100) + (input.readmeContent.length > 100 ? "..." : ""),
        "Finish reason:", finishReason,
        "Safety ratings:", JSON.stringify(safetyRatings, null, 2),
        "Raw output text from model:", rawOutputText,
        "Full raw response:", JSON.stringify(rawResponse, null, 2) 
      );
      // This error will be caught by summarizeProjectReadme in ai-actions.ts
      throw new Error(`AI failed to summarize README. Finish reason: ${finishReason}. Check server logs for details.`);
    }
  }
);
