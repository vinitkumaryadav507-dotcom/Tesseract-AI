'use server';

/**
 * @fileOverview This flow enhances a user's query to improve the quality of the AI's response.
 *
 * - enhanceUserQuery - An async function that takes a user query as input and returns an enhanced version of it.
 * - EnhanceUserQueryInput - The input type for the enhanceUserQuery function, a string representing the original query.
 * - EnhanceUserQueryOutput - The output type, a string representing the enhanced query.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceUserQueryInputSchema = z
  .string()
  .describe('The original query from the user.');
export type EnhanceUserQueryInput = z.infer<typeof EnhanceUserQueryInputSchema>;

const EnhanceUserQueryOutputSchema = z
  .string()
  .describe('The enhanced query to be used for generating the AI response.');
export type EnhanceUserQueryOutput = z.infer<typeof EnhanceUserQueryOutputSchema>;

export async function enhanceUserQuery(input: EnhanceUserQueryInput): Promise<EnhanceUserQueryOutput> {
  return enhanceUserQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceUserQueryPrompt',
  input: {schema: EnhanceUserQueryInputSchema},
  output: {schema: EnhanceUserQueryOutputSchema},
  prompt: `You are an AI assistant designed to improve user queries to get more accurate answers from a chatbot.

Original query: {{{$input}}}

Enhanced query:`,
});

const enhanceUserQueryFlow = ai.defineFlow(
  {
    name: 'enhanceUserQueryFlow',
    inputSchema: EnhanceUserQueryInputSchema,
    outputSchema: EnhanceUserQueryOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `Improve the following user query to get more accurate answers from a chatbot: ${input}`
    });
    return text!;
  }
);
