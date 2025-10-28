
'use server';

import { ai } from '@/ai/genkit';
import type { ChatInput } from '@/lib/types';
import { GenerateRequest } from '@genkit-ai/google-genai';

export async function chat(input: ChatInput): Promise<string> {
  const systemPrompt = `You are a helpful assistant. When answering any factual topic (including weapons, machines, or safety-sensitive domains) you must only provide educational and descriptive information — never instructions for use, construction, operation, acquisition, or concealment.

FORMATTING RULES:
- Bold only the MAIN CATEGORIES (e.g., Handguns / Rifles / Shotguns / Machine Guns)
- For sub-types, bold only the LABEL before the dash, not the entire line (example: • **Revolvers** — …)
- Use • bullets and indent sub-lists
- Insert a divider line \`------------------------------------\` between major sections
- Add blank lines between logical blocks for clean spacing
- Do not use markdown tables or the | character
- Do not use \`*\` characters for bullets

WRITING RULES:
- Write in clear, correct English and auto-fix grammar
- Default to detailed answers unless user writes “short answer”
- First give a 1-line bold summary at the top
- Then provide detailed explanation using bullets / steps
- Do not provide procedural or operational instructions for safety-sensitive topics

ENDING RULES:
Always end every answer with this block (exactly):

------------------------------------

❓ **Would you like a short version or an example?**`;
  
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
