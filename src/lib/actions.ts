'use server';

import { chat } from '@/ai/flows/chat';
import type { Message } from '@/lib/types';

export async function sendMessage(
  allMessages: Message[]
): Promise<{ content: string } | undefined> {
  if (!allMessages || allMessages.length === 0) {
    return;
  }

  // The user's message is the last one in the array
  const userMessage = allMessages[allMessages.length - 1];

  // The history is all messages except the last one
  const history = allMessages.slice(0, -1);

  try {
    const aiResponse = await chat({
      history: history,
      message: userMessage.content,
    });
    return { content: aiResponse };
  } catch (error) {
    console.error('Error in sendMessage action:', error);
    if (error instanceof Error) {
        return { content: `Error from AI: ${error.message}` };
    }
    return { content: 'An unknown error occurred while contacting the AI.' };
  }
}
