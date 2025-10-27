'use server';

/**
 * @fileOverview Generates a smart title for a chat based on its content.
 *
 * - smartChatTitle - An async function that takes the chat history as input and returns a suggested title.
 * - SmartChatTitleInput - The input type for the smartChatTitle function, an array of messages.
 * - SmartChatTitleOutput - The output type, a string representing the suggested chat title.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartChatTitleInputSchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })
).describe('The history of messages in the chat.');
export type SmartChatTitleInput = z.infer<typeof SmartChatTitleInputSchema>;

const SmartChatTitleOutputSchema = z
  .string()
  .describe('A suggested title for the chat based on its content.');
export type SmartChatTitleOutput = z.infer<typeof SmartChatTitleOutputSchema>;

export async function smartChatTitle(input: SmartChatTitleInput): Promise<SmartChatTitleOutput> {
  return smartChatTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartChatTitlePrompt',
  input: {schema: SmartChatTitleInputSchema},
  output: {schema: SmartChatTitleOutputSchema},
  prompt: `You are an AI assistant that helps users name their chats based on the content of the chat.

Given the chat history, suggest a short but descriptive title for the chat.

Chat history:
{{#each $input}}
{{this.role}}: {{this.content}}
{{/each}}

Suggested chat title: `,
});

const smartChatTitleFlow = ai.defineFlow(
  {
    name: 'smartChatTitleFlow',
    inputSchema: SmartChatTitleInputSchema,
    outputSchema: SmartChatTitleOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `Summarize this chat history in 5 words or less to name the chat: ${JSON.stringify(input)}`
    });
    return text!;
  }
);
