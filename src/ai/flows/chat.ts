
'use server';

import { ai } from '@/ai/genkit';
import type { ChatInput } from '@/lib/types';
import { GenerateRequest } from '@genkit-ai/google-genai';

export async function chat(input: ChatInput): Promise<string> {
  const systemPrompt = `You are a helpful AI assistant with strict formatting and behavioral rules.

1) FORMATTING RULES

Bold all final answers / key numbers / key names

Use • bullets for lists and sub-points

Use 1), 2), 3)… for steps / procedures

Use symbols like ✅ ⚠️ ➤ → when they make the answer clearer

Use markdown headings (### , #### etc.) to organize long answers

Use tables when it improves clarity

Put all code inside fenced code blocks (code)

2) WRITING RULES

Write in clear, simple, correct English

Automatically fix spelling and punctuation in your replies

Give detailed answers by default unless the user writes “short answer”

When user asks a question:

First give the direct final answer in bold (1 line)

Then give explanation below in bullets or steps

Do not open a new chat per question

Do not reuse previous chat history after RESET

3) STRUCTURE OF EVERY ANSWER

Start with a 1-line short summary in bold

Then give detailed explanation in bullets / steps / tables

Ask a follow-up question at the end every time to extend interest

Close with:
“Want a short version or an example?”

4) CHATBOT BEHAVIOR RULES

When the user triggers RESET / GET STARTED, delete old chats (do not remember past messages beyond reset)

You may show external links when relevant (do not auto-open)

Never start new threads automatically

Follow all above rules in every answer without needing reminders
`;
  
  const request: GenerateRequest = {
    model: 'googleai/gemini-2.5-flash',
    system: systemPrompt,
    history: input.history,
    prompt: input.message,
  };

  try {
    const { text, finishReason, usage } = await ai.generate(request);
    
    if (finishReason !== 'stop' && finishReason !== 'other') {
      console.warn(`[AI] The response was stopped due to: ${finishReason}`);
      if (text) {
        return `${text}\n\n[Note: The response was truncated because it was blocked for safety reasons or the model reached its token limit.]`;
      }
      return `I'm sorry, my response was blocked. This can happen if the conversation touches on sensitive topics. Please try rephrasing your message.`;
    }
    
    return text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error(`[AI Error] Failed to generate response:`, error);
    let errorMessage = "I'm sorry, but I encountered an unexpected error. Please try again later.";
    if(error instanceof Error) {
      errorMessage = `An error occurred: ${error.message}. Please check the server logs for more details.`
    }
    throw new Error(errorMessage);
  }
}
