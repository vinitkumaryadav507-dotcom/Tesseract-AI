'use server';
/**
 * @fileOverview A flow that suggests relevant topics based on previous chats.
 *
 * - suggestTopics - An async function that takes chat history as input and returns topic suggestions.
 * - SuggestTopicsInput - The input type for the suggestTopics function, an array of strings representing chat history.
 * - SuggestTopicsOutput - The output type, an array of strings representing suggested topics.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTopicsInputSchema = z.object({
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the chat.'),
});
export type SuggestTopicsInput = z.infer<typeof SuggestTopicsInputSchema>;

const SuggestTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe('Suggested topics based on chat history.'),
});
export type SuggestTopicsOutput = z.infer<typeof SuggestTopicsOutputSchema>;

export async function suggestTopics(input: SuggestTopicsInput): Promise<SuggestTopicsOutput> {
  return suggestTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTopicsPrompt',
  input: {schema: SuggestTopicsInputSchema},
  output: {schema: SuggestTopicsOutputSchema},
  prompt: `You are an AI assistant that suggests relevant topics based on the user's previous chat history.

Given the following chat history, suggest three relevant topics for the user to explore next.

Chat History:
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

Suggested Topics:
`,
});

const suggestTopicsFlow = ai.defineFlow(
  {
    name: 'suggestTopicsFlow',
    inputSchema: SuggestTopicsInputSchema,
    outputSchema: SuggestTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
