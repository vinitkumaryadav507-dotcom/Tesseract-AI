'use server';

/**
 * @fileOverview Automatically names new chats based on the topic of the first user question.
 *
 * - autoNameChat - An async function that takes the first user message as input and returns a suggested chat name.
 * - AutoNameChatInput - The input type for the autoNameChat function, a string representing the first message.
 * - AutoNameChatOutput - The output type, a string representing the suggested chat name.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoNameChatInputSchema = z
  .string()
  .describe('The first message from the user in a chat.');
export type AutoNameChatInput = z.infer<typeof AutoNameChatInputSchema>;

const AutoNameChatOutputSchema = z
  .string()
  .describe('A suggested name for the chat based on the first message.');
export type AutoNameChatOutput = z.infer<typeof AutoNameChatOutputSchema>;

export async function autoNameChat(input: AutoNameChatInput): Promise<AutoNameChatOutput> {
  return autoNameChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoNameChatPrompt',
  input: {schema: AutoNameChatInputSchema},
  output: {schema: AutoNameChatOutputSchema},
  prompt: `You are an AI assistant that helps users name their chats based on the first message in the chat.

Given the first message, suggest a short but descriptive name for the chat.

First message: {{{$input}}}

Suggested chat name:`,
});

const autoNameChatFlow = ai.defineFlow(
  {
    name: 'autoNameChatFlow',
    inputSchema: AutoNameChatInputSchema,
    outputSchema: AutoNameChatOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `Summarize this chat message in 5 words or less to name the chat: ${input}`
    });
    return text!;
  }
);
