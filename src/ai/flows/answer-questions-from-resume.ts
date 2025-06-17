// src/ai/flows/answer-questions-from-resume.ts
'use server';

/**
 * @fileOverview A question answering AI agent that extracts information from a structured CV.
 *
 * - answerQuestionsFromResume - A function that answers questions based on a resume.
 * - AnswerQuestionsFromResumeInput - The input type for the answerQuestionsFromResume function.
 * - AnswerQuestionsFromResumeOutput - The return type for the answerQuestionsFromResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsFromResumeInputSchema = z.object({
  resume: z.string().describe('The structured CV content.'),
  question: z.string().describe('The question to be answered.'),
});
export type AnswerQuestionsFromResumeInput = z.infer<typeof AnswerQuestionsFromResumeInputSchema>;

const AnswerQuestionsFromResumeOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the resume.'),
});
export type AnswerQuestionsFromResumeOutput = z.infer<typeof AnswerQuestionsFromResumeOutputSchema>;

export async function answerQuestionsFromResume(input: AnswerQuestionsFromResumeInput): Promise<AnswerQuestionsFromResumeOutput> {
  return answerQuestionsFromResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsFromResumePrompt',
  input: {schema: AnswerQuestionsFromResumeInputSchema},
  output: {schema: AnswerQuestionsFromResumeOutputSchema},
  prompt: `You are an AI assistant designed to answer questions about a person based on their resume.

  Resume:
  {{{resume}}}

  Question: {{question}}

  Answer:`,
});

const answerQuestionsFromResumeFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFromResumeFlow',
    inputSchema: AnswerQuestionsFromResumeInputSchema,
    outputSchema: AnswerQuestionsFromResumeOutputSchema,
  },
  async input => {
    const { output, response: rawResponse } = await prompt(input);
    if (output) {
      return output;
    } else {
      const finishReason = rawResponse.candidates[0]?.finishReason;
      const safetyRatings = rawResponse.candidates[0]?.safetyRatings;
      let rawOutputText = 'No raw text found in response parts.';
      if (rawResponse.candidates[0]?.message?.parts) {
        rawOutputText = rawResponse.candidates[0].message.parts.map(p => p.text).join('');
      }
      
      console.error(
        "Genkit flow 'answerQuestionsFromResumeFlow' did not produce a structured output.",
        "Finish reason:", finishReason,
        "Safety ratings:", JSON.stringify(safetyRatings, null, 2),
        "Raw output text from model:", rawOutputText,
        "Full raw response:", JSON.stringify(rawResponse, null, 2) 
      );
      throw new Error(`AI failed to generate a valid answer. Finish reason: ${finishReason}. Check server logs for more details.`);
    }
  }
);

